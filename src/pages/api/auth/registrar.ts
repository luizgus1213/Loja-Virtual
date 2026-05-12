import type { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { enviarCodigoEmail } from "@/lib/email";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { nome, email, senha } = req.body;

  try {
    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Preencha tudo",
      });
    }

    const existe = await User.findOne({
      where: { email },
    });

    if (existe) {
      return res.status(400).json({
        erro: "Email já existe",
      });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("ENVIANDO EMAIL PARA:", email);

    // TESTA EMAIL PRIMEIRO
    await enviarCodigoEmail(email, codigo);

    console.log("EMAIL ENVIADO");

    const senhaHash = await bcrypt.hash(senha + "melao", 10);

    const user = await User.create({
      nome,
      email,
      senha: senhaHash,

      cpf: null,
      numero_telefone: null,

      codigo_verificacao: codigo,
      email_verificado: false,
    });

    return res.status(200).json({
      sucesso: true,
      user,
    });
  } catch (err) {
    console.log("ERRO REGISTER:");
    console.log(err);

    return res.status(500).json({
      erro: "Erro ao cadastrar",
    });
  }
}
