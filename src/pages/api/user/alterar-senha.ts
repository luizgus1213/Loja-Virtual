import type { NextApiRequest, NextApiResponse } from "next";

import bcrypt from "bcrypt";

import User from "@/models/User";
import { protegerRota } from "@/lib/middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // 🔥 ACEITA APENAS POST
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido",
    });
  }

  // 🔥 VERIFICA TOKEN
  const userToken: any = protegerRota(req);

  if (!userToken || !userToken.id) {
    return res.status(401).json({
      erro: "Não autorizado",
    });
  }

  // 🔥 PEGA DADOS
  const { senhaAtual, novaSenha } = req.body;

  // 🔥 VALIDAÇÃO BACK-END
  if (typeof senhaAtual !== "string" || typeof novaSenha !== "string") {
    return res.status(400).json({
      erro: "Dados inválidos",
    });
  }

  if (!senhaAtual.trim() || !novaSenha.trim()) {
    return res.status(400).json({
      erro: "Preencha todos os campos",
    });
  }

  // 🔥 TAMANHO MÍNIMO
  if (novaSenha.length < 6) {
    return res.status(400).json({
      erro: "Nova senha muito curta",
    });
  }

  // 🔥 EVITA SENHA GIGANTE
  if (novaSenha.length > 100) {
    return res.status(400).json({
      erro: "Senha muito grande",
    });
  }

  try {
    // 🔥 BUSCA USER
    const user: any = await User.findByPk(userToken.id);

    if (!user) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    // 🔥 COMPARA SENHA
    const senhaCorreta = await bcrypt.compare(senhaAtual + "melao", user.senha);

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "Senha atual incorreta",
      });
    }

    // 🔥 EVITA TROCAR PELA MESMA
    const senhaIgual = await bcrypt.compare(novaSenha + "melao", user.senha);

    if (senhaIgual) {
      return res.status(400).json({
        erro: "A nova senha não pode ser igual à antiga",
      });
    }

    // 🔥 HASH NOVA SENHA
    const hash = await bcrypt.hash(novaSenha + "melao", 10);

    // 🔥 SALVA
    await user.update({
      senha: hash,
    });

    return res.status(200).json({
      sucesso: true,
    });
  } catch (err) {
    console.log("ERRO ALTERAR SENHA:");
    console.log(err);

    return res.status(500).json({
      erro: "Erro interno",
    });
  }
}
