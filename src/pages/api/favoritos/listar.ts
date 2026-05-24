import type { NextApiRequest, NextApiResponse } from "next";
import "@/models";

import Favorito from "@/models/Favorito";
import Produto from "@/models/Produto";
import Arquivo from "@/models/Arquivo";

import { verificarToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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

    const favoritos = await Favorito.findAll({
      where: {
        user_id: user.id,
      },

      include: [
        {
          model: Produto,
          as: "produto",

          include: [
            {
              model: Arquivo,
              as: "imagem",
            },
          ],
        },
      ],
    });

    return res.status(200).json(favoritos);
  } catch (err) {
    console.error("ERRO INTERNO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
