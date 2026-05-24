import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Produto";
import { protegerRota } from "@/lib/middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const user: any = protegerRota(req);

  if (!user) {
    return res.status(401).json({ erro: "Não autenticado" });
  }

  if (user.acesso !== "admin") {
    return res.status(403).json({ erro: "Acesso negado" });
  }

  const { id } = req.query;

  if (!id || Array.isArray(id) || Number.isNaN(Number(id))) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  try {
    const produto = await Product.findByPk(Number(id));

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    await produto.destroy();

    return res.status(200).json({ sucesso: true });
  } catch (err) {
    console.error("ERRO INTERNO:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
