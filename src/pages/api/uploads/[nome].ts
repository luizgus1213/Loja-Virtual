import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const nome_arquivo = req.query.nome as string;
  const pasta_atual = path.dirname(__dirname);
  const raizDoProjeto = process.cwd();
  const caminho = path.join(raizDoProjeto, "uploads", nome_arquivo);

  console.log(caminho);

  if (!fs.existsSync(caminho))
    return res.status(404).json({ erro: "Arquivo não encontrado" });

  res.setHeader("Content-Type", `image/${nome_arquivo.split(".")[1]}`);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${nome_arquivo}"`,
  );

  const readStream = fs.createReadStream(caminho);

  readStream.pipe(res);
}
