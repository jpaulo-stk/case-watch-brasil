import { z } from "./registry.ts";
import { TASK_STATUSES } from "../entities/task.entity.ts";

export const createTaskSchema = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().min(1),
    deadline: z.coerce.date().nullable().optional(),
    categoryId: z.number().int().positive(),
  })
  .openapi("CreateTask");

export const updateTaskSchema = createTaskSchema
  .partial()
  .openapi("UpdateTask");

export const updateStatusSchema = z
  .object({ status: z.enum(TASK_STATUSES) })
  .openapi("UpdateStatus");

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;
export type UpdateStatusDTO = z.infer<typeof updateStatusSchema>;
