import { AppDataSource } from "../config/data-source.ts";
import { UserHasTasks } from "../entities/user-has-tasks.entity.ts";

export const UserHasTasksRepository = AppDataSource.getRepository(
  UserHasTasks,
).extend({
  findByUserId(userId: number): Promise<UserHasTasks[]> {
    return this.find({ where: { user: { id: userId } } });
  },

  findByTaskId(taskId: number): Promise<UserHasTasks[]> {
    return this.find({ where: { task: { id: taskId } } });
  },
});
