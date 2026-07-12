import type { Category } from "../entities/category.entity.ts";
import { TasksRepository } from "../repositories/tasks.repository.ts";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../errors/http-errors.ts";
import { Task, type TaskStatus } from "../entities/task.entity.ts";
import { UserHasTasksRepository } from "../repositories/user-has-tasks.repository.ts";
import { UsersRepository } from "../repositories/users.repository.ts";
import {
  UserHasTasks,
  type CollaboratorRole,
} from "../entities/user-has-tasks.entity.ts";
import type { CreateTaskDTO, UpdateTaskDTO } from "../schemas/task.schema.ts";

export class TasksService {
  private async assertCanView(task: Task, userId: number): Promise<void> {
    if (task.user.id === userId) return;
    const collab = await UserHasTasksRepository.findOne({
      where: { task: { id: task.id }, user: { id: userId } },
    });
    if (!collab) {
      throw new ForbiddenError("Você não tem acesso a esta tarefa");
    }
  }

  private async assertCanEdit(task: Task, userId: number): Promise<void> {
    if (task.user.id === userId) return;
    const collab = await UserHasTasksRepository.findOne({
      where: { task: { id: task.id }, user: { id: userId } },
    });
    if (!collab || collab.role !== "editor") {
      throw new ForbiddenError("Você não tem permissão de edição nesta tarefa");
    }
  }

  async create(data: CreateTaskDTO, userId: number): Promise<Task> {
    const existingTask = await TasksRepository.findOne({
      where: { name: data.name, user: { id: userId } },
    });

    if (existingTask) {
      throw new ConflictError("Você já tem uma tarefa com esse nome");
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
      relations: { task: { user: true, category: true } },
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
      throw new NotFoundError("Tarefa não encontrada");
    }
    await this.assertCanView(task, userId);
    return task;
  }

  async updateTask(
    id: number,
    data: Partial<UpdateTaskDTO>,
    userId: number,
  ): Promise<Task> {
    const task = await TasksRepository.findById(id);
    if (!task) {
      throw new NotFoundError("Tarefa não encontrada");
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
    const task = await TasksRepository.findById(id);
    if (!task) {
      throw new NotFoundError("Tarefa não encontrada");
    }
    await this.assertCanEdit(task, userId);

    task.status = status as TaskStatus;
    return await TasksRepository.save(task);
  }

  async deleteTask(id: number, userId: number): Promise<void> {
    const task = await TasksRepository.findById(id);
    if (!task) {
      throw new NotFoundError("Tarefa não encontrada");
    }
    if (task.user.id !== userId) {
      throw new ForbiddenError("Esta tarefa não é sua");
    }

    await TasksRepository.softDelete(id);
  }

  async addCollaborator(
    taskId: number,
    email: string,
    role: string,
    ownerId: number,
  ): Promise<void> {
    const task = await TasksRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Tarefa não encontrada");
    }
    if (task.user.id !== ownerId) {
      throw new ForbiddenError("Esta tarefa não é sua");
    }

    const collaboratorUser = await UsersRepository.findByEmail(email);
    if (!collaboratorUser) {
      throw new NotFoundError("Usuário não encontrado");
    }

    if (collaboratorUser.id === ownerId) {
      throw new BadRequestError("O dono já tem acesso total à tarefa");
    }

    const existingCollaboration = await UserHasTasksRepository.findOne({
      where: { task: { id: taskId }, user: { id: collaboratorUser.id } },
    });
    if (existingCollaboration) {
      throw new ConflictError("Este usuário já é colaborador da tarefa");
    }

    const collaboration = UserHasTasksRepository.create({
      task: { id: taskId },
      user: { id: collaboratorUser.id },
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
      throw new NotFoundError("Tarefa não encontrada");
    }
    await this.assertCanView(task, userId);

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
      throw new NotFoundError("Tarefa não encontrada");
    }
    if (task.user.id !== ownerId) {
      throw new ForbiddenError("Esta tarefa não é sua");
    }

    const collaboration = await UserHasTasksRepository.findOne({
      where: { task: { id: taskId }, user: { id: collaboratorId } },
    });
    if (!collaboration) {
      throw new NotFoundError("Este usuário não é colaborador da tarefa");
    }

    await UserHasTasksRepository.remove(collaboration);
  }
}
