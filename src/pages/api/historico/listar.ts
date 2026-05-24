import type { NextApiRequest, NextApiResponse } from "next";
import "@/models";

import Pedido from "@/models/Pedido";
import PedidoItem from "@/models/PedidoItem";
import Produto from "@/models/Produto";
import Arquivo from "@/models/Arquivo";

import { verificarToken } from "@/lib/auth";
import { expirarPedidosPendentes } from "@/lib/pedidos";

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

    const pedidos = await Pedido.findAll({
      where: {
        user_id: user.id,
      },

      include: [
        {
          model: PedidoItem,
          as: "itens",
          include: [
            {
              model: Produto,
              as: "produto",
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
      ],

      order: [["id", "DESC"]],
    });

    return res.status(200).json(pedidos);
  } catch (err) {
    console.error("ERRO HISTÓRICO LISTAR:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
