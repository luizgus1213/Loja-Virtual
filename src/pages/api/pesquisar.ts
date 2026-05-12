import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Produto";
import Arquivo from "@/models/Arquivo";
import { Op } from "sequelize";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const headers = req.headers;

  console.log("headers", headers);
  const parametros = req.query;

  const ordenar = parametros.ordenar as string;

  const parametro_ordenar = ordenar?.split("_")[0];
  const tipo_ordenamento = ordenar?.split("_")[1];

  try {
    const where: any = {
      [Op.or]: [
        { nome: { [Op.like]: `%${parametros.pesquisa || ""}%` } },
        { marca: { [Op.like]: `%${parametros.pesquisa || ""}%` } },
        { categoria: { [Op.like]: `%${parametros.pesquisa || ""}%` } },
      ],
      preco: {
        [Op.between]: [
          Number(parametros.valorMinimo || 0),
          Number(parametros.valorMaximo || 99999999999999999999),
        ],
      },
    };

    const sql = `select * from produtos sort by produtos.preco desc`;

    if (parametros.marca) {
      where.marca = {
        [Op.like]: `%${parametros.marca}%`,
      };
    }

    if (parametros.categoria) {
      where.categoria = {
        [Op.like]: `%${parametros.categoria}%`, //something like that
      };
    }

    if (parametros.avaliacaoMin) {
      where.avaliacao = {
        [Op.gt]: Number(parametros.avaliacaoMin), //gt = greater than = maior que
      };
    }

    if (parametros.estoque === "true") {
      where.estoque = {
        [Op.gt]: 0,
      };
    }

    const produtos = await Product.findAll({
      include: [
        {
          model: Arquivo,
          as: "imagem",
        },
      ],
      where,
      limit: 10,
      order: parametro_ordenar ? [[parametro_ordenar, tipo_ordenamento]] : [],
    });

    return res.status(200).json(produtos);
  } catch (err) {
    console.log(err);
    return res.status(200).json([]);
  }
}
