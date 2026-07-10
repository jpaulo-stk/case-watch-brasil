import { AppDataSource } from "../config/data-source.ts";
import { Category } from "../entities/category.entity.ts";

export const CategoryRepository = AppDataSource.getRepository(Category).extend({
  findById(id: number): Promise<Category | null> {
    return this.findOne({ where: { id }, relations: { user: true } });
  },

  findByUserId(userId: number): Promise<Category[]> {
    return this.find({ where: { user: { id: userId } } });
  },
});
