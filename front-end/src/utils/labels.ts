import type { TaskStatus, CollaboratorRole } from "../types/api";

export const statusLabels: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em progresso",
  review: "Revisão",
  done: "Concluído",
};

export const roleLabels: Record<CollaboratorRole, string> = {
  viewer: "Visualizador",
  editor: "Editor",
};
