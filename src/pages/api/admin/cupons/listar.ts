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
  if (req.method !== "GET") {
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

    const cupons = await Cupom.findAll({
      order: [["id", "DESC"]],
    });

    return res.status(200).json(cupons);
  } catch (err) {
    console.error("ERRO LISTAR CUPONS:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
