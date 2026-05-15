import type { NextApiRequest, NextApiResponse } from "next";
import { protegerRota } from "@/lib/middleware";
import Endereco from "@/models/Endereco";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user: any = protegerRota(req);

  if (!user) {
    return res.status(401).json({
      erro: "Não autorizado",
    });
  }

  const { nome, rua, numero, cidade, estado, bairro, cep } = req.body;

  try {
    const endereco = await Endereco.create({
      nome,
      rua,
      numero,
      cidade,
      estado,
      bairro,
      cep,

      user_id: user.id,
    });

    return res.status(200).json(endereco);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      erro: "Erro ao criar endereço",
    });
  }
}
