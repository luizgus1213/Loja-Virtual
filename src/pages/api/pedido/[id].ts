import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Pedido from "@/models/Pedido";
import Produto from "@/models/Produto";
import PedidoItem from "@/models/PedidoItem";
import Arquivo from "@/models/Arquivo";
import Endereco from "@/models/Endereco";
import Cupom from "@/models/Cupom";
import PedidoStatusLog from "@/models/PedidoStatusLog";

import { verificarToken } from "@/lib/auth";
import { expirarPedidosPendentes } from "@/lib/pedidos";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
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

    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        erro: "Pedido inválido",
      });
    }

    const pedidoId = Number(id);

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

      include: [
        {
          model: Endereco,
          as: "endereco",
          required: false,
        },
        {
          model: Cupom,
          as: "cupom",
          required: false,
        },
        {
          model: PedidoStatusLog,
          as: "logsStatus",
          required: false,
        },
      ],

      order: [[{ model: PedidoStatusLog, as: "logsStatus" }, "id", "ASC"]],
    });

    if (!pedido) {
      return res.status(404).json({
        erro: "Pedido não encontrado",
      });
    }

    const itens = await PedidoItem.findAll({
      where: {
        pedido_id: pedido.id,
      },

      include: [
        {
          model: Produto,
          as: "produto",

          include: [
            {
              model: Arquivo,
              as: "capa",
              required: false,
            },
            {
              model: Arquivo,
              as: "imagem",
              required: false,
            },
          ],
        },
      ],

      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      pedido,
      itens,
    });
  } catch (err) {
    console.error("ERRO BUSCAR PEDIDO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
