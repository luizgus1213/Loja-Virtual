import type { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { gerarToken } from "@/lib/auth";
import { serialize } from "cookie";
import { and } from "sequelize";
console.log(process.env.JWT_SECRET);
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios" });
  }

  const user: any = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({ erro: "Usuário não encontrado, mané" });
  }

  const senhaValida = await bcrypt.compare(
    senha + "melao",
    user.get("senha") as string,
  );

  if (!email.includes("@")) {
    return res.status(400).json({ erro: "Email inválido" });
  }

  if (!email.split("@")[1].includes(".")) {
    return res.status(400).json({ erro: "Email inválido" });
  }
  if (!senhaValida) {
    return res.status(401).json({ erro: "Senha inválida" });
  }

  const token: any = gerarToken(user);

  res.setHeader(
    "Set-Cookie",
    serialize("token", token, {
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 2,
    }),
  );
  return res.status(200).json({ ok: true });
}
