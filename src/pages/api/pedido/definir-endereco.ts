import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Pedido from "@/models/Pedido";
import Endereco from "@/models/Endereco";
import { verificarToken } from "@/lib/auth";
import { expirarPedidosPendentes } from "@/lib/pedidos";

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
    const enderecoId = Number(req.body.enderecoId);
    const freteTipo = String(req.body.freteTipo || "normal");

    const fretesValidos = ["normal", "expresso"];

    if (!pedidoId || Number.isNaN(pedidoId)) {
      return res.status(400).json({
        erro: "Pedido inválido",
      });
    }

    if (!enderecoId || Number.isNaN(enderecoId)) {
      return res.status(400).json({
        erro: "Selecione um endereço de entrega",
      });
    }

    if (!fretesValidos.includes(freteTipo)) {
      return res.status(400).json({
        erro: "Frete inválido",
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

    let freteValor = 0;

    if (freteTipo === "normal") {
      freteValor = 0;
    }

    if (freteTipo === "expresso") {
      freteValor = 25;
    }

    const totalProdutos = Number(pedido.total_produtos || pedido.total || 0);
    const desconto = Number(pedido.desconto_valor || 0);

    pedido.endereco_id = enderecoId;
    pedido.frete_tipo = freteTipo;
    pedido.frete_valor = freteValor;
    pedido.total = totalProdutos + freteValor - desconto;

    if (pedido.total < 0) {
      pedido.total = 0;
    }

    await pedido.save();

    return res.status(200).json({
      sucesso: true,
      pedido,
    });
  } catch (err) {
    console.error("ERRO DEFINIR ENDEREÇO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
