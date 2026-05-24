import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Notificacao from "@/models/Notificacao";
import { verificarToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT") {
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

    const notificacaoId = Number(req.body.notificacaoId);

    if (!notificacaoId || Number.isNaN(notificacaoId)) {
      return res.status(400).json({
        erro: "Notificação inválida",
      });
    }

    const notificacao: any = await Notificacao.findOne({
      where: {
        id: notificacaoId,
        user_id: user.id,
      },
    });

    if (!notificacao) {
      return res.status(404).json({
        erro: "Notificação não encontrada",
      });
    }

    notificacao.lida = true;

    await notificacao.save();

    return res.status(200).json({
      sucesso: true,
    });
  } catch (err) {
    console.error("ERRO MARCAR NOTIFICAÇÃO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
