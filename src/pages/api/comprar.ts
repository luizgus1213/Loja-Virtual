import type { NextApiRequest, NextApiResponse } from "next";
import Produto from "@/models/Produto";

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
    const { produtoId, quantidade, cor, tamanho } = req.body;

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
      const tamanhosValidos = ["PP", "P", "M", "G", "GG"];

      if (!tamanho) {
        return res.status(400).json({
          erro: "Selecione um tamanho",
        });
      }

      if (!tamanhosValidos.includes(tamanho)) {
        return res.status(400).json({
          erro: "Tamanho inválido",
        });
      }
    }

    if (produto.estoque < quantidade) {
      return res.status(400).json({
        erro: "Estoque insuficiente",
      });
    }

    const total = produto.preco * quantidade;

    return res.status(200).json({
      produto: produto.nome,
      quantidade,
      cor,
      tamanho,
      precoUnitario: produto.preco,
      total,
    });
  } catch (err) {
    console.error("ERRO INTERNO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
