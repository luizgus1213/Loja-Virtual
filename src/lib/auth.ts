import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "segredo";

export function gerarToken(user: any) {
  const dados =
    typeof user.get === "function" ? user.get({ plain: true }) : user;

  return jwt.sign(
    {
      id: dados.id,
      nome: dados.nome,
      email: dados.email,
      acesso: dados.acesso,
      token_version: dados.token_version || 1,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
}

export function verificarToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
