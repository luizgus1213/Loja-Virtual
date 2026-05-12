import type { NextApiRequest, NextApiResponse } from "next";
import Endereco from "@/models/Endereco";
import User from "@/models/User";
import sequelize from "@/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const metodo = req.method;

  switch (metodo) {
    case "PUT":
      await atualizaEndereco(req, res);
      break;
    case "GET":
      await buscarEndereco(req, res);
      break;
    default:
      res
        .status(404)
        .json({ message: "Vai fuçar codigo de outro vaza daqui!!" });
  }
}

const atualizaEndereco = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string;
  const propiedades = req.body.data;

  const endereco = await Endereco.findByPk(Number(id), {
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
  if (endereco) {
    endereco.update(propiedades);
    return res.status(200).json(endereco.toJSON());
  } else return res.status(404).json({ message: "Endereco não encontrado" });
};

const buscarEndereco = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string;

  const endereco = await Endereco.findByPk(Number(id), {
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
  if (endereco) return res.status(200).json(endereco.toJSON());
  else return res.status(404).json({ message: "Endereco não encontrado" });
};
