import type { NextApiRequest, NextApiResponse } from "next";

import Endereco from "@/models/Endereco";
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

    const user: any = verificarToken(token);

    if (!user) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    const enderecoId = Number(req.body.enderecoId);

    if (!enderecoId || Number.isNaN(enderecoId)) {
      return res.status(400).json({
        erro: "Endereço inválido",
      });
    }

    const endereco = await Endereco.findOne({
      where: {
        id: enderecoId,
        user_id: user.id,
      },
    });

    if (!endereco) {
      return res.status(404).json({
        erro: "Endereço não encontrado",
      });
    }

    await Endereco.update(
      {
        endereco_padrao: false,
      },
      {
        where: {
          user_id: user.id,
        },
      },
    );

    await endereco.update({
      endereco_padrao: true,
    });

    return res.status(200).json({
      sucesso: true,
      endereco,
    });
  } catch (err) {
    console.error("ERRO DEFINIR ENDEREÇO PADRÃO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
