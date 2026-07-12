import { COLLABORATOR_ROLES } from "../entities/user-has-tasks.entity.ts";
import { z } from "./registry.ts";

export const collaboratorSchema = z
  .object({
    email: z.string().email(),
    role: z.enum(COLLABORATOR_ROLES),
  })
  .openapi("Collaborator");

export type CollaboratorDTO = z.infer<typeof collaboratorSchema>;
