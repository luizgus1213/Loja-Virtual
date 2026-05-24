import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import { Op } from "sequelize";

import Cupom from "@/models/Cupom";
import { verificarToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
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

    const agora = new Date();

    const cupons = await Cupom.findAll({
      where: {
        ativo: true,

        [Op.or]: [
          {
            data_expiracao: null,
          },
          {
            data_expiracao: {
              [Op.gt]: agora,
            },
          },
        ],
      },

      order: [["id", "DESC"]],
    });

    const cuponsDisponiveis = cupons.filter((cupom: any) => {
      if (
        cupom.uso_maximo !== null &&
        cupom.uso_maximo !== undefined &&
        Number(cupom.usos_atual || 0) >= Number(cupom.uso_maximo)
      ) {
        return false;
      }

      return true;
    });

    return res.status(200).json(cuponsDisponiveis);
  } catch (err) {
    console.error("ERRO LISTAR CUPONS DISPONÍVEIS:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
