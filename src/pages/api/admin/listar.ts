import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Produto";
import Arquivo from "@/models/Arquivo";
import { Op } from "sequelize";
import { exigirAdmin, protegerRota } from "@/lib/middleware";
import ProdutoImagem from "@/models/ProdutoImagem";
import "@/models";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const auth = exigirAdmin(req);

  if (!auth.user) {
    return res.status(auth.status).json({
      erro: auth.erro,
    });
  }

  const user = auth.user;

  try {
    const limit = Number(req.query.limit || 20);
    const pesquisa = req.query.pesquisa?.toString() || "";

    const where: any = {};

    if (pesquisa) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${pesquisa}%` } },
        { marca: { [Op.like]: `%${pesquisa}%` } },
        { categoria: { [Op.like]: `%${pesquisa}%` } },
      ];
    }

    const produtos = await Product.findAll({
      where,
      include: [
        {
          model: Arquivo,
          as: "imagem",
          required: false,
        },
        {
          model: ProdutoImagem,
          as: "imagens",
          required: false,
          include: [
            {
              model: Arquivo,
              as: "arquivo",
            },
          ],
        },
      ],
      order: [["id", "ASC"]],
      limit,
    });

    return res.status(200).json(produtos);
  } catch (err) {
    console.error("ERRO INTERNO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
