import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Cupom from "@/models/Cupom";
import Pedido from "@/models/Pedido";
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
  if (req.method !== "DELETE") {
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

    const cupom = await Cupom.findByPk(cupomId);

    if (!cupom) {
      return res.status(404).json({
        erro: "Cupom não encontrado",
      });
    }

    const pedidoUsandoCupom = await Pedido.findOne({
      where: {
        cupom_id: cupomId,
      },
    });

    if (pedidoUsandoCupom) {
      return res.status(400).json({
        erro: "Este cupom já foi usado em pedido. Desative em vez de excluir.",
      });
    }

    await cupom.destroy();

    return res.status(200).json({
      sucesso: true,
    });
  } catch (err) {
    console.error("ERRO EXCLUIR CUPOM:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
