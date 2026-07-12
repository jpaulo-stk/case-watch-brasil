import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Informe o email").email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: z.string().min(1, "Informe o email").email("Email inválido"),
  username: z.string().min(3, "Mínimo 3 caracteres"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  phone: z.string().optional(),
});

export const taskFormSchema = z.object({
  name: z.string().min(1, "Informe o nome da tarefa"),
  description: z.string().optional(),
  deadline: z.string().optional(),
  categoryId: z
    .number({ invalid_type_error: "Selecione uma categoria" })
    .int()
    .positive("Selecione uma categoria"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Informe o nome"),
});

export const profileSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: z.string().min(1, "Informe o email").email("Email inválido"),
  username: z.string().min(3, "Mínimo 3 caracteres"),
  phone: z.string().optional(),
});
