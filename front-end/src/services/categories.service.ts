import { http } from "./http";
import type { Category } from "../types/api";

export const getCategories = () =>
  http.get<Category[]>("/categories").then((r) => r.data);

export const createCategory = (name: string) =>
  http.post<Category>("/categories", { name }).then((r) => r.data);

export const updateCategory = (id: number, name: string) =>
  http.put<Category>(`/categories/${id}`, { name }).then((r) => r.data);

export const deleteCategory = (id: number) =>
  http.delete(`/categories/${id}`).then(() => undefined);
