import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Produto";
import { Op } from "sequelize";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { q, precoMin, precoMax } = req.query;

    if (!q || typeof q !== "string") return res.status(200).json([]);

    const whereClause: any = {
      [Op.or]: [
        { nome: { [Op.like]: `%${q}%` } },
        { marca: { [Op.like]: `%${q}%` } },
        { categoria: { [Op.like]: `%${q}%` } },
      ],
    };

    if (precoMin || precoMax) {
      whereClause.preco = {};
      if (precoMin) whereClause.preco[Op.gte] = Number(precoMin);
      if (precoMax) whereClause.preco[Op.lte] = Number(precoMax);
    }

    const produtos = await Product.findAll({
      where: whereClause,
      limit: 100000000000,
      order: [["nome", "ASC"]],
    });

    return res.status(200).json(produtos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro na busca" });
  }
}
