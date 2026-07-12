import { http } from "./http";
import type {
  Task,
  TaskStatus,
  Collaborator,
  CollaboratorRole,
} from "../types/api";

export interface CreateTaskInput {
  name: string;
  description: string;
  categoryId: number;
  deadline?: string | null;
}

export const getTasks = () => http.get<Task[]>("/tasks").then((r) => r.data);

export const getTask = (id: number) =>
  http.get<Task>(`/tasks/${id}`).then((r) => r.data);

export const createTask = (data: CreateTaskInput) =>
  http.post<Task>("/tasks", data).then((r) => r.data);

export const updateTask = (id: number, data: Partial<CreateTaskInput>) =>
  http.patch<Task>(`/tasks/${id}`, data).then((r) => r.data);

export const updateStatus = (id: number, status: TaskStatus) =>
  http.patch<Task>(`/tasks/${id}/status`, { status }).then((r) => r.data);

export const deleteTask = (id: number) =>
  http.delete(`/tasks/${id}`).then(() => undefined);

export const getCollaborators = (taskId: number) =>
  http
    .get<Collaborator[]>(`/tasks/${taskId}/collaborators`)
    .then((r) => r.data);

export const addCollaborator = (
  taskId: number,
  email: string,
  role: CollaboratorRole,
) =>
  http
    .post(`/tasks/${taskId}/collaborators`, { email, role })
    .then(() => undefined);

export const removeCollaborator = (taskId: number, userId: number) =>
  http
    .delete(`/tasks/${taskId}/collaborators/${userId}`)
    .then(() => undefined);
