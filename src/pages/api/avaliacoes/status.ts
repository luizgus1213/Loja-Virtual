import type { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";

import "@/models";

import { verificarToken } from "@/lib/auth";
import Pedido from "@/models/Pedido";
import PedidoItem from "@/models/PedidoItem";
import Avaliacao from "@/models/Avaliacao";

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
    const token = req.cookies.token;

    if (!token) {
      return res.status(200).json({
        podeAvaliar: false,
        avaliacao: null,
      });
    }

    const user: any = verificarToken(token);

    if (!user) {
      return res.status(200).json({
        podeAvaliar: false,
        avaliacao: null,
      });
    }

    const produtoId = Number(req.query.produtoId);

    if (!produtoId || Number.isNaN(produtoId)) {
      return res.status(400).json({
        erro: "Produto inválido",
      });
    }

    const pedidosEntregues: any[] = await Pedido.findAll({
      where: {
        user_id: user.id,
        status: "entregue",
      },
      attributes: ["id"],
    });

    const pedidosIds = pedidosEntregues.map((pedido: any) => pedido.id);

    let podeAvaliar = false;

    if (pedidosIds.length > 0) {
      const comprouProduto = await PedidoItem.findOne({
        where: {
          pedido_id: {
            [Op.in]: pedidosIds,
          },
          produto_id: produtoId,
        },
      });

      podeAvaliar = !!comprouProduto;
    }

    const avaliacao = await Avaliacao.findOne({
      where: {
        user_id: user.id,
        produto_id: produtoId,
      },
    });

    return res.status(200).json({
      podeAvaliar,
      avaliacao,
    });
  } catch (err) {
    console.error("ERRO STATUS AVALIAÇÃO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
