import type { Request, Response } from "express";
import { CategoryService } from "../services/categories.service.ts";

const categoryService = new CategoryService();

export class CategoryController {
  async getCategoriesByUserId(req: Request, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const categories = await categoryService.getCategoriesByUserId(req.user.id);
    res.status(200).json(categories);
  }

  async createCategory(req: Request, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { name } = req.body;
    const category = await categoryService.createCategory(name, req.user.id);
    res.status(201).json(category);
  }

  async updateCategory(req: Request, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { name } = req.body;
    const category = await categoryService.updateCategory(
      Number(req.params.id),
      name,
      req.user.id,
    );
    res.status(200).json(category);
  }

  async deleteCategory(req: Request, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await categoryService.deleteCategory(Number(req.params.id), req.user.id);
    res.status(204).send();
  }
}
