import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import User from "@/models/User";
import { verificarToken } from "@/lib/auth";
import { adminAuth } from "@/lib/firebaseAdmin";

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

    const payload: any = verificarToken(token);

    if (!payload?.id) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    const user: any = await User.findByPk(payload.id);

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

    const uid = String(user.id);

    const firebaseToken = await adminAuth.createCustomToken(uid, {
      id: String(user.id),
      email: String(user.email || ""),
      acesso: String(user.acesso || "user"),
    });

    return res.status(200).json({
      token: firebaseToken,
      uid,
    });
  } catch (err: any) {
    console.error("ERRO GERAR TOKEN FIREBASE:", err);

    return res.status(500).json({
      erro: err?.message || "Erro ao gerar token Firebase",
    });
  }
}
