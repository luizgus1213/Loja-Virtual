import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Carrinho from "@/models/Carrinho";
import CarrinhoItem from "@/models/CarrinhoItem";
import Produto from "@/models/Produto";
import Arquivo from "@/models/Arquivo";

import { verificarToken } from "@/lib/auth";

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
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        erro: "Não autenticado",
      });
    }

    const user: any = verificarToken(token);

    if (!user) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    const carrinho: any = await Carrinho.findOne({
      where: {
        user_id: user.id,
      },
    });

    if (!carrinho) {
      return res.status(200).json([]);
    }

    const itens = await CarrinhoItem.findAll({
      where: {
        carrinho_id: carrinho.id,
      },

      include: [
        {
          model: Produto,
          as: "produto",
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

          include: [
            {
              model: Arquivo,
              as: "capa",
              required: false,
            },
          ],
        },
      ],

      order: [["id", "DESC"]],
    });

    return res.status(200).json(itens);
  } catch (err) {
    console.error("ERRO LISTAR CARRINHO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
