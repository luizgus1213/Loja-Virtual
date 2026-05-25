import type { NextApiResponse } from "next";

import "@/models";

import { expirarPedidosPendentes } from "@/lib/pedidos";
import Product from "@/models/Produto";
import Arquivo from "@/models/Arquivo";
import ProdutoImagem from "@/models/ProdutoImagem";
import { protegerRota } from "@/lib/middleware";

import {
  uploadVariosArquivos,
  obterLinkArquivo,
  NextApiComArquivo,
} from "@/lib/upload";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function criar(
  req: NextApiComArquivo,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido",
    });
  }

  try {
    await expirarPedidosPendentes();

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

    await uploadVariosArquivos(req, res);

    const { nome, marca, categoria, descricao, preco, estoque } = req.body;

    if (!nome || !marca || !categoria || !descricao) {
      return res.status(400).json({
        erro: "Preencha todos os campos",
      });
    }

    if (!preco || Number(preco) <= 0) {
      return res.status(400).json({
        erro: "Preço inválido",
      });
    }

    if (estoque === undefined || Number(estoque) < 0) {
      return res.status(400).json({
        erro: "Estoque inválido",
      });
    }

    const produto: any = await Product.create({
      nome,
      marca,
      categoria,
      descricao,
      preco: Number(preco),
      estoque: Number(estoque),
      avaliacao: 0,
      imagem_id: null,
      estoque_reservado: 0,
    });

    const arquivos = Array.isArray(req.files) ? req.files : [];

    for (let i = 0; i < arquivos.length; i++) {
      const file = arquivos[i];

      const arquivo: any = await Arquivo.create({
        nome: file.originalname,
        link: obterLinkArquivo(file.filename),
        provider: "local",
      });

      await ProdutoImagem.create({
        produto_id: produto.id,
        arquivo_id: arquivo.id,
        principal: i === 0,
        ordem: i,
      });

      if (i === 0) {
        await produto.update({
          imagem_id: arquivo.id,
        });
      }
    }

    return res.status(200).json(produto);
  } catch (err: any) {
    console.error("ERRO INTERNO AO CRIAR PRODUTO:", err);

    return res.status(500).json({
      erro: err?.message || "Erro interno no servidor",
    });
  }
}
