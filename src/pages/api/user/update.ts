import type { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/User";
import { protegerRota } from "@/lib/middleware";
import { enviarCodigoEmail } from "@/lib/email";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const userToken: any = protegerRota(req);

  if (!userToken || !userToken.id) {
    return res.status(401).json({ erro: "Não autorizado" });
  }

  const { descricao, cpf, numero_telefone, nome, email } = req.body;

  try {
    const user = await User.findByPk(userToken.id);

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    let cpfFinal = cpf;

    if (user.toJSON().cpf_verificado) {
      cpfFinal = user.toJSON().cpf;
    }

    const emailAtual = user.toJSON().email;

    if (email && email !== user.toJSON().email) {
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();

      await enviarCodigoEmail(email, codigo);

      await user.update({
        codigo_verificacao: codigo,
        email_verificado: false,
        email_pendente: email,
      });

      return res.status(200).json({
        precisaVerificarEmail: true,
      });
    }

    // 🟢 SALVA NORMAL SEM EMAIL
    await user.update({
      descricao,
      numero_telefone,
      nome,
      cpf: cpfFinal || null,
      cpf_verificado: !!cpfFinal,
    });

    return res.status(200).json({
      precisaVerificarEmail: false,
    });
  } catch (err) {
    console.log("ERRO UPDATE USER:", err);
    return res.status(500).json({ erro: "Erro ao atualizar" });
  }
}
