import type { Request, Response } from "express";
import { TasksService } from "../services/tasks.service.ts";

const tasksService = new TasksService();

export class TasksController {
  async create(req: Request, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const task = await tasksService.create(req.body, req.user.id);
    res.status(201).json(task);
  }

  async getTasksByUserId(req: Request, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const tasks = await tasksService.getTasksByUserId(req.user.id);
    res.status(200).json(tasks);
  }

  async getTaskById(req: Request, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const task = await tasksService.getTaskById(
      Number(req.params.id),
      req.user.id,
    );
    res.status(200).json(task);
  }

  async updateTask(req: Request, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const task = await tasksService.updateTask(
      Number(req.params.id),
      req.body,
      req.user.id,
    );
    res.status(200).json(task);
  }

  async updateStatus(req: Request, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { status } = req.body;
    const task = await tasksService.updateStatus(
      Number(req.params.id),
      status,
      req.user.id,
    );
    res.status(200).json(task);
  }

  async deleteTask(req: Request, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await tasksService.deleteTask(Number(req.params.id), req.user.id);
    res.status(204).send();
  }
}
