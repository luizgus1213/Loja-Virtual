import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Produto";
import Arquivo from "@/models/Arquivo";
import { Op } from "sequelize";
import "@/models";

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
    const { q, precoMin, precoMax } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(200).json([]);
    }

    const pesquisa = q.trim();

    if (pesquisa.length < 1) {
      return res.status(200).json([]);
    }

    if (pesquisa.length > 80) {
      return res.status(400).json({
        erro: "Pesquisa muito grande",
      });
    }

    const whereClause: any = {
      [Op.or]: [
        { nome: { [Op.like]: `%${pesquisa}%` } },
        { marca: { [Op.like]: `%${pesquisa}%` } },
        { categoria: { [Op.like]: `%${pesquisa}%` } },
      ],
    };

    const precoMinNumber = precoMin ? Number(precoMin) : null;
    const precoMaxNumber = precoMax ? Number(precoMax) : null;

    if (
      (precoMin && Number.isNaN(precoMinNumber)) ||
      (precoMax && Number.isNaN(precoMaxNumber))
    ) {
      return res.status(400).json({
        erro: "Preço inválido",
      });
    }

    if (precoMinNumber !== null || precoMaxNumber !== null) {
      whereClause.preco = {};

      if (precoMinNumber !== null) {
        whereClause.preco[Op.gte] = precoMinNumber;
      }

      if (precoMaxNumber !== null) {
        whereClause.preco[Op.lte] = precoMaxNumber;
      }
    }

    const produtos = await Product.findAll({
      where: whereClause,

      include: [
        {
          model: Arquivo,
          as: "imagem",
          required: false,
        },
      ],

      attributes: [
        "id",
        "nome",
        "marca",
        "categoria",
        "preco",
        "estoque",
        "estoque_reservado",
        "imagem_id",
      ],

      limit: 20,
      order: [["nome", "ASC"]],
    });

    const produtosFormatados = produtos
      .filter((p: any) => {
        const disponivel =
          Number(p.estoque || 0) - Number(p.estoque_reservado || 0);

        return disponivel > 0;
      })
      .map((p: any) => {
        const json = p.toJSON();

        return {
          ...json,
          capa: json.imagem || null,
        };
      });

    return res.status(200).json(produtosFormatados);
  } catch (error) {
    console.error("ERRO NA API BUSCAR:", error);

    return res.status(500).json({
      erro: "Erro na busca",
    });
  }
}
