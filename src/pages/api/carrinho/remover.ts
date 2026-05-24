import type { NextApiRequest, NextApiResponse } from "next";

import Carrinho from "@/models/Carrinho";
import CarrinhoItem from "@/models/CarrinhoItem";

import { verificarToken } from "@/lib/auth";
import Produto from "@/models/Produto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE") {
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

    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        erro: "ID do item inválido",
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

    if (produto) {
      produto.estoque_reservado -= item.quantidade;

      if (produto.estoque_reservado < 0) {
        produto.estoque_reservado = 0;
      }

      await produto.save();
    }
    await item.destroy();

    return res.status(200).json({
      sucesso: true,
    });
  } catch (err: any) {
    console.error(err);

    return res.status(500).json({
      erro: err.message,
    });
  }
}
