import type { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/User";
import { verificarToken } from "@/lib/auth";

export async function pegarUsuarioSeguro(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({
      erro: "Não autenticado",
    });

    return null;
  }

  const payload: any = verificarToken(token);

  if (!payload) {
    res.status(401).json({
      erro: "Token inválido",
    });

    return null;
  }

  const user: any = await User.findByPk(payload.id);

  if (!user) {
    res.status(401).json({
      erro: "Usuário não encontrado",
    });

    return null;
  }

  if (user.conta_desativada) {
    res.status(403).json({
      erro: "Conta desativada",
    });

    return null;
  }

  const tokenVersionBanco = Number(user.token_version || 1);
  const tokenVersionToken = Number(payload.token_version || 1);

  if (tokenVersionBanco !== tokenVersionToken) {
    res.status(401).json({
      erro: "Sessão expirada. Faça login novamente.",
    });

    return null;
  }

  return user;
}
