import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

import User from "@/models/User";
import { verificarToken } from "@/lib/auth";

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

    const { senhaAtual, novaSenha, confirmarNovaSenha } = req.body;

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      return res.status(400).json({
        erro: "Preencha todos os campos",
      });
    }

    if (String(novaSenha).length < 6) {
      return res.status(400).json({
        erro: "A nova senha precisa ter pelo menos 6 caracteres",
      });
    }

    if (novaSenha !== confirmarNovaSenha) {
      return res.status(400).json({
        erro: "As senhas não conferem",
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

    const senhaValida = await bcrypt.compare(
      String(senhaAtual) + "melao",
      user.senha,
    );

    if (!senhaValida) {
      return res.status(401).json({
        erro: "Senha atual incorreta",
      });
    }

    const senhaHash = await bcrypt.hash(String(novaSenha) + "melao", 10);

    user.senha = senhaHash;
    user.token_version = Number(user.token_version || 1) + 1;

    await user.save();

    res.setHeader(
      "Set-Cookie",
      "token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Senha alterada. Faça login novamente.",
    });
  } catch (err) {
    console.error("ERRO ALTERAR SENHA:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
