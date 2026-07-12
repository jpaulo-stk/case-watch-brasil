// Tipos das respostas da API (espelham as entities do back-end).
// Dá pra gerar isso do OpenAPI com `openapi-typescript` depois.

export type TaskStatus = "pending" | "in_progress" | "review" | "done";
export type CollaboratorRole = "viewer" | "editor";

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  status: TaskStatus;
  deadline: string | null;
  category?: { id: number; name?: string };
  user?: { id: number; name?: string; email?: string };
  createdAt: string;
  updatedAt: string;
}

export interface Collaborator {
  userId: number;
  taskId: number;
  role: CollaboratorRole;
  user?: User;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateUserInput {
  name: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
}
