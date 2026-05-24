import type { NextApiRequest, NextApiResponse } from "next";

import User from "@/models/User";
import { verificarToken } from "@/lib/auth";

const temasPermitidos = ["light", "dark"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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

    if (user.conta_desativada) {
      return res.status(403).json({
        erro: "Conta desativada",
      });
    }

    if (req.method === "GET") {
      return res.status(200).json({
        tema_preferido: user.tema_preferido || "dark",
        notificar_pedidos: Boolean(user.notificar_pedidos),
        notificar_promocoes: Boolean(user.notificar_promocoes),
        notificar_seguranca: Boolean(user.notificar_seguranca),
      });
    }

    if (req.method !== "PUT") {
      return res.status(405).json({
        erro: "Método não permitido",
      });
    }

    const {
      tema_preferido,
      notificar_pedidos,
      notificar_promocoes,
      notificar_seguranca,
    } = req.body;

    if (!temasPermitidos.includes(String(tema_preferido))) {
      return res.status(400).json({
        erro: "Tema inválido",
      });
    }

    if (
      typeof notificar_pedidos !== "boolean" ||
      typeof notificar_promocoes !== "boolean" ||
      typeof notificar_seguranca !== "boolean"
    ) {
      return res.status(400).json({
        erro: "Configurações inválidas",
      });
    }

    user.tema_preferido = tema_preferido;
    user.notificar_pedidos = notificar_pedidos;
    user.notificar_promocoes = notificar_promocoes;
    user.notificar_seguranca = notificar_seguranca;

    await user.save();

    return res.status(200).json({
      sucesso: true,
      configuracoes: {
        tema_preferido: user.tema_preferido,
        notificar_pedidos: user.notificar_pedidos,
        notificar_promocoes: user.notificar_promocoes,
        notificar_seguranca: user.notificar_seguranca,
      },
    });
  } catch (err) {
    console.error("ERRO CONFIGURAÇÕES:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
