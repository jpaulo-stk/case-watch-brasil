import { z } from "./registry.ts";

export const createUserSchema = z
  .object({
    name: z.string().min(1).max(255),
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().min(3).max(30),
    phone: z.string().min(10).max(15).optional(),
  })
  .openapi("CreateUser");

export const updateUserSchema = createUserSchema.partial().openapi("UpdateUser");

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
