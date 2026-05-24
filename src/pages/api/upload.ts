// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Arquivo from "@/models/Arquivo";
import sequelize from "@/database";
import upload from "@/lib/upload";
import Product from "@/models/Produto";
import { protegerRota } from "@/lib/middleware";
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
    const user: any = protegerRota(req);

    if (!user) {
      return res.status(401).json({ erro: "Não autenticado" });
    }

    if (user.acesso !== "admin") {
      return res.status(403).json({ erro: "Acesso negado" });
    }
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
  } catch (err) {
    console.error("ERRO INTERNO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
