import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import { Op } from "sequelize";
import Pedido from "@/models/Pedido";
import PedidoItem from "@/models/PedidoItem";
import Produto from "@/models/Produto";
import { verificarToken } from "@/lib/auth";
import {
  gerarDataExpiracaoPedido,
  expirarPedidosPendentes,
} from "@/lib/pedidos";

const TAMANHOS_VALIDOS = ["PP", "P", "M", "G", "GG"];
const QUANTIDADE_MAXIMA_POR_PRODUTO = 20;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido",
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

    const pedidoId = Number(req.body.pedidoId);

    if (!pedidoId || Number.isNaN(pedidoId) || !Number.isInteger(pedidoId)) {
      return res.status(400).json({
        erro: "Pedido inválido",
      });
    }

    const pedidoAntigo: any = await Pedido.findOne({
      where: {
        id: pedidoId,
        user_id: user.id,
        status: {
          [Op.in]: ["pago", "preparando", "enviado", "entregue"],
        },
      },
    });

    if (!pedidoAntigo) {
      return res.status(404).json({
        erro: "Pedido pago não encontrado",
      });
    }

    const itensAntigos: any[] = await PedidoItem.findAll({
      where: {
        pedido_id: pedidoAntigo.id,
      },
    });

    if (itensAntigos.length === 0) {
      return res.status(400).json({
        erro: "Pedido sem itens",
      });
    }

    if (itensAntigos.length > 50) {
      return res.status(400).json({
        erro: "Pedido possui itens demais para comprar novamente",
      });
    }

    let total = 0;

    for (const item of itensAntigos) {
      const produto: any = await Produto.findByPk(item.produto_id);

      if (!produto) {
        return res.status(404).json({
          erro: "Produto do pedido não encontrado",
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

    const novoPedido: any = await Pedido.create({
      user_id: user.id,
      total_produtos: total,
      frete_valor: 0,
      frete_tipo: null,
      endereco_id: null,
      total,
      status: "aguardando_pagamento",
      expiresAt: gerarDataExpiracaoPedido(),
    });

    for (const item of itensAntigos) {
      const produto: any = await Produto.findByPk(item.produto_id);

      if (!produto) continue;

      const quantidade = Number(item.quantidade || 0);
      const precoUnitario = Number(produto.preco || 0);

      await PedidoItem.create({
        pedido_id: novoPedido.id,
        produto_id: produto.id,
        quantidade,
        preco_unitario: precoUnitario,
        cor: String(item.cor || "").trim(),
        tamanho: item.tamanho ? String(item.tamanho).trim() : null,
      });

      produto.estoque_reservado =
        Number(produto.estoque_reservado || 0) + quantidade;

      await produto.save();
    }

    return res.status(200).json({
      sucesso: true,
      pedidoId: novoPedido.id,
    });
  } catch (err) {
    console.error("ERRO COMPRAR NOVAMENTE:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
