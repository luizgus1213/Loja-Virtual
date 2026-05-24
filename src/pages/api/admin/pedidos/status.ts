import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Pedido from "@/models/Pedido";
import PedidoStatusLog from "@/models/PedidoStatusLog";
import { exigirAdmin } from "@/lib/middleware";
import { expirarPedidosPendentes } from "@/lib/pedidos";

const fluxoPermitido: Record<string, string> = {
  pago: "preparando",
  preparando: "enviado",
  enviado: "entregue",
};

const statusPermitidos = ["preparando", "enviado", "entregue"];

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

    const auth = exigirAdmin(req);

    if (!auth.user) {
      return res.status(auth.status).json({
        erro: auth.erro,
      });
    }

    const admin = auth.user;

    const pedidoId = Number(req.body.pedidoId);
    const novoStatus = String(req.body.status || "");

    if (!pedidoId || Number.isNaN(pedidoId)) {
      return res.status(400).json({
        erro: "Pedido inválido",
      });
    }

    if (!statusPermitidos.includes(novoStatus)) {
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

    if (
      pedido.status === "aguardando_pagamento" ||
      pedido.status === "expirado" ||
      pedido.status === "cancelado"
    ) {
      return res.status(400).json({
        erro: "Este pedido não pode ter entrega alterada",
      });
    }

    const proximoStatusPermitido = fluxoPermitido[pedido.status];

    if (!proximoStatusPermitido) {
      return res.status(400).json({
        erro: "Este pedido não possui próximo status disponível",
      });
    }

    if (novoStatus !== proximoStatusPermitido) {
      return res.status(400).json({
        erro: `Status inválido. O próximo status correto é ${proximoStatusPermitido}`,
      });
    }

    const statusAnterior = pedido.status;

    await pedido.update({
      status: novoStatus,
    });

    await PedidoStatusLog.create({
      pedido_id: pedido.id,
      admin_id: admin.id,
      status_anterior: statusAnterior,
      status_novo: novoStatus,
      observacao: `Status alterado pelo admin ${admin.email || admin.id}`,
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
