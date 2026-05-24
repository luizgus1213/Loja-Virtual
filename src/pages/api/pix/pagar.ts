import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";
import { criarNotificacaoSePermitido } from "@/lib/notificacoes";
import Pedido from "@/models/Pedido";
import PedidoItem from "@/models/PedidoItem";
import Produto from "@/models/Produto";
import { expirarPedidosPendentes } from "@/lib/pedidos";
import { verificarToken } from "@/lib/auth";

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

    const pedidoId = Number(req.body.pedidoId);

    if (!pedidoId || Number.isNaN(pedidoId) || !Number.isInteger(pedidoId)) {
      return res.status(400).json({
        erro: "Pedido inválido",
      });
    }

    const pedido: any = await Pedido.findOne({
      where: {
        id: pedidoId,
        user_id: user.id,
      },
    });

    if (!pedido) {
      return res.status(404).json({
        erro: "Pedido não encontrado",
      });
    }

    if (pedido.status !== "aguardando_pagamento") {
      return res.status(400).json({
        erro: "Este pedido não pode ser pago",
      });
    }

    if (!pedido.endereco_id) {
      return res.status(400).json({
        erro: "Selecione um endereço de entrega antes de pagar",
      });
    }

    const itens: any[] = await PedidoItem.findAll({
      where: {
        pedido_id: pedido.id,
      },
    });

    if (itens.length === 0) {
      return res.status(400).json({
        erro: "Pedido sem itens",
      });
    }

    for (const item of itens) {
      const produto: any = await Produto.findByPk(item.produto_id);

      if (!produto) {
        return res.status(404).json({
          erro: "Produto do pedido não encontrado",
        });
      }

      const estoque = Number(produto.estoque || 0);
      const quantidade = Number(item.quantidade || 0);

      if (estoque < quantidade) {
        return res.status(400).json({
          erro: `Estoque insuficiente para ${produto.nome}`,
        });
      }
    }

    for (const item of itens) {
      const produto: any = await Produto.findByPk(item.produto_id);

      if (!produto) continue;

      produto.estoque =
        Number(produto.estoque || 0) - Number(item.quantidade || 0);

      produto.estoque_reservado =
        Number(produto.estoque_reservado || 0) - Number(item.quantidade || 0);

      if (produto.estoque < 0) {
        produto.estoque = 0;
      }

      if (produto.estoque_reservado < 0) {
        produto.estoque_reservado = 0;
      }

      await produto.save();
    }

    pedido.status = "pago";

    await pedido.save();
    await criarNotificacaoSePermitido({
      userId: pedido.user_id,
      tipo: "pedido",
      titulo: "Pagamento confirmado",
      mensagem: `O pagamento do pedido #${pedido.id} foi confirmado.`,
      link: `/pedido/${pedido.id}`,
    });
    return res.status(200).json({
      sucesso: true,
    });
  } catch (err) {
    console.error("ERRO PIX PAGAR:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
