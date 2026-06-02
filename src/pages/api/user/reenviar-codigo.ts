import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import User from "@/models/User";
import { protegerRota } from "@/lib/middleware";
import { enviarCodigoEmail } from "@/lib/email";

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    const emailDestino = user.email_pendente || user.email;

    if (!emailDestino) {
      return res.status(400).json({
        erro: "Nenhum email encontrado",
      });
    }

    const codigo = gerarCodigo();

    await user.update({
      codigo_verificacao: codigo,
    });

    await enviarCodigoEmail(emailDestino, codigo);

    return res.status(200).json({
      sucesso: true,
      mensagem: "Código reenviado com sucesso",
    });
  } catch (err) {
    console.error("ERRO AO REENVIAR CÓDIGO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
