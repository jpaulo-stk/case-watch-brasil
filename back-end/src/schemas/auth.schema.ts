import { z } from "./registry.ts";

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .openapi("Login");

export type LoginDTO = z.infer<typeof loginSchema>;
