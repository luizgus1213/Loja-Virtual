import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Produto";
import Arquivo from "@/models/Arquivo";
import { Op } from "sequelize";
import { protegerRota } from "@/lib/middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user: any = protegerRota(req);

  if (!user) {
    return res.status(401).json({ erro: "Não autorizado" });
  }

  if (user.acesso !== "admin") {
    return res.status(403).json({ erro: "Acesso negado" });
  }

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
      include: [{ model: Arquivo, as: "imagem" }],
      order: [["id", "ASC"]],
      limit,
    });

    return res.status(200).json(produtos);
  } catch (err) {
    console.log("ERRO ADMIN LISTAR:", err);
    return res.status(500).json([]);
  }
}
