import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Pedido from "@/models/Pedido";
import PedidoItem from "@/models/PedidoItem";
import Produto from "@/models/Produto";
import Arquivo from "@/models/Arquivo";
import User from "@/models/User";
import PedidoStatusLog from "@/models/PedidoStatusLog";

import { protegerRota } from "@/lib/middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      erro: "Método não permitido",
    });
  }

  try {
    const auth: any = protegerRota(req);

    if (!auth) {
      return res.status(401).json({
        erro: "Não autenticado",
      });
    }

    const user = auth.user || auth;

    if (user.acesso !== "admin") {
      return res.status(403).json({
        erro: "Acesso negado",
      });
    }

    const pedidos = await Pedido.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nome", "email"],
        },

        {
          model: PedidoItem,
          as: "itens",
          required: false,
          include: [
            {
              model: Produto,
              as: "produto",
              required: false,
              include: [
                {
                  model: Arquivo,
                  as: "imagem",
                  required: false,
                },
              ],
            },
          ],
        },

        {
          model: PedidoStatusLog,
          as: "logsStatus",
          required: false,
          include: [
            {
              model: User,
              as: "admin",
              attributes: ["id", "nome", "email"],
              required: false,
            },
          ],
        },
      ],

      order: [
        ["id", "DESC"],
        [{ model: PedidoStatusLog, as: "logsStatus" }, "id", "DESC"],
      ],
    });

    return res.status(200).json(pedidos);
  } catch (err) {
    console.error("ERRO ADMIN LISTAR PEDIDOS:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
