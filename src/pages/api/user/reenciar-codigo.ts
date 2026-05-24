import type { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/User";
import { protegerRota } from "@/lib/middleware";
import { enviarCodigoEmail } from "@/lib/email";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const userToken: any = protegerRota(req);

  try {
    const user: any = await User.findByPk(userToken.id);

    if (!user) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    await user.update({
      codigo_verificacao: codigo,
    });

    await enviarCodigoEmail(user.email_pendente || user.email, codigo);

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
