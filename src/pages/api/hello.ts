import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Produto";
import Arquivo from "@/models/Arquivo";
import ProdutoImagem from "@/models/ProdutoImagem";
import sequelize from "@/database";
import "@/models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const includeImagens = [
      {
        model: Arquivo,
        as: "capa",
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
            required: false,
          },
        ],
      },
    ];

    const aleatorios: any[] = await Product.findAll({
      include: includeImagens,
      order: sequelize.random(),
      limit: 8,
    });

    const maisAvaliados: any[] = await Product.findAll({
      include: includeImagens,
      order: [["avaliacao", "DESC"]],
      limit: 8,
    });

    function arrumarProdutos(lista: any[]) {
      return lista
        .filter((p: any) => {
          const disponivel =
            Number(p.estoque) - Number(p.estoque_reservado || 0);

          return disponivel > 0;
        })
        .map((p: any) => {
          const json = p.toJSON();

          const primeiraImagem =
            json.imagens?.[0]?.arquivo || json.capa || null;

          return {
            ...json,
            capa: primeiraImagem,
          };
        });
    }

    return res.status(200).json({
      aleatorios: arrumarProdutos(aleatorios),
      maisAvaliados: arrumarProdutos(maisAvaliados),
    });
  } catch (err) {
    console.error("ERRO INTERNO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
