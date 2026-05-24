import type { NextApiRequest, NextApiResponse } from "next";

import Carrinho from "@/models/Carrinho";
import CarrinhoItem from "@/models/CarrinhoItem";
import Produto from "@/models/Produto";

import { verificarToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT") {
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

    const { itemId, quantidade } = req.body;

    if (!Number.isInteger(quantidade) || quantidade < 1) {
      return res.status(400).json({
        erro: "Quantidade inválida",
      });
    }

    const carrinho: any = await Carrinho.findOne({
      where: {
        user_id: user.id,
      },
    });

    if (!carrinho) {
      return res.status(404).json({
        erro: "Carrinho não encontrado",
      });
    }

    const item: any = await CarrinhoItem.findOne({
      where: {
        id: itemId,
        carrinho_id: carrinho.id,
      },
    });

    if (!item) {
      return res.status(404).json({
        erro: "Item não encontrado",
      });
    }

    const produto: any = await Produto.findByPk(item.produto_id);

    if (!produto) {
      return res.status(404).json({
        erro: "Produto não encontrado",
      });
    }

    produto.estoque_reservado -= item.quantidade;

    if (produto.estoque_reservado < 0) {
      produto.estoque_reservado = 0;
    }

    const disponivel = produto.estoque - produto.estoque_reservado;

    if (quantidade > disponivel) {
      produto.estoque_reservado += item.quantidade;

      return res.status(400).json({
        erro: "Estoque insuficiente",
      });
    }

    produto.estoque_reservado += quantidade;

    await produto.save();

    item.quantidade = quantidade;

    await item.save();

    return res.status(200).json({
      sucesso: true,
      quantidade: item.quantidade,
    });
  } catch (err: any) {
    console.error(err);

    return res.status(500).json({
      erro: err.message,
    });
  }
}
