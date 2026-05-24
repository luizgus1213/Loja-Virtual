import type { NextApiRequest, NextApiResponse } from "next";
import Arquivo from "@/models/Arquivo";
import upload from "@/lib/upload";
import Produto from "@/models/Produto";
import ProdutoImagem from "@/models/ProdutoImagem";
import "@/models";

export const config = {
  api: {
    bodyParser: false,
  },
};

const middleWare = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: Function,
) => {
  return new Promise((resolve, reject) => {
    next(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
};

interface NextApiComArquivo extends NextApiRequest {
  file: any;
}

export default async function handler(
  req: NextApiComArquivo,
  res: NextApiResponse,
) {
  try {
    await middleWare(req, res, upload.single("arquivo"));

    const arquivo_enviado = req.file;
    const produto_id = req.body.produto_id;

    if (!arquivo_enviado) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado" });
    }

    if (!produto_id) {
      return res.status(400).json({ erro: "Produto não informado" });
    }

    const produto: any = await Produto.findByPk(produto_id);

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    const registro_arquivo: any = await Arquivo.create({
      nome: arquivo_enviado.originalname,
      link: "uploads/" + arquivo_enviado.filename,
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
    console.log(error);
    return res
      .status(500)
      .json({ erro: error.message || "Erro ao enviar imagem" });
  }
}
