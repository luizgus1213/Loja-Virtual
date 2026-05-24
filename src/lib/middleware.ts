import { parse } from "cookie";
import { verificarToken } from "./auth";
import type { NextApiRequest } from "next";

export function protegerRota(req: any) {
  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) return null;

    const user = verificarToken(token);

    return user;
  } catch (err) {
    return null;
  }
}

export function exigirAdmin(req: NextApiRequest) {
  const user: any = protegerRota(req);

  if (!user) {
    return {
      user: null,
      status: 401,
      erro: "Não autenticado",
    };
  }

  if (user.acesso !== "admin") {
    return {
      user: null,
      status: 403,
      erro: "Acesso negado",
    };
  }

  return {
    user,
    status: 200,
    erro: null,
  };
}
