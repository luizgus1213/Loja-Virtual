// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Arquivo from "@/models/Arquivo";
import sequelize from "@/database";
import upload from "@/lib/upload";
import Product from "@/models/Produto";

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
      if (result instanceof Error) {
        return reject(result);
      }
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

    const registro_arquivo = await Arquivo.create({
      nome: arquivo_enviado.originalname,
      link: "uploads/" + arquivo_enviado.filename,
      provider: "local",
    });

    if (produto_id) {
      const produto = await Product.findByPk(produto_id);

      if (produto) {
        produto.update({
          imagem_id: registro_arquivo.toJSON().id,
        });

        return res.status(200).json({ registro_arquivo, produto });
      }
    }

    return res.status(200).json(registro_arquivo);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ mensagem: "Deu ruim" });
  }
}
