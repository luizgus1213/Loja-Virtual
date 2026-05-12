import type { NextApiRequest, NextApiResponse } from "next";

import User from "@/models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { email, codigo } = req.body;

  try {
    const user: any = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    console.log("CODIGO BANCO:", user.codigo_verificacao);

    console.log("CODIGO RECEBIDO:", codigo);

    if (String(user.codigo_verificacao) !== String(codigo)) {
      return res.status(400).json({
        erro: "Código inválido",
      });
    }

    user.email_verificado = true;

    user.codigo_verificacao = null;

    await user.save();

    console.log("EMAIL VERIFICADO");

    return res.status(200).json({
      sucesso: true,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      erro: "Erro interno",
    });
  }
}
