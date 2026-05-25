import type { NextApiResponse } from "next";

import "@/models";

import Arquivo from "@/models/Arquivo";
import Produto from "@/models/Produto";
import ProdutoImagem from "@/models/ProdutoImagem";

import {
  uploadArquivo,
  obterLinkArquivo,
  NextApiComArquivo,
} from "@/lib/upload";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiComArquivo,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido",
    });
  }

  try {
    await uploadArquivo(req, res);

    const arquivo_enviado = req.file;
    const produto_id = req.body.produto_id;

    if (!arquivo_enviado) {
      return res.status(400).json({
        erro: "Nenhum arquivo enviado",
      });
    }

    if (!produto_id) {
      return res.status(400).json({
        erro: "Produto não informado",
      });
    }

    const produto: any = await Produto.findByPk(produto_id);

    if (!produto) {
      return res.status(404).json({
        erro: "Produto não encontrado",
      });
    }

    const registro_arquivo: any = await Arquivo.create({
      nome: arquivo_enviado.originalname,
      link: obterLinkArquivo(arquivo_enviado.filename),
      provider: "local",
    });

    const quantidadeImagens = await ProdutoImagem.count({
      where: {
        produto_id,
      },
    });

    await ProdutoImagem.create({
      produto_id,
      arquivo_id: registro_arquivo.id,
      principal: quantidadeImagens === 0,
      ordem: quantidadeImagens,
    });

    if (quantidadeImagens === 0) {
      await produto.update({
        imagem_id: registro_arquivo.id,
      });
    }

    return res.status(200).json({
      sucesso: true,
      arquivo: registro_arquivo,
    });
  } catch (error: any) {
    console.log("ERRO UPLOAD IMAGEM:", error);

    return res.status(500).json({
      erro: error?.message || "Erro ao enviar imagem",
    });
  }
}
