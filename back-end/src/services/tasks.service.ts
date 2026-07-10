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
import { UserHasTasksRepository } from "../repositories/user-has-tasks.repository.ts";
import { UsersRepository } from "../repositories/users.repository.ts";
import {
  COLLABORATOR_ROLES,
  UserHasTasks,
  type CollaboratorRole,
} from "../entities/user-has-tasks.entity.ts";

export class TasksService {
  private async assertCanView(task: Task, userId: number): Promise<void> {
    if (task.user.id === userId) return; // dono vê sempre
    const collab = await UserHasTasksRepository.findOne({
      where: { task: { id: task.id }, user: { id: userId } },
    });
    if (!collab) {
      throw new ForbiddenError("You don't have access to this task");
    }
  }

  private async assertCanEdit(task: Task, userId: number): Promise<void> {
    if (task.user.id === userId) return; // dono edita sempre
    const collab = await UserHasTasksRepository.findOne({
      where: { task: { id: task.id }, user: { id: userId } },
    });
    if (!collab || collab.role !== "editor") {
      throw new ForbiddenError("You don't have edit access to this task");
    }
  }

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
    const owned = await TasksRepository.findByUserId(userId);
    const collaborations = await UserHasTasksRepository.find({
      where: { user: { id: userId } },
      relations: { task: true },
    });

    const byId = new Map<number, Task>();
    for (const task of owned) byId.set(task.id, task);
    for (const collab of collaborations) {
      if (collab.task) byId.set(collab.task.id, collab.task);
    }
    return Array.from(byId.values());
  }

  async getTaskById(id: number, userId: number): Promise<Task> {
    const task = await TasksRepository.findById(id);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    await this.assertCanView(task, userId);
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
    await this.assertCanEdit(task, userId);

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
    await this.assertCanEdit(task, userId);

    task.status = status as TaskStatus;
    return await TasksRepository.save(task);
  }

  // Deletar é só do dono (ação destrutiva).
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

  async addCollaborator(
    taskId: number,
    collaboratorId: number,
    role: string,
    ownerId: number,
  ): Promise<void> {
    if (!(COLLABORATOR_ROLES as readonly string[]).includes(role)) {
      throw new BadRequestError(
        `Invalid role. Must be one of: ${COLLABORATOR_ROLES.join(", ")}`,
      );
    }

    const task = await TasksRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    if (task.user.id !== ownerId) {
      throw new ForbiddenError("Not your task");
    }

    if (collaboratorId === ownerId) {
      throw new BadRequestError(
        "The owner already has full access to the task",
      );
    }

    const collaboratorUser = await UsersRepository.findById(collaboratorId);
    if (!collaboratorUser) {
      throw new NotFoundError("Collaborator user not found");
    }

    const existingCollaboration = await UserHasTasksRepository.findOne({
      where: { task: { id: taskId }, user: { id: collaboratorId } },
    });
    if (existingCollaboration) {
      throw new ConflictError("User is already a collaborator on this task");
    }

    const collaboration = UserHasTasksRepository.create({
      task: { id: taskId },
      user: { id: collaboratorId },
      role: role as CollaboratorRole,
    });

    await UserHasTasksRepository.save(collaboration);
  }

  async getCollaborators(
    taskId: number,
    userId: number,
  ): Promise<UserHasTasks[]> {
    const task = await TasksRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    if (task.user.id !== userId) {
      throw new ForbiddenError("Not your task");
    }

    return await UserHasTasksRepository.find({
      where: { task: { id: taskId } },
      relations: { user: true, task: true },
    });
  }

  async removeCollaborator(
    taskId: number,
    collaboratorId: number,
    ownerId: number,
  ): Promise<void> {
    const task = await TasksRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    if (task.user.id !== ownerId) {
      throw new ForbiddenError("Not your task");
    }

    const collaboration = await UserHasTasksRepository.findOne({
      where: { task: { id: taskId }, user: { id: collaboratorId } },
    });
    if (!collaboration) {
      throw new NotFoundError("User is not a collaborator on this task");
    }

    await UserHasTasksRepository.remove(collaboration);
  }
}
