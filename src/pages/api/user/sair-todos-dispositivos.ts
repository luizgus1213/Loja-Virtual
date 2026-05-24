import type { NextApiRequest, NextApiResponse } from "next";

import User from "@/models/User";
import { verificarToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
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

    const user: any = await User.findByPk(userToken.id);

    if (!user) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    user.token_version = Number(user.token_version || 1) + 1;

    await user.save();

    res.setHeader(
      "Set-Cookie",
      "token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
    );

    return res.status(200).json({
      sucesso: true,
    });
  } catch (err) {
    console.error("ERRO SAIR TODOS DISPOSITIVOS:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
