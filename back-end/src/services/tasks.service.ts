import type { CreateTaskDTO } from "../dto/task.dto.ts";
import type { Category } from "../entities/category.entity.ts";
import { TasksRepository } from "../repositories/tasks.repository.ts";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../errors/http-errors.ts";
import {
  Task,
  TASK_STATUSES,
  type TaskStatus,
} from "../entities/task.entity.ts";

export class TasksService {
  async create(data: CreateTaskDTO, userId: number): Promise<Task> {
    const existingTask = await TasksRepository.findOne({
      where: { name: data.name, user: { id: userId } },
    });

    if (existingTask) {
      throw new ConflictError(
        "Task with this name already exists for this user",
      );
    }

    const task = TasksRepository.create({
      name: data.name,
      description: data.description,
      deadline: data.deadline,
      category: { id: data.categoryId },
      user: { id: userId },
    });

    return TasksRepository.save(task);
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return await TasksRepository.findByUserId(userId);
  }

  async getTaskById(id: number, userId: number): Promise<Task> {
    const task = await TasksRepository.findById(id);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    if (task.user.id !== userId) {
      throw new ForbiddenError("Not your task");
    }
    return task;
  }

  async updateTask(
    id: number,
    data: Partial<CreateTaskDTO>,
    userId: number,
  ): Promise<Task> {
    const task = await TasksRepository.findById(id);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    if (task.user.id !== userId) {
      throw new ForbiddenError("Not your task");
    }

    task.name = data.name ?? task.name;
    task.description = data.description ?? task.description;
    task.deadline = data.deadline ?? task.deadline;
    if (data.categoryId) {
      task.category = { id: data.categoryId } as Category;
    }

    return await TasksRepository.save(task);
  }

  async updateStatus(
    id: number,
    status: string,
    userId: number,
  ): Promise<Task> {
    if (!(TASK_STATUSES as readonly string[]).includes(status)) {
      throw new BadRequestError(
        `Invalid status. Must be one of: ${TASK_STATUSES.join(", ")}`,
      );
    }

    const task = await TasksRepository.findById(id);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    if (task.user.id !== userId) {
      throw new ForbiddenError("Not your task");
    }

    task.status = status as TaskStatus;
    return await TasksRepository.save(task);
  }

  async deleteTask(id: number, userId: number): Promise<void> {
    const task = await TasksRepository.findById(id);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    if (task.user.id !== userId) {
      throw new ForbiddenError("Not your task");
    }

    await TasksRepository.softDelete(id);
  }
}
