import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import User from "@/models/User";
import Produto from "@/models/Produto";
import Pedido from "@/models/Pedido";
import Cupom from "@/models/Cupom";
import Notificacao from "@/models/Notificacao";

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
  if (req.method !== "GET") {
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

    const [
      totalUsuarios,
      totalProdutos,
      totalPedidos,
      pedidosAguardando,
      pedidosPagos,
      pedidosPreparando,
      pedidosEnviados,
      pedidosEntregues,
      cuponsAtivos,
      notificacoesTotal,
      notificacoesNaoLidas,
      pedidosPagosLista,
    ] = await Promise.all([
      User.count(),
      Produto.count(),
      Pedido.count(),

      Pedido.count({
        where: {
          status: "aguardando_pagamento",
        },
      }),

      Pedido.count({
        where: {
          status: "pago",
        },
      }),

      Pedido.count({
        where: {
          status: "preparando",
        },
      }),

      Pedido.count({
        where: {
          status: "enviado",
        },
      }),

      Pedido.count({
        where: {
          status: "entregue",
        },
      }),

      Cupom.count({
        where: {
          ativo: true,
        },
      }),

      Notificacao.count(),

      Notificacao.count({
        where: {
          lida: false,
        },
      }),

      Pedido.findAll({
        where: {
          status: ["pago", "preparando", "enviado", "entregue"],
        },
        attributes: ["total"],
      }),
    ]);

    const faturamentoTotal = pedidosPagosLista.reduce(
      (acc: number, pedido: any) => {
        return acc + Number(pedido.total || 0);
      },
      0,
    );

    return res.status(200).json({
      totalUsuarios,
      totalProdutos,
      totalPedidos,
      pedidosAguardando,
      pedidosPagos,
      pedidosPreparando,
      pedidosEnviados,
      pedidosEntregues,
      cuponsAtivos,
      notificacoesTotal,
      notificacoesNaoLidas,
      faturamentoTotal,
    });
  } catch (err) {
    console.error("ERRO DASHBOARD ADMIN:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
