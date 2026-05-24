import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import User from "@/models/User";
import { verificarToken } from "@/lib/auth";
import { criarNotificacaoSePermitido } from "@/lib/notificacoes";

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

    const adminToken: any = verificarToken(token);

    if (!adminToken) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    const admin: any = await User.findByPk(adminToken.id);

    if (!admin || admin.acesso !== "admin") {
      return res.status(403).json({
        erro: "Acesso negado",
      });
    }

    const titulo = String(req.body.titulo || "").trim();
    const mensagem = String(req.body.mensagem || "").trim();
    const link = req.body.link ? String(req.body.link).trim() : "/";

    if (!titulo || !mensagem) {
      return res.status(400).json({
        erro: "Título e mensagem são obrigatórios",
      });
    }

    if (titulo.length > 80) {
      return res.status(400).json({
        erro: "Título muito grande",
      });
    }

    if (mensagem.length > 300) {
      return res.status(400).json({
        erro: "Mensagem muito grande",
      });
    }

    const users: any[] = await User.findAll({
      where: {
        conta_desativada: false,
      },
      attributes: ["id"],
    });

    let criadas = 0;

    for (const user of users) {
      const criada = await criarNotificacaoSePermitido({
        userId: user.id,
        tipo: "promocao",
        titulo,
        mensagem,
        link,
      });

      if (criada) {
        criadas++;
      }
    }

    return res.status(200).json({
      sucesso: true,
      criadas,
    });
  } catch (err) {
    console.error("ERRO NOTIFICAÇÃO PROMOÇÃO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
