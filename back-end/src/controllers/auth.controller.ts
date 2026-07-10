import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.ts";

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  }
}
