import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Cupom from "@/models/Cupom";
import User from "@/models/User";
import { verificarToken } from "@/lib/auth";

async function verificarAdmin(req: NextApiRequest) {
  const token = req.cookies.token;

  if (!token) {
    return null;
  }

  const userToken: any = verificarToken(token);

  if (!userToken) {
    return null;
  }

  const user: any = await User.findByPk(userToken.id);

  if (!user || user.acesso !== "admin") {
    return null;
  }

  return user;
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
    const admin = await verificarAdmin(req);

    if (!admin) {
      return res.status(403).json({
        erro: "Acesso negado",
      });
    }

    const codigo = String(req.body.codigo || "")
      .trim()
      .toUpperCase();
    const tipoRecebido = String(req.body.tipo || "")
      .trim()
      .toLowerCase();
    const valor = Number(req.body.valor);
    const usoMaximo = req.body.uso_maximo ? Number(req.body.uso_maximo) : null;
    const valorMinimoPedido = Number(req.body.valor_minimo_pedido || 0);
    const dataExpiracao = req.body.data_expiracao || null;

    let tipoFinal = tipoRecebido;

    if (tipoFinal === "percentual") {
      tipoFinal = "porcentagem";
    }

    if (!codigo || codigo.length < 3 || codigo.length > 30) {
      return res.status(400).json({
        erro: "Código inválido",
      });
    }

    if (!["porcentagem", "fixo"].includes(tipoFinal)) {
      return res.status(400).json({
        erro: "Tipo inválido",
      });
    }

    if (!valor || Number.isNaN(valor) || valor <= 0) {
      return res.status(400).json({
        erro: "Valor inválido",
      });
    }

    if (tipoFinal === "porcentagem" && valor > 100) {
      return res.status(400).json({
        erro: "Cupom de porcentagem não pode passar de 100%",
      });
    }

    if (usoMaximo !== null && (!Number.isInteger(usoMaximo) || usoMaximo < 1)) {
      return res.status(400).json({
        erro: "Uso máximo inválido",
      });
    }

    if (valorMinimoPedido < 0 || Number.isNaN(valorMinimoPedido)) {
      return res.status(400).json({
        erro: "Valor mínimo inválido",
      });
    }

    const existe = await Cupom.findOne({
      where: {
        codigo,
      },
    });

    if (existe) {
      return res.status(400).json({
        erro: "Este cupom já existe",
      });
    }

    const cupom = await Cupom.create({
      codigo,
      tipo: tipoFinal,
      valor,
      ativo: true,
      data_expiracao: dataExpiracao || null,
      uso_maximo: usoMaximo,
      usos_atual: 0,
      valor_minimo_pedido: valorMinimoPedido,
    } as any);

    return res.status(201).json({
      sucesso: true,
      cupom,
    });
  } catch (err) {
    console.error("ERRO CRIAR CUPOM:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
