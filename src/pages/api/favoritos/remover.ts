import "@/models";

import type { NextApiRequest, NextApiResponse } from "next";

import Favorito from "@/models/Favorito";

import { verificarToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE") {
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

    const { produtoId } = req.body;

    const favorito = await Favorito.findOne({
      where: {
        user_id: user.id,
        produto_id: produtoId,
      },
    });

    if (!favorito) {
      return res.status(404).json({
        erro: "Favorito não encontrado",
      });
    }

    await favorito.destroy();

    return res.status(200).json({
      sucesso: true,
    });
  } catch (err) {
    console.error("ERRO INTERNO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
