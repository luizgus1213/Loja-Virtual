import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Produto";
import Arquivo from "@/models/Arquivo";
import "@/models";
import ProdutoImagem from "@/models/ProdutoImagem";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let { id } = req.query;

  if (Array.isArray(id)) {
    id = id[0];
  }

  try {
    const produto = await Product.findByPk(Number(id), {
      include: [
        {
          model: ProdutoImagem,
          as: "imagens",

          include: [
            {
              model: Arquivo,
              as: "arquivo",
            },
          ],
        },
      ],

      order: [[{ model: ProdutoImagem, as: "imagens" }, "ordem", "ASC"]],
    });

    if (!produto) {
      return res.status(404).json(null);
    }

    return res.status(200).json(produto);
  } catch (err) {
    console.error("ERRO INTERNO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
