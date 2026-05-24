import type { NextApiRequest, NextApiResponse } from "next";
import { expirarPedidosPendentes } from "@/lib/pedidos";
import Pedido from "@/models/Pedido";
import { verificarToken } from "@/lib/auth";

function gerarCodigoPix() {
  return (
    "00020126580014BR.GOV.BCB.PIX0136" +
    Math.random().toString(36).substring(2) +
    Date.now()
  );
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

    const { pedidoId } = req.body;

    if (!pedidoId || Number.isNaN(Number(pedidoId))) {
      return res.status(400).json({
        erro: "Pedido inválido",
      });
    }

    const pedido: any = await Pedido.findOne({
      where: {
        id: Number(pedidoId),
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
    if (!pedido.endereco_id || !pedido.frete_tipo) {
      return res.status(400).json({
        erro: "Selecione endereço e frete antes de gerar o PIX",
      });
    }

    const codigoPix = gerarCodigoPix();

    return res.status(200).json({
      codigoPix,
      total: pedido.total,
    });
  } catch (err) {
    console.error("ERRO PIX CRIAR:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
