import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Produto";
import Arquivo from "@/models/Arquivo";

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
          model: Arquivo,
          as: "imagem",
        },
      ],
    });

    if (!produto) {
      return res.status(404).json(null);
    }

    return res.status(200).json(produto);
  } catch (err) {
    console.log("ERRO API PRODUTO:", err);
    return res.status(500).json(null);
  }
}
