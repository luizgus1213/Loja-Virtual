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

    const snapshot = await adminDb
      .collection("notificacoes")
      .where("userId", "==", String(user.id))
      .where("lida", "==", false)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        sucesso: true,
        alteradas: 0,
      });
    }

    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        lida: true,
        readAt: new Date(),
      });
    });

    await batch.commit();

    return res.status(200).json({
      sucesso: true,
      alteradas: snapshot.size,
    });
  } catch (err) {
    console.error("ERRO MARCAR TODAS NOTIFICAÇÕES:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
