import type { NextApiRequest, NextApiResponse } from "next";

import { Op } from "sequelize";

import "@/models";

import Produto from "@/models/Produto";
import Arquivo from "@/models/Arquivo";

function montarOrdenacao(ordenacao: string) {
  if (ordenacao === "menor_preco") return [["preco", "ASC"]];
  if (ordenacao === "maior_preco") return [["preco", "DESC"]];
  if (ordenacao === "melhor_avaliacao") return [["avaliacao", "DESC"]];
  if (ordenacao === "mais_recentes") return [["id", "DESC"]];
  if (ordenacao === "maior_estoque") return [["estoque", "DESC"]];

  return [["id", "DESC"]];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      erro: "Método não permitido",
    });
  }

  try {
    const pesquisa = String(req.query.pesquisa || "").trim();
    const categoria = String(req.query.categoria || "todos");
    const valorMinimo = Number(req.query.valorMinimo || 0);
    const valorMaximo = Number(req.query.valorMaximo || 999999999);
    const ordenacao = String(req.query.ordenacao || "relevancia");
    const apenasDisponiveis = String(req.query.apenasDisponiveis) === "true";

    if (Number.isNaN(valorMinimo) || Number.isNaN(valorMaximo)) {
      return res.status(400).json({
        erro: "Valores de preço inválidos",
      });
    }

    if (valorMinimo < 0 || valorMaximo < 0) {
      return res.status(400).json({
        erro: "O preço não pode ser negativo",
      });
    }

    if (valorMinimo > valorMaximo) {
      return res.status(400).json({
        erro: "O preço mínimo não pode ser maior que o preço máximo",
      });
    }

    const where: any = {
      preco: {
        [Op.between]: [valorMinimo, valorMaximo],
      },
    };

    if (pesquisa) {
      where[Op.or] = [
        {
          nome: {
            [Op.like]: `%${pesquisa}%`,
          },
        },
        {
          marca: {
            [Op.like]: `%${pesquisa}%`,
          },
        },
        {
          categoria: {
            [Op.like]: `%${pesquisa}%`,
          },
        },
        {
          descricao: {
            [Op.like]: `%${pesquisa}%`,
          },
        },
      ];
    }

    if (categoria && categoria !== "todos") {
      where.categoria = {
        [Op.like]: `%${categoria}%`,
      };
    }

    if (apenasDisponiveis) {
      where.estoque = {
        [Op.gt]: 0,
      };
    }

    const produtos = await Produto.findAll({
      where,

      include: [
        {
          model: Arquivo,
          as: "capa",
          required: false,
        },
      ],

      order: montarOrdenacao(ordenacao) as any,

      limit: 60,
    });

    return res.status(200).json(produtos);
  } catch (err) {
    console.error("ERRO PESQUISAR PRODUTOS:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}
