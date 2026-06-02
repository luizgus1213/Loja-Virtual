import type { NextApiRequest, NextApiResponse } from "next";
import "@/models";
import User from "@/models/User";
import { verificarToken } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin";

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

    const userToken: any = verificarToken(token);

    if (!userToken?.id) {
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

    const notificacaoId = String(req.body.notificacaoId || "");

    if (!notificacaoId) {
      return res.status(400).json({
        erro: "Notificação inválida",
      });
    }

    const ref = adminDb.collection("notificacoes").doc(notificacaoId);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({
        erro: "Notificação não encontrada",
      });
    }

    const dados = doc.data();

    if (String(dados?.userId) !== String(user.id)) {
      return res.status(403).json({
        erro: "Acesso negado",
      });
    }

    await ref.update({
      lida: true,
      readAt: new Date(),
    });

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
