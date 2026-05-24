import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";
import { validarECacularCupom } from "@/lib/cupons";
import { Op } from "sequelize";
import CarrinhoItem from "@/models/CarrinhoItem";
import Carrinho from "@/models/Carrinho";
import Produto from "@/models/Produto";
import Pedido from "@/models/Pedido";
import PedidoItem from "@/models/PedidoItem";
import Endereco from "@/models/Endereco";
import {
  gerarDataExpiracaoPedido,
  expirarPedidosPendentes,
} from "@/lib/pedidos";
import { verificarToken } from "@/lib/auth";

const TAMANHOS_VALIDOS = ["PP", "P", "M", "G", "GG"];
const QUANTIDADE_MAXIMA_POR_PRODUTO = 20;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método inválido",
    });
  }
  const enderecoId = req.body.enderecoId;
  try {
    await expirarPedidosPendentes();

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        erro: "Não autenticado",
      });
    }
    const cupomCodigo = req.body.cupomCodigo
      ? String(req.body.cupomCodigo).trim()
      : null;

    const user: any = verificarToken(token);

    if (!user) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    const itensIdsRaw = req.body.itensIds;

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
    const enderecoIdNumber = Number(enderecoId);

    if (!enderecoIdNumber || Number.isNaN(enderecoIdNumber)) {
      return res.status(400).json({
        erro: "Selecione um endereço de entrega",
      });
    }

    const endereco = await Endereco.findOne({
      where: {
        id: enderecoIdNumber,
        user_id: user.id,
      },
    });

    if (!endereco) {
      return res.status(403).json({
        erro: "Endereço inválido",
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

    let total = 0;

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

      total += precoUnitario * quantidade;
    }

    if (total <= 0) {
      return res.status(400).json({
        erro: "Total inválido",
      });
    }

    const pedido: any = await Pedido.create({
      user_id: user.id,
      total_produtos: total,
      frete_valor: 0,
      frete_tipo: "normal",
      endereco_id: enderecoIdNumber,
      total,
      status: "aguardando_pagamento",
      expiresAt: gerarDataExpiracaoPedido(),
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
      total,
    });
  } catch (err) {
    console.error("ERRO CHECKOUT CARRINHO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
