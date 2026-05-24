import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import Endereco from "@/models/Endereco";
import User from "@/models/User";
import { verificarToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method === "GET") {
      return await buscarEndereco(req, res);
    }

    if (req.method === "PUT") {
      return await atualizarEndereco(req, res);
    }

    return res.status(405).json({
      erro: "Método não permitido",
    });
  } catch (err) {
    console.error("ERRO ENDEREÇO [ID]:", err);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}

function pegarEnderecoId(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    res.status(400).json({
      erro: "Endereço inválido",
    });

    return null;
  }

  const enderecoId = Number(id);

  if (
    !enderecoId ||
    Number.isNaN(enderecoId) ||
    !Number.isInteger(enderecoId)
  ) {
    res.status(400).json({
      erro: "Endereço inválido",
    });

    return null;
  }

  return enderecoId;
}

function pegarUsuario(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({
      erro: "Não autenticado",
    });

    return null;
  }

  const user: any = verificarToken(token);

  if (!user) {
    res.status(401).json({
      erro: "Token inválido",
    });

    return null;
  }

  return user;
}

async function buscarEndereco(req: NextApiRequest, res: NextApiResponse) {
  const user = pegarUsuario(req, res);

  if (!user) return;

  const enderecoId = pegarEnderecoId(req, res);

  if (!enderecoId) return;

  const endereco = await Endereco.findOne({
    where: {
      id: enderecoId,
      user_id: user.id,
    },

    include: [
      {
        model: User,
        as: "user",
        attributes: {
          exclude: ["senha", "numero_telefone", "cpf", "email"],
        },
      },
    ],
  });

  if (!endereco) {
    return res.status(404).json({
      erro: "Endereço não encontrado",
    });
  }

  return res.status(200).json(endereco);
}

async function atualizarEndereco(req: NextApiRequest, res: NextApiResponse) {
  const user = pegarUsuario(req, res);

  if (!user) return;

  const enderecoId = pegarEnderecoId(req, res);

  if (!enderecoId) return;

  const dados = req.body.data || req.body;

  const endereco: any = await Endereco.findOne({
    where: {
      id: enderecoId,
      user_id: user.id,
    },
  });

  if (!endereco) {
    return res.status(404).json({
      erro: "Endereço não encontrado",
    });
  }

  const camposPermitidos = [
    "cep",
    "rua",
    "numero",
    "bairro",
    "cidade",
    "estado",
    "complemento",
  ];

  const dadosLimpos: any = {};

  for (const campo of camposPermitidos) {
    if (dados[campo] !== undefined) {
      dadosLimpos[campo] = String(dados[campo]).trim();
    }
  }

  await endereco.update(dadosLimpos);

  return res.status(200).json({
    sucesso: true,
    endereco,
  });
}
