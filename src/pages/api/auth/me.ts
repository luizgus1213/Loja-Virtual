import { protegerRota } from "@/lib/middleware";
import User from "@/models/User";
import Endereco from "@/models/Endereco";
import Arquivo from "@/models/Arquivo";
import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const userToken: any = protegerRota(req);

  if (!userToken) {
    return res.status(401).json(null);
  }

  const user = await User.findByPk(userToken.id, {
    include: [
      {
        model: Arquivo,
        as: "foto_perfil",
      },
      {
        model: Endereco,
        as: "enderecos",
      },
    ],
  });

  console.log(user?.toJSON());
  return res.status(200).json(user);
}
