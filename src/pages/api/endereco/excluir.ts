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

  try {
    const endereco: any = await Endereco.findByPk(req.body.id);

    if (!endereco) {
      return res.status(404).json({
        erro: "Endereço não encontrado",
      });
    }

    if (endereco.user_id !== user.id) {
      return res.status(403).json({
        erro: "Sem permissão",
      });
    }

    await endereco.destroy();

    return res.status(200).json({
      sucesso: true,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      erro: "Erro ao excluir",
    });
  }
}
