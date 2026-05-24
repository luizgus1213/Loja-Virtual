import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Produto from "@/models/Produto";
import Carrinho from "@/models/Carrinho";
import CarrinhoItem from "@/models/CarrinhoItem";
import { verificarToken } from "@/lib/auth";

const TAMANHOS_VALIDOS = ["PP", "P", "M", "G", "GG"];
const QUANTIDADE_MAXIMA_POR_PRODUTO = 20;

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

    const produtoId = Number(req.body.produtoId);
    const quantidade = Number(req.body.quantidade);
    const cor = String(req.body.cor || "").trim();
    const tamanho = req.body.tamanho ? String(req.body.tamanho).trim() : null;

    if (!produtoId || Number.isNaN(produtoId)) {
      return res.status(400).json({
        erro: "Produto inválido",
      });
    }

    if (!Number.isInteger(quantidade) || quantidade < 1) {
      return res.status(400).json({
        erro: "Quantidade inválida",
      });
    }

    if (quantidade > QUANTIDADE_MAXIMA_POR_PRODUTO) {
      return res.status(400).json({
        erro: `Quantidade máxima por produto é ${QUANTIDADE_MAXIMA_POR_PRODUTO}`,
      });
    }

    if (!cor || cor.length > 30) {
      return res.status(400).json({
        erro: "Cor inválida",
      });
    }

    const produto: any = await Produto.findByPk(produtoId);

    if (!produto) {
      return res.status(404).json({
        erro: "Produto não encontrado",
      });
    }

    const isRoupa =
      produto.categoria?.toLowerCase().includes("roupa") ||
      produto.descricao?.toLowerCase().includes("roupa");

    if (isRoupa) {
      if (!tamanho) {
        return res.status(400).json({
          erro: "Selecione um tamanho",
        });
      }

      if (!TAMANHOS_VALIDOS.includes(tamanho)) {
        return res.status(400).json({
          erro: "Tamanho inválido",
        });
      }
    }

    const estoque = Number(produto.estoque || 0);
    const estoqueReservado = Number(produto.estoque_reservado || 0);
    const disponivel = estoque - estoqueReservado;

    if (disponivel <= 0) {
      return res.status(400).json({
        erro: "Produto sem estoque disponível",
      });
    }

    if (quantidade > disponivel) {
      return res.status(400).json({
        erro: "Estoque insuficiente",
      });
    }

    let carrinho: any = await Carrinho.findOne({
      where: {
        user_id: user.id,
      },
    });

    if (!carrinho) {
      carrinho = await Carrinho.create({
        user_id: user.id,
      });
    }

    const whereItem: any = {
      carrinho_id: carrinho.id,
      produto_id: produto.id,
      cor,
      tamanho: isRoupa ? tamanho : null,
    };

    const itemExistente: any = await CarrinhoItem.findOne({
      where: whereItem,
    });

    let itemFinal: any = null;

    if (itemExistente) {
      const novaQuantidade = Number(itemExistente.quantidade || 0) + quantidade;

      if (novaQuantidade > QUANTIDADE_MAXIMA_POR_PRODUTO) {
        return res.status(400).json({
          erro: `Quantidade máxima por produto é ${QUANTIDADE_MAXIMA_POR_PRODUTO}`,
        });
      }

      if (novaQuantidade > disponivel) {
        return res.status(400).json({
          erro: "Estoque insuficiente",
        });
      }

      itemExistente.quantidade = novaQuantidade;

      await itemExistente.save();

      itemFinal = itemExistente;
    } else {
      itemFinal = await CarrinhoItem.create({
        carrinho_id: carrinho.id,
        produto_id: produto.id,
        quantidade,
        cor,
        tamanho: isRoupa ? tamanho : null,
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Produto adicionado ao carrinho",
      itemId: itemFinal.id,
    });
  } catch (err) {
    console.error("ERRO ADICIONAR AO CARRINHO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
