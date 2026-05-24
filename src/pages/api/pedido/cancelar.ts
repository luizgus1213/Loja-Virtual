import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Pedido from "@/models/Pedido";
import PedidoItem from "@/models/PedidoItem";
import Produto from "@/models/Produto";
import { verificarToken } from "@/lib/auth";

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

    if (!pedidoId || Number.isNaN(pedidoId)) {
      return res.status(400).json({
        erro: "Pedido inválido",
      });
    }

    const pedido: any = await Pedido.findOne({
      where: {
        id: pedidoId,
        user_id: user.id,
        status: "aguardando_pagamento",
      },
    });

    if (!pedido) {
      return res.status(404).json({
        erro: "Pedido pendente não encontrado",
      });
    }

    const itens: any[] = await PedidoItem.findAll({
      where: {
        pedido_id: pedido.id,
      },
    });

    for (const item of itens) {
      const produto: any = await Produto.findByPk(item.produto_id);

      if (!produto) continue;

      produto.estoque_reservado =
        Number(produto.estoque_reservado || 0) - Number(item.quantidade || 0);

      if (produto.estoque_reservado < 0) {
        produto.estoque_reservado = 0;
      }

      await produto.save();
    }

    pedido.status = "cancelado";

    await pedido.save();

    return res.status(200).json({
      sucesso: true,
    });
  } catch (err) {
    console.error("ERRO CANCELAR PEDIDO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
