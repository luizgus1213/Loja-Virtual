import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import { Op } from "sequelize";
import { criarNotificacaoSePermitido } from "@/lib/notificacoes";
import CarrinhoItem from "@/models/CarrinhoItem";
import Carrinho from "@/models/Carrinho";
import Produto from "@/models/Produto";
import Pedido from "@/models/Pedido";
import PedidoItem from "@/models/PedidoItem";
import Endereco from "@/models/Endereco";
import Cupom from "@/models/Cupom";

import {
  gerarDataExpiracaoPedido,
  expirarPedidosPendentes,
} from "@/lib/pedidos";

import { verificarToken } from "@/lib/auth";

const TAMANHOS_VALIDOS = ["PP", "P", "M", "G", "GG"];
const QUANTIDADE_MAXIMA_POR_PRODUTO = 20;

const FRETES: any = {
  normal: 0,
  expresso: 25,
};

async function validarCupomCheckout(codigo: string, totalProdutos: number) {
  const cupom: any = await Cupom.findOne({
    where: {
      codigo: codigo.toUpperCase().trim(),
    },
  });

  if (!cupom) {
    throw new Error("Cupom não encontrado");
  }

  if (!cupom.ativo) {
    throw new Error("Cupom inativo");
  }

  if (cupom.data_expiracao) {
    const expiracao = new Date(cupom.data_expiracao);
    const agora = new Date();

    if (expiracao < agora) {
      throw new Error("Cupom expirado");
    }
  }

  if (
    cupom.uso_maximo !== null &&
    cupom.uso_maximo !== undefined &&
    Number(cupom.usos_atual || 0) >= Number(cupom.uso_maximo)
  ) {
    throw new Error("Limite de uso do cupom atingido");
  }

  if (totalProdutos < Number(cupom.valor_minimo_pedido || 0)) {
    throw new Error(
      `Pedido mínimo para este cupom é R$ ${Number(
        cupom.valor_minimo_pedido || 0,
      ).toFixed(2)}`,
    );
  }

  let desconto = 0;

  if (cupom.tipo === "porcentagem") {
    desconto = (totalProdutos * Number(cupom.valor || 0)) / 100;
  } else if (cupom.tipo === "fixo") {
    desconto = Number(cupom.valor || 0);
  } else {
    throw new Error("Tipo de cupom inválido");
  }

  if (desconto > totalProdutos) {
    desconto = totalProdutos;
  }

  return {
    cupom,
    desconto: Number(desconto.toFixed(2)),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método inválido",
    });
  }

  try {
    await expirarPedidosPendentes();

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        erro: "Não autenticado",
      });
    }

    const user: any = verificarToken(token);

    if (!user) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    const itensIdsRaw = req.body.itensIds;
    const enderecoId = Number(req.body.enderecoId);
    const freteTipo = String(req.body.freteTipo || "normal");
    const cupomCodigo = req.body.cupomCodigo
      ? String(req.body.cupomCodigo).trim()
      : null;

    if (!Array.isArray(itensIdsRaw) || itensIdsRaw.length === 0) {
      return res.status(400).json({
        erro: "Itens inválidos",
      });
    }

    if (itensIdsRaw.length > 50) {
      return res.status(400).json({
        erro: "Quantidade máxima de itens excedida",
      });
    }

    const itensIds = itensIdsRaw.map((id) => Number(id));

    const temIdInvalido = itensIds.some(
      (id) => !id || Number.isNaN(id) || !Number.isInteger(id),
    );

    if (temIdInvalido) {
      return res.status(400).json({
        erro: "Itens inválidos",
      });
    }

    const itensIdsUnicos = Array.from(new Set(itensIds));

    if (itensIdsUnicos.length !== itensIds.length) {
      return res.status(400).json({
        erro: "Itens duplicados",
      });
    }

    if (!enderecoId || Number.isNaN(enderecoId)) {
      return res.status(400).json({
        erro: "Selecione um endereço de entrega",
      });
    }

    if (!Object.keys(FRETES).includes(freteTipo)) {
      return res.status(400).json({
        erro: "Frete inválido",
      });
    }

    const endereco = await Endereco.findOne({
      where: {
        id: enderecoId,
        user_id: user.id,
      },
    });

    if (!endereco) {
      return res.status(403).json({
        erro: "Endereço inválido",
      });
    }

    const carrinho: any = await Carrinho.findOne({
      where: {
        user_id: user.id,
      },
    });

    if (!carrinho) {
      return res.status(404).json({
        erro: "Carrinho não encontrado",
      });
    }

    const itens: any[] = await CarrinhoItem.findAll({
      where: {
        id: {
          [Op.in]: itensIdsUnicos,
        },
        carrinho_id: carrinho.id,
      },
      include: [
        {
          model: Produto,
          as: "produto",
        },
      ],
    });

    if (itens.length !== itensIdsUnicos.length) {
      return res.status(403).json({
        erro: "Tentativa inválida",
      });
    }

    let totalProdutos = 0;

    for (const item of itens) {
      const produto: any = item.produto;

      if (!produto) {
        return res.status(404).json({
          erro: "Produto não encontrado",
        });
      }

      const quantidade = Number(item.quantidade || 0);
      const cor = String(item.cor || "").trim();
      const tamanho = item.tamanho ? String(item.tamanho).trim() : null;

      if (!Number.isInteger(quantidade) || quantidade < 1) {
        return res.status(400).json({
          erro: `Quantidade inválida para ${produto.nome}`,
        });
      }

      if (quantidade > QUANTIDADE_MAXIMA_POR_PRODUTO) {
        return res.status(400).json({
          erro: `Quantidade máxima excedida para ${produto.nome}`,
        });
      }

      if (!cor || cor.length > 30) {
        return res.status(400).json({
          erro: `Cor inválida para ${produto.nome}`,
        });
      }

      const isRoupa =
        produto.categoria?.toLowerCase().includes("roupa") ||
        produto.descricao?.toLowerCase().includes("roupa");

      if (isRoupa) {
        if (!tamanho || !TAMANHOS_VALIDOS.includes(tamanho)) {
          return res.status(400).json({
            erro: `Tamanho inválido para ${produto.nome}`,
          });
        }
      }

      const estoque = Number(produto.estoque || 0);
      const estoqueReservado = Number(produto.estoque_reservado || 0);
      const disponivel = estoque - estoqueReservado;

      if (disponivel <= 0) {
        return res.status(400).json({
          erro: `Produto sem estoque disponível: ${produto.nome}`,
        });
      }

      if (quantidade > disponivel) {
        return res.status(400).json({
          erro: `Estoque insuficiente para ${produto.nome}`,
        });
      }

      const precoUnitario = Number(produto.preco || 0);

      if (precoUnitario <= 0) {
        return res.status(400).json({
          erro: `Preço inválido para ${produto.nome}`,
        });
      }

      totalProdutos += precoUnitario * quantidade;
    }

    if (totalProdutos <= 0) {
      return res.status(400).json({
        erro: "Total inválido",
      });
    }

    const freteValor = Number(FRETES[freteTipo] || 0);

    let cupomId = null;
    let descontoValor = 0;

    if (cupomCodigo) {
      try {
        const resultadoCupom = await validarCupomCheckout(
          cupomCodigo,
          totalProdutos,
        );

        cupomId = resultadoCupom.cupom.id;
        descontoValor = resultadoCupom.desconto;
      } catch (err: any) {
        return res.status(400).json({
          erro: err.message || "Cupom inválido",
        });
      }
    }

    let totalFinal = totalProdutos + freteValor - descontoValor;

    if (totalFinal < 0) {
      totalFinal = 0;
    }

    const pedido: any = await Pedido.create({
      user_id: user.id,

      total_produtos: Number(totalProdutos.toFixed(2)),
      frete_valor: freteValor,
      frete_tipo: freteTipo,

      cupom_id: cupomId,
      desconto_valor: descontoValor,

      endereco_id: enderecoId,

      total: Number(totalFinal.toFixed(2)),
      status: "aguardando_pagamento",
      expiresAt: gerarDataExpiracaoPedido(),
    });
    await criarNotificacaoSePermitido({
      userId: user.id,
      tipo: "pedido",
      titulo: "Pedido criado",
      mensagem: `Seu pedido #${pedido.id} foi criado e está aguardando pagamento.`,
      link: `/pedido/${pedido.id}`,
    });
    for (const item of itens) {
      const produto: any = item.produto;

      const quantidade = Number(item.quantidade || 0);
      const precoUnitario = Number(produto.preco || 0);

      await PedidoItem.create({
        pedido_id: pedido.id,
        produto_id: produto.id,
        quantidade,
        preco_unitario: precoUnitario,
        cor: String(item.cor || "").trim(),
        tamanho: item.tamanho ? String(item.tamanho).trim() : null,
      });

      produto.estoque_reservado =
        Number(produto.estoque_reservado || 0) + quantidade;

      await produto.save();

      await item.destroy();
    }

    return res.status(200).json({
      sucesso: true,
      pedidoId: pedido.id,
      totalProdutos,
      freteValor,
      descontoValor,
      total: totalFinal,
    });
  } catch (err) {
    console.error("ERRO CHECKOUT FINALIZAR:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
