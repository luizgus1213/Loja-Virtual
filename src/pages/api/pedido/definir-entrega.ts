import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Pedido from "@/models/Pedido";
import PedidoItem from "@/models/PedidoItem";
import Endereco from "@/models/Endereco";

import { verificarToken } from "@/lib/auth";
import { expirarPedidosPendentes } from "@/lib/pedidos";

const fretesPermitidos = {
  normal: {
    valor: 12.9,
    prazo: "5 a 7 dias úteis",
  },
  expresso: {
    valor: 24.9,
    prazo: "2 a 3 dias úteis",
  },
};

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
    await expirarPedidosPendentes();

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

    const pedidoId = Number(req.body.pedidoId);
    const enderecoId = Number(req.body.enderecoId);
    const freteTipo = String(req.body.freteTipo || "");

    if (!pedidoId || Number.isNaN(pedidoId)) {
      return res.status(400).json({
        erro: "Pedido inválido",
      });
    }

    if (!enderecoId || Number.isNaN(enderecoId)) {
      return res.status(400).json({
        erro: "Endereço inválido",
      });
    }

    if (!["normal", "expresso"].includes(freteTipo)) {
      return res.status(400).json({
        erro: "Frete inválido",
      });
    }

    const pedido: any = await Pedido.findOne({
      where: {
        id: pedidoId,
        user_id: user.id,
        status: "aguardando_pagamento",
      },
    });

    if (!pedido) {
      return res.status(404).json({
        erro: "Pedido pendente não encontrado",
      });
    }

    const endereco: any = await Endereco.findOne({
      where: {
        id: enderecoId,
        user_id: user.id,
      },
    });

    if (!endereco) {
      return res.status(403).json({
        erro: "Endereço não pertence ao usuário",
      });
    }

    const itens: any[] = await PedidoItem.findAll({
      where: {
        pedido_id: pedido.id,
      },
    });

    if (itens.length === 0) {
      return res.status(400).json({
        erro: "Pedido sem itens",
      });
    }

    const totalProdutos = itens.reduce((total, item: any) => {
      return total + Number(item.preco_unitario) * Number(item.quantidade);
    }, 0);

    const dadosFrete =
      fretesPermitidos[freteTipo as keyof typeof fretesPermitidos];

    const totalFinal = Number((totalProdutos + dadosFrete.valor).toFixed(2));

    await pedido.update({
      endereco_id: endereco.id,
      frete_tipo: freteTipo,
      frete_valor: dadosFrete.valor,
      total_produtos: totalProdutos,
      total: totalFinal,
    });

    return res.status(200).json({
      sucesso: true,
      pedido: {
        id: pedido.id,
        total_produtos: totalProdutos,
        frete_tipo: freteTipo,
        frete_valor: dadosFrete.valor,
        prazo: dadosFrete.prazo,
        total: totalFinal,
        endereco,
      },
    });
  } catch (err) {
    console.error("ERRO DEFINIR ENTREGA:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
