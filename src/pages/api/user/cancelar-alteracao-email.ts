import type { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/User";
import { protegerRota } from "@/lib/middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const userToken: any = protegerRota(req);

  if (!userToken) {
    return res.status(401).json({
      erro: "Não autorizado",
    });
  }

  try {
    const user: any = await User.findByPk(userToken.id);

    if (!user) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    await user.update({
      email_pendente: null,
      codigo_verificacao: null,
      email_verificado: true,
    });

    return res.status(200).json({
      sucesso: true,
    });
  } catch (err) {
    console.error("ERRO INTERNO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
