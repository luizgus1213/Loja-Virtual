// /api/auth/logout.ts
import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    "Set-Cookie",
    serialize("token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    }),
  );

  res.status(200).json({ ok: true });
}
