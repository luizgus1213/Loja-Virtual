import type { NextApiResponse } from "next";
import { expirarPedidosPendentes } from "@/lib/pedidos";
import Product from "@/models/Produto";
import Arquivo from "@/models/Arquivo";
import ProdutoImagem from "@/models/ProdutoImagem";
import { protegerRota } from "@/lib/middleware";
import upload from "@/lib/upload";

export const config = {
  api: {
    bodyParser: false,
  },
};

const middleWare = (req: any, res: any, fn: any) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });

export default async function criar(req: any, res: NextApiResponse) {
  try {
    await expirarPedidosPendentes();
    const user: any = protegerRota(req);

    if (!user) {
      return res.status(401).json({ erro: "Não autenticado" });
    }

    if (user.acesso !== "admin") {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    await middleWare(req, res, upload.array("arquivos"));

    const { nome, marca, categoria, descricao, preco, avaliacao, estoque } =
      req.body;

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

    if (req.files && Array.isArray(req.files)) {
      for (let i = 0; i < req.files.length; i++) {
        const file: any = req.files[i];

        const arquivo: any = await Arquivo.create({
          nome: file.originalname,
          link: "uploads/" + file.filename,
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
    }

    return res.status(200).json(produto);
  } catch (err) {
    console.error("ERRO INTERNO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
