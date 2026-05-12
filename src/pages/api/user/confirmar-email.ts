import type { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/User";
import { protegerRota } from "@/lib/middleware";
import update from "./update";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const userToken: any = protegerRota(req);
  const { codigo } = req.body;

  try {
    const user: any = await User.findByPk(userToken.id);
    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    if (String(user.codigo_verificacao) !== String(codigo)) {
      return res.status(400).json({ erro: "Código inválido" });
    }

    await user.update({
      email: user.email_pendente || user.email,
      email_pendente: null,
      email_verificado: true,
      codigo_verificacao: null,
    });

    return res.status(200).json({ sucesso: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ erro: "Erro interno" });
  }
}
