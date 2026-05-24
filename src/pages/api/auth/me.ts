import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import User from "@/models/User";
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

    const userToken: any = verificarToken(token);

    if (!userToken) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    const user: any = await User.findByPk(userToken.id, {
      attributes: {
        exclude: ["senha", "codigo_verificacao"],
      },

      include: [
        {
          model: Arquivo,
          as: "foto_perfil",
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    if (user.conta_desativada) {
      return res.status(403).json({
        erro: "Conta desativada",
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("ERRO AUTH ME:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
