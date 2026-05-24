import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Cupom from "@/models/Cupom";
import User from "@/models/User";
import { verificarToken } from "@/lib/auth";

async function verificarAdmin(req: NextApiRequest) {
  const token = req.cookies.token;

  if (!token) {
    return null;
  }

  const userToken: any = verificarToken(token);

  if (!userToken) {
    return null;
  }

  const user: any = await User.findByPk(userToken.id);

  if (!user || user.acesso !== "admin") {
    return null;
  }

  return user;
}

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
    const admin = await verificarAdmin(req);

    if (!admin) {
      return res.status(403).json({
        erro: "Acesso negado",
      });
    }

    const cupomId = Number(req.body.cupomId);

    if (!cupomId || Number.isNaN(cupomId)) {
      return res.status(400).json({
        erro: "Cupom inválido",
      });
    }

    const cupom: any = await Cupom.findByPk(cupomId);

    if (!cupom) {
      return res.status(404).json({
        erro: "Cupom não encontrado",
      });
    }

    cupom.ativo = !cupom.ativo;

    await cupom.save();

    return res.status(200).json({
      sucesso: true,
      cupom,
    });
  } catch (err) {
    console.error("ERRO ALTERAR CUPOM:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
