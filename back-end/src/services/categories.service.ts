import { Category } from "../entities/category.entity.ts";
import type { User } from "../entities/user.entity.ts";
import { CategoryRepository } from "../repositories/categories.repository.ts";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../errors/http-errors.ts";

export class CategoryService {
  async getCategoriesByUserId(userId: number): Promise<Category[]> {
    return await CategoryRepository.findByUserId(userId);
  }

  async createCategory(name: string, userId: number): Promise<Category> {
    const existingCategory = await CategoryRepository.findOneBy({
      name,
      user: { id: userId },
    });
    if (existingCategory) {
      throw new ConflictError("Category with this name already exists");
    }

    const category = new Category();
    category.name = name;
    category.user = { id: userId } as User;

    return await CategoryRepository.save(category);
  }

  async updateCategory(
    id: number,
    name: string,
    userId: number,
  ): Promise<Category> {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    if (category.user.id !== userId) {
      throw new ForbiddenError("Not your category");
    }

    const duplicate = await CategoryRepository.findOneBy({
      name,
      user: { id: userId },
    });
    if (duplicate && duplicate.id !== id) {
      throw new ConflictError("Category with this name already exists");
    }

    category.name = name;
    return await CategoryRepository.save(category);
  }

  async deleteCategory(id: number, userId: number): Promise<void> {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    if (category.user.id !== userId) {
      throw new ForbiddenError("Not your category");
    }

    await CategoryRepository.softDelete(id);
  }
}
