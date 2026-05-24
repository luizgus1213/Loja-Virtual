import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Endereco from "@/models/Endereco";
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

    const enderecos = await Endereco.findAll({
      where: {
        user_id: user.id,
      },

      order: [
        ["endereco_padrao", "DESC"],
        ["id", "DESC"],
      ],
    });

    return res.status(200).json(enderecos);
  } catch (err) {
    console.error("ERRO LISTAR ENDEREÇOS:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
