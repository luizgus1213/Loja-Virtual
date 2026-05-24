import { Op } from "sequelize";

import Pedido from "@/models/Pedido";
import PedidoItem from "@/models/PedidoItem";
import Produto from "@/models/Produto";

export function gerarDataExpiracaoPedido() {
  return new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
}

export async function expirarPedidosPendentes() {
  const pedidosExpirados: any[] = await Pedido.findAll({
    where: {
      status: "aguardando_pagamento",
      expiresAt: {
        [Op.lte]: new Date(),
      },
    },
  });

  for (const pedido of pedidosExpirados) {
    const itens: any[] = await PedidoItem.findAll({
      where: {
        pedido_id: pedido.id,
      },
    });

    for (const item of itens) {
      const produto: any = await Produto.findByPk(item.produto_id);

      if (!produto) continue;

      produto.estoque_reservado =
        Number(produto.estoque_reservado || 0) - Number(item.quantidade || 0);

      if (produto.estoque_reservado < 0) {
        produto.estoque_reservado = 0;
      }

      await produto.save();
    }

    pedido.status = "expirado";
    await pedido.save();
  }
}
