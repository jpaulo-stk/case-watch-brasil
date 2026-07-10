import { z } from "./registry.ts";

export const createCategorySchema = z
  .object({
    name: z.string().min(1).max(255),
  })
  .openapi("CreateCategory");

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
