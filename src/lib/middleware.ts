import { parse } from "cookie";
import { verificarToken } from "./auth";

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
