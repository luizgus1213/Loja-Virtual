import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import User from "@/models/User";
import Pedido from "@/models/Pedido";
import PedidoStatusLog from "@/models/PedidoStatusLog";

import { verificarToken } from "@/lib/auth";
import { criarNotificacaoSePermitido } from "@/lib/notificacoes";

const STATUS_VALIDOS = [
  "aguardando_pagamento",
  "pago",
  "preparando",
  "enviado",
  "entregue",
  "cancelado",
];

async function verificarAdmin(req: NextApiRequest) {
  const token = req.cookies.token;

  if (!token) {
    return null;
  }

  const userToken: any = verificarToken(token);

  if (!userToken) {
    return null;
  }

  const user: any = await User.findByPk(userToken.id);

  if (!user || user.acesso !== "admin") {
    return null;
  }

  return user;
}

function mensagemStatus(status: string, pedidoId: number) {
  if (status === "pago") {
    return `O pagamento do pedido #${pedidoId} foi confirmado.`;
  }

  if (status === "preparando") {
    return `Seu pedido #${pedidoId} está sendo preparado.`;
  }

  if (status === "enviado") {
    return `Seu pedido #${pedidoId} foi enviado.`;
  }

  if (status === "entregue") {
    return `Seu pedido #${pedidoId} foi entregue.`;
  }

  if (status === "cancelado") {
    return `Seu pedido #${pedidoId} foi cancelado.`;
  }

  return `O status do pedido #${pedidoId} foi atualizado.`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT") {
    return res.status(405).json({
      erro: "Método não permitido",
    });
  }

  try {
    const admin = await verificarAdmin(req);

    if (!admin) {
      return res.status(403).json({
        erro: "Acesso negado",
      });
    }

    const pedidoId = Number(req.body.pedidoId);
    const statusNovo = String(req.body.status || "").trim();
    const observacao = req.body.observacao
      ? String(req.body.observacao).trim()
      : null;

    if (!pedidoId || Number.isNaN(pedidoId)) {
      return res.status(400).json({
        erro: "Pedido inválido",
      });
    }

    if (!STATUS_VALIDOS.includes(statusNovo)) {
      return res.status(400).json({
        erro: "Status inválido",
      });
    }

    const pedido: any = await Pedido.findByPk(pedidoId);

    if (!pedido) {
      return res.status(404).json({
        erro: "Pedido não encontrado",
      });
    }

    const statusAnterior = pedido.status;

    if (statusAnterior === statusNovo) {
      return res.status(400).json({
        erro: "O pedido já está com este status",
      });
    }

    await PedidoStatusLog.create({
      pedido_id: pedido.id,
      admin_id: admin.id,
      status_anterior: statusAnterior,
      status_novo: statusNovo,
      observacao,
    });

    pedido.status = statusNovo;

    await pedido.save();

    await criarNotificacaoSePermitido({
      userId: pedido.user_id,
      tipo: "pedido",
      titulo: "Status do pedido atualizado",
      mensagem: mensagemStatus(statusNovo, pedido.id),
      link: `/pedido/${pedido.id}`,
    });

    return res.status(200).json({
      sucesso: true,
      pedido,
    });
  } catch (err) {
    console.error("ERRO ALTERAR STATUS PEDIDO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
