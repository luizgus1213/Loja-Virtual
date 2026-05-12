import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

interface JwtPayloadType extends jwt.JwtPayload {
  id: number;
  email: string;
  nome: string;
  acesso: string;
}

export function gerarToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      nome: user.nome,
      acesso: user.acesso,
    },
    SECRET,
    { expiresIn: "7d" },
  );
}

export function verificarToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as JwtPayloadType;
  } catch {
    return null;
  }
}
