import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Produto from "@/models/Produto";
import { protegerRota } from "@/lib/middleware";

function textoValido(valor: any, minimo = 1, maximo = 120) {
  const texto = String(valor || "").trim();

  if (texto.length < minimo) return false;
  if (texto.length > maximo) return false;

  return true;
}

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
    const user: any = protegerRota(req);

    if (!user) {
      return res.status(401).json({
        erro: "Não autenticado",
      });
    }

    if (user.acesso !== "admin") {
      return res.status(403).json({
        erro: "Acesso negado",
      });
    }

    const { id, nome, marca, categoria, descricao, preco, estoque } = req.body;

    const produtoId = Number(id);

    if (!produtoId || Number.isNaN(produtoId) || !Number.isInteger(produtoId)) {
      return res.status(400).json({
        erro: "Produto inválido",
      });
    }

    if (!textoValido(nome, 2, 120)) {
      return res.status(400).json({
        erro: "Nome inválido",
      });
    }

    if (!textoValido(marca, 1, 80)) {
      return res.status(400).json({
        erro: "Marca inválida",
      });
    }

    if (!textoValido(categoria, 2, 80)) {
      return res.status(400).json({
        erro: "Categoria inválida",
      });
    }

    if (!textoValido(descricao, 5, 2000)) {
      return res.status(400).json({
        erro: "Descrição inválida",
      });
    }

    const precoNumero = Number(preco);
    const estoqueNumero = Number(estoque);

    if (Number.isNaN(precoNumero) || precoNumero <= 0) {
      return res.status(400).json({
        erro: "Preço inválido",
      });
    }

    if (
      Number.isNaN(estoqueNumero) ||
      !Number.isInteger(estoqueNumero) ||
      estoqueNumero < 0
    ) {
      return res.status(400).json({
        erro: "Estoque inválido",
      });
    }

    const produto: any = await Produto.findByPk(produtoId);

    if (!produto) {
      return res.status(404).json({
        erro: "Produto não encontrado",
      });
    }

    await produto.update({
      nome: String(nome).trim(),
      marca: String(marca).trim(),
      categoria: String(categoria).trim(),
      descricao: String(descricao).trim(),
      preco: Number(precoNumero.toFixed(2)),
      estoque: estoqueNumero,
    });

    return res.status(200).json({
      sucesso: true,
      produto,
    });
  } catch (err: any) {
    console.error("ERRO EDITAR PRODUTO:", err);

    return res.status(500).json({
      erro: err?.message || "Erro interno no servidor",
    });
  }
}
