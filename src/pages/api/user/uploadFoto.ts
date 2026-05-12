import type { NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import crypto from "crypto";

import User from "@/models/User";
import Arquivo from "@/models/Arquivo";
import { protegerRota } from "@/lib/middleware";

const storage = multer.diskStorage({
  destination: "./public/uploads",

  filename: (req, file, cb) => {
    const nome =
      crypto.randomBytes(20).toString("hex") + path.extname(file.originalname);

    cb(null, nome);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const tiposPermitidos = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(file.mimetype)) {
      return cb(new Error("Tipo inválido"));
    }

    cb(null, true);
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(req: any, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido",
    });
  }

  try {
    const userToken: any = protegerRota(req);

    if (!userToken) {
      return res.status(401).json({
        erro: "Não autorizado",
      });
    }

    await runMiddleware(req, res, upload.single("foto"));

    if (!req.file) {
      return res.status(400).json({
        erro: "Nenhuma imagem enviada",
      });
    }

    const user: any = await User.findByPk(userToken.id);

    if (!user) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    const arquivo: any = await Arquivo.create({
      nome: req.file.originalname,
      provider: "local",
      link: "uploads/" + req.file.filename,
    });

    await user.update({
      foto_perfil_id: arquivo.id,
    });

    return res.status(200).json({
      sucesso: true,
      arquivo,
    });
  } catch (err: any) {
    console.log(err);

    return res.status(500).json({
      erro: err.message || "Erro interno",
    });
  }
}
