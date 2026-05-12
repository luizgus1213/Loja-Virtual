import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Produto";
import Arquivo from "@/models/Arquivo";
import User from "@/models/User";
import sequelize from "@/database";
import bcrypt from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const usuario = await User.findByPk(1); // Find by Primary Key / Encontrar pela chave primaria

    const senha_descriptografada = await bcrypt.compare(
      "123456",
      usuario?.toJSON().senha,
    );
    return res.status(200).json({ usuario, senha_descriptografada });
  } catch (err) {
    console.log(err);
    return res.status(200).json({ mensagem: err });
  }
}
