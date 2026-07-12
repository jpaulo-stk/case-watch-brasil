import { http } from "./http";
import type { LoginResponse, CreateUserInput, User } from "../types/api";

export const login = (email: string, password: string) =>
  http
    .post<LoginResponse>("/auth/login", { email, password })
    .then((r) => r.data);

export const register = (data: CreateUserInput) =>
  http.post<User>("/users", data).then((r) => r.data);
