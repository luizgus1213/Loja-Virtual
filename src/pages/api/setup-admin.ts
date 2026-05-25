import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import User from "@/models/User";
import bcrypt from "bcrypt";

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
    const setupKey = req.headers["x-setup-key"];

    if (!process.env.ADMIN_SETUP_KEY) {
      return res.status(500).json({
        erro: "ADMIN_SETUP_KEY não configurada no servidor",
      });
    }

    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({
        erro: "Chave inválida",
      });
    }

    const nome = String(req.body.nome || "Admin").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const senha = String(req.body.senha || "");

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Informe email e senha",
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        erro: "A senha precisa ter pelo menos 6 caracteres",
      });
    }

    const senhaHash = await bcrypt.hash(senha + "melao", 10);

    let user: any = await User.findOne({
      where: {
        email,
      },
    });

    if (user) {
      await user.update({
        nome: user.nome || nome,
        senha: senhaHash,
        acesso: "admin",
        email_verificado: true,
        conta_desativada: false,
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Usuário existente atualizado para admin",
        email,
      });
    }

    user = await User.create({
      nome,
      email,
      senha: senhaHash,
      acesso: "admin",
      email_verificado: true,
      cpf: Math.random().toString(),
      cpf_verificado: false,
      numero_telefone: Math.random().toString(),
      conta_desativada: false,
      tema_preferido: "dark",
      notificar_pedidos: true,
      notificar_promocoes: true,
      notificar_seguranca: true,
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: "Admin criado com sucesso",
      email: user.email,
    });
  } catch (err: any) {
    console.error("ERRO SETUP ADMIN:", err);

    return res.status(500).json({
      erro: err?.message || "Erro ao criar admin",
    });
  }
}
