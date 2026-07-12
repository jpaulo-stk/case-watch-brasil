import { http } from "./http";
import type { User } from "../types/api";

export interface UpdateUserInput {
  name?: string;
  email?: string;
  username?: string;
  phone?: string;
}

export const updateUser = (id: number, data: UpdateUserInput) =>
  http.put<User>(`/users/${id}`, data).then((r) => r.data);
