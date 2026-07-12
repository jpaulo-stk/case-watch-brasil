import type { Request, Response } from "express";
import { UsersService } from "../services/users.service.ts";
import { NotFoundError } from "../errors/http-errors.ts";

const userService = new UsersService();

export class UsersController {
  async create(req: Request, res: Response) {
    const { passwordHash, ...rest } = await userService.create(req.body);
    res.status(201).json(rest);
  }

  async search(req: Request, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const uid = req.user.id;
    const users = await userService.search(String(req.query.q ?? ""));
    const result = users
      .filter((u) => u.id !== uid)
      .map((u) => ({ id: u.id, name: u.name, email: u.email }));
    res.status(200).json(result);
  }

  async findById(req: Request, res: Response) {
    const user = await userService.findById(Number(req.params.id));

    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    const { passwordHash, ...rest } = user;
    res.status(200).json(rest);
  }

  async update(req: Request, res: Response) {
    const { passwordHash, ...rest } = await userService.update(
      Number(req.params.id),
      req.body,
    );
    res.status(200).json(rest);
  }

  async delete(req: Request, res: Response) {
    await userService.delete(Number(req.params.id));
    res.status(204).send();
  }
}
