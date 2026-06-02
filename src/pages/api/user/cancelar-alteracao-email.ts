import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import User from "@/models/User";
import { protegerRota } from "@/lib/middleware";

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
    const userToken: any = protegerRota(req);

    if (!userToken?.id) {
      return res.status(401).json({
        erro: "Não autorizado",
      });
    }

    const user: any = await User.findByPk(userToken.id);

    if (!user) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    await user.update({
      email_pendente: null,
      codigo_verificacao: null,
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: "Alteração de email cancelada",
    });
  } catch (err) {
    console.error("ERRO AO CANCELAR ALTERAÇÃO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
