import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Avaliacao from "@/models/Avaliacao";
import User from "@/models/User";
import Produto from "@/models/Produto";

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
    const produtoId = Number(req.query.id);

    if (!produtoId || Number.isNaN(produtoId)) {
      return res.status(400).json({
        erro: "Produto inválido",
      });
    }

    const produto = await Produto.findByPk(produtoId);

    if (!produto) {
      return res.status(404).json({
        erro: "Produto não encontrado",
      });
    }

    const avaliacoes = await Avaliacao.findAll({
      where: {
        produto_id: produtoId,
      },

      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nome"],
        },
      ],

      order: [["id", "DESC"]],
    });

    return res.status(200).json(avaliacoes);
  } catch (err) {
    console.error("ERRO LISTAR AVALIAÇÕES:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
