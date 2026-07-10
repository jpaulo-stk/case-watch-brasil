import type { Request, Response } from "express";
import { UserService } from "../services/user.service.ts";
import { NotFoundError } from "../errors/http-errors.ts";

const userService = new UserService();

export class UserController {
  async create(req: Request, res: Response) {
    const { passwordHash, ...rest } = await userService.create(req.body);
    res.status(201).json(rest);
  }

  async findById(req: Request, res: Response) {
    const user = await userService.findById(Number(req.params.id));

    if (!user) {
      throw new NotFoundError("User not found");
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
