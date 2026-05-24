import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Pedido from "@/models/Pedido";
import PedidoItem from "@/models/PedidoItem";
import Produto from "@/models/Produto";
import Avaliacao from "@/models/Avaliacao";

import { verificarToken } from "@/lib/auth";

async function atualizarMediaProduto(produtoId: number) {
  const avaliacoes: any[] = await Avaliacao.findAll({
    where: {
      produto_id: produtoId,
    },
  });

  if (avaliacoes.length === 0) {
    await Produto.update(
      {
        avaliacao: 0,
      },
      {
        where: {
          id: produtoId,
        },
      },
    );

    return;
  }

  const soma = avaliacoes.reduce((acc, avaliacao: any) => {
    return acc + Number(avaliacao.nota || 0);
  }, 0);

  const media = soma / avaliacoes.length;

  await Produto.update(
    {
      avaliacao: Number(media.toFixed(1)),
    },
    {
      where: {
        id: produtoId,
      },
    },
  );
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

    const pedidoId = Number(req.body.pedidoId);
    const produtoId = Number(req.body.produtoId);
    const nota = Number(req.body.nota);
    const comentario = String(req.body.comentario || "").trim();

    if (!pedidoId || Number.isNaN(pedidoId)) {
      return res.status(400).json({
        erro: "Pedido inválido",
      });
    }

    if (!produtoId || Number.isNaN(produtoId)) {
      return res.status(400).json({
        erro: "Produto inválido",
      });
    }

    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      return res.status(400).json({
        erro: "A nota deve ser entre 1 e 5",
      });
    }

    if (comentario.length > 500) {
      return res.status(400).json({
        erro: "Comentário muito grande",
      });
    }

    const pedido: any = await Pedido.findOne({
      where: {
        id: pedidoId,
        user_id: user.id,
      },
    });

    if (!pedido) {
      return res.status(404).json({
        erro: "Pedido não encontrado",
      });
    }

    if (pedido.status !== "entregue") {
      return res.status(400).json({
        erro: "Você só pode avaliar produtos de pedidos entregues",
      });
    }

    const item = await PedidoItem.findOne({
      where: {
        pedido_id: pedido.id,
        produto_id: produtoId,
      },
    });

    if (!item) {
      return res.status(403).json({
        erro: "Este produto não pertence ao pedido",
      });
    }

    const jaAvaliou = await Avaliacao.findOne({
      where: {
        user_id: user.id,
        produto_id: produtoId,
        pedido_id: pedidoId,
      },
    });

    if (jaAvaliou) {
      return res.status(400).json({
        erro: "Você já avaliou este produto neste pedido",
      });
    }

    const avaliacao = await Avaliacao.create({
      user_id: user.id,
      produto_id: produtoId,
      pedido_id: pedidoId,
      nota,
      comentario: comentario || null,
    } as any);

    await atualizarMediaProduto(produtoId);

    return res.status(201).json({
      sucesso: true,
      avaliacao,
    });
  } catch (err) {
    console.error("ERRO CRIAR AVALIAÇÃO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
