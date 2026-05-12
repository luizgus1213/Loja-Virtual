import type { NextApiResponse } from "next";
import Product from "@/models/Produto";
import Arquivo from "@/models/Arquivo";
import upload from "@/lib/upload";

export const config = {
  api: {
    bodyParser: false,
  },
};

const middleWare = (req: any, res: any, fn: any) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });

export default async function criar(req: any, res: NextApiResponse) {
  try {
    await middleWare(req, res, upload.single("arquivo"));

    const { nome, marca, categoria, descricao, preco, avaliacao, estoque } =
      req.body;

    let imagem_id = null;

    if (req.file) {
      const arquivo = await Arquivo.create({
        nome: req.file.originalname,
        link: "uploads/" + req.file.filename,
        provider: "local",
      });

      imagem_id = arquivo.get("id");
    }
    const produto = await Product.create({
      nome,
      marca,
      categoria,
      descricao,
      preco: Number(preco),
      estoque: Number(estoque),
      avaliacao: Number(avaliacao),
      imagem_id,
    });
    console.log("FILE:", req.file);
    return res.status(200).json(produto);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ erro: "Erro ao criar produto" });
  }
}
