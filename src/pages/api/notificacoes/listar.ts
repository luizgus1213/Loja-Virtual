import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Notificacao from "@/models/Notificacao";
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

    const notificacoes = await Notificacao.findAll({
      where: {
        user_id: user.id,
      },
      order: [["id", "DESC"]],
      limit: 20,
    });

    const naoLidas = await Notificacao.count({
      where: {
        user_id: user.id,
        lida: false,
      },
    });

    return res.status(200).json({
      notificacoes,
      naoLidas,
    });
  } catch (err) {
    console.error("ERRO LISTAR NOTIFICAÇÕES:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
