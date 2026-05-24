import type { NextApiRequest, NextApiResponse } from "next";
import "@/models";

import Produto from "@/models/Produto";
import Arquivo from "@/models/Arquivo";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { categoria, produtoId } = req.query;

    const produtos = await Produto.findAll({
      where: {
        categoria,
      },

      include: [
        {
          model: Arquivo,
          as: "imagem",
          required: false,
        },
      ],

      limit: 8,
    });
    const produtosDisponiveis = produtos.filter((p: any) => {
      const disponivel = Number(p.estoque) - Number(p.estoque_reservado || 0);

      return disponivel > 0;
    });

    const filtrados = produtosDisponiveis.filter(
      (p: any) => p.id !== Number(produtoId),
    );

    const disponiveis = filtrados.filter((p: any) => {
      const disponivel = Number(p.estoque) - Number(p.estoque_reservado || 0);

      return disponivel > 0;
    });

    return res.status(200).json(disponiveis);
  } catch (err) {
    console.error("ERRO INTERNO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
