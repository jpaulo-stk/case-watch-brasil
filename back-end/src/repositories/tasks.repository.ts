import { AppDataSource } from "../config/data-source.ts";
import { Task } from "../entities/task.entity.ts";

export const TasksRepository = AppDataSource.getRepository(Task).extend({
  findById(id: number): Promise<Task | null> {
    return this.findOne({ where: { id }, relations: { user: true } });
  },

  findByUserId(userId: number): Promise<Task[]> {
    return this.find({ where: { user: { id: userId } } });
  },
});
