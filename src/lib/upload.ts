import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";

export interface NextApiComArquivo extends NextApiRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

const pastaUploads =
  process.env.NODE_ENV === "production"
    ? "/var/data/uploads"
    : path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pastaUploads);
  },

  filename: function (req, file, cb) {
    const extensao = path.extname(file.originalname);
    const nomeUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;

    cb(null, nomeUnico);
  },
});

const upload = multer({
  storage,

  fileFilter: function (req, file, cb) {
    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!tiposPermitidos.includes(file.mimetype)) {
      return cb(new Error("Tipo de arquivo inválido"));
    }

    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

function executarMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function,
) {
  return new Promise<void>((resolve, reject) => {
    fn(req, res, (resultado: unknown) => {
      if (resultado instanceof Error) {
        return reject(resultado);
      }

      return resolve();
    });
  });
}

export async function uploadArquivo(
  req: NextApiComArquivo,
  res: NextApiResponse,
) {
  await executarMiddleware(req, res, upload.single("arquivo"));
}

export async function uploadVariosArquivos(
  req: NextApiComArquivo,
  res: NextApiResponse,
) {
  await executarMiddleware(req, res, upload.array("arquivos"));
}

export function obterLinkArquivo(nomeArquivo: string) {
  if (process.env.NODE_ENV === "production") {
    return `api/uploads/${nomeArquivo}`;
  }

  return `uploads/${nomeArquivo}`;
}

export default upload;
