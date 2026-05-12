import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Produto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  try {
    await Product.destroy({
      where: { id },
    });

    return res.status(200).json({ sucesso: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao excluir" });
  }
}
