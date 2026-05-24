import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Cupom from "@/models/Cupom";
import { verificarToken } from "@/lib/auth";

function calcularDesconto(cupom: any, totalProdutos: number) {
  let desconto = 0;

  if (cupom.tipo === "porcentagem") {
    desconto = (totalProdutos * Number(cupom.valor || 0)) / 100;
  } else if (cupom.tipo === "fixo") {
    desconto = Number(cupom.valor || 0);
  } else {
    throw new Error("Tipo de cupom inválido");
  }

  if (desconto > totalProdutos) {
    desconto = totalProdutos;
  }

  return Number(desconto.toFixed(2));
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

    const codigo = String(req.body.codigo || req.body.cupomCodigo || "")
      .trim()
      .toUpperCase();

    const totalProdutos = Number(req.body.totalProdutos || req.body.total || 0);

    if (!codigo) {
      return res.status(400).json({
        erro: "Digite um cupom",
      });
    }

    if (!totalProdutos || Number.isNaN(totalProdutos) || totalProdutos <= 0) {
      return res.status(400).json({
        erro: "Total inválido",
      });
    }

    const cupom: any = await Cupom.findOne({
      where: {
        codigo,
      },
    });

    if (!cupom) {
      return res.status(404).json({
        erro: "Cupom não encontrado",
      });
    }

    if (!cupom.ativo) {
      return res.status(400).json({
        erro: "Cupom inativo",
      });
    }

    if (cupom.data_expiracao) {
      const expiracao = new Date(cupom.data_expiracao);
      const agora = new Date();

      if (expiracao < agora) {
        return res.status(400).json({
          erro: "Cupom expirado",
        });
      }
    }

    if (
      cupom.uso_maximo !== null &&
      cupom.uso_maximo !== undefined &&
      Number(cupom.usos_atual || 0) >= Number(cupom.uso_maximo)
    ) {
      return res.status(400).json({
        erro: "Limite de uso do cupom atingido",
      });
    }

    if (totalProdutos < Number(cupom.valor_minimo_pedido || 0)) {
      return res.status(400).json({
        erro: `Pedido mínimo para este cupom é ${new Intl.NumberFormat(
          "pt-BR",
          {
            style: "currency",
            currency: "BRL",
          },
        ).format(Number(cupom.valor_minimo_pedido || 0))}`,
      });
    }

    const desconto = calcularDesconto(cupom, totalProdutos);

    return res.status(200).json({
      sucesso: true,
      desconto,
      cupom: {
        id: cupom.id,
        codigo: cupom.codigo,
        tipo: cupom.tipo,
        valor: cupom.valor,
        desconto,
      },
    });
  } catch (err) {
    console.error("ERRO VALIDAR CUPOM:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
