import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/http-errors.ts";
import jwt from "jsonwebtoken";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid Authorization header");
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = { id: (payload as { userId: number }).userId };
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }

  next();
}
