import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry, z } from "../schemas/registry.ts";
import { loginSchema } from "../schemas/auth.schema.ts";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema.ts";
import { createCategorySchema } from "../schemas/category.schema.ts";
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
} from "../schemas/task.schema.ts";
import { collaboratorSchema } from "../schemas/collaborator.schema.ts";

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const bearer = [{ bearerAuth: [] }];
const idParams = z.object({ id: z.string() });
const collabParams = z.object({ id: z.string(), collaboratorId: z.string() });
const json = (schema: z.ZodTypeAny) => ({
  content: { "application/json": { schema } },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  request: { body: json(loginSchema) },
  responses: {
    200: { description: "Token JWT + usuário" },
    400: { description: "Body inválido" },
    401: { description: "Credenciais inválidas" },
  },
});

registry.registerPath({
  method: "post",
  path: "/users",
  tags: ["Users"],
  request: { body: json(createUserSchema) },
  responses: {
    201: { description: "Usuário criado" },
    400: { description: "Body inválido" },
    409: { description: "Email ou username em uso" },
  },
});
registry.registerPath({
  method: "get",
  path: "/users/search",
  tags: ["Users"],
  security: bearer,
  request: { query: z.object({ q: z.string() }) },
  responses: {
    200: { description: "Usuários que casam com o email (autocomplete)" },
  },
});
registry.registerPath({
  method: "get",
  path: "/users/{id}",
  tags: ["Users"],
  security: bearer,
  request: { params: idParams },
  responses: {
    200: { description: "Usuário" },
    404: { description: "Não encontrado" },
  },
});
registry.registerPath({
  method: "put",
  path: "/users/{id}",
  tags: ["Users"],
  security: bearer,
  request: { params: idParams, body: json(updateUserSchema) },
  responses: {
    200: { description: "Atualizado" },
    404: { description: "Não encontrado" },
  },
});
registry.registerPath({
  method: "delete",
  path: "/users/{id}",
  tags: ["Users"],
  security: bearer,
  request: { params: idParams },
  responses: { 204: { description: "Removido (soft delete)" } },
});

registry.registerPath({
  method: "get",
  path: "/categories",
  tags: ["Categories"],
  security: bearer,
  responses: { 200: { description: "Categorias do usuário autenticado" } },
});
registry.registerPath({
  method: "post",
  path: "/categories",
  tags: ["Categories"],
  security: bearer,
  request: { body: json(createCategorySchema) },
  responses: {
    201: { description: "Criada" },
    409: { description: "Nome duplicado para o usuário" },
  },
});
registry.registerPath({
  method: "put",
  path: "/categories/{id}",
  tags: ["Categories"],
  security: bearer,
  request: { params: idParams, body: json(createCategorySchema) },
  responses: {
    200: { description: "Atualizada" },
    403: { description: "Não é dono" },
    404: { description: "Não encontrada" },
  },
});
registry.registerPath({
  method: "delete",
  path: "/categories/{id}",
  tags: ["Categories"],
  security: bearer,
  request: { params: idParams },
  responses: { 204: { description: "Removida (soft delete)" } },
});

registry.registerPath({
  method: "get",
  path: "/tasks",
  tags: ["Tasks"],
  security: bearer,
  responses: { 200: { description: "Tasks próprias + compartilhadas" } },
});
registry.registerPath({
  method: "post",
  path: "/tasks",
  tags: ["Tasks"],
  security: bearer,
  request: { body: json(createTaskSchema) },
  responses: {
    201: { description: "Task criada (status inicial: pending)" },
    400: { description: "Body inválido" },
  },
});
registry.registerPath({
  method: "get",
  path: "/tasks/{id}",
  tags: ["Tasks"],
  security: bearer,
  request: { params: idParams },
  responses: {
    200: { description: "Task" },
    403: { description: "Sem acesso" },
    404: { description: "Não encontrada" },
  },
});
registry.registerPath({
  method: "patch",
  path: "/tasks/{id}",
  tags: ["Tasks"],
  security: bearer,
  request: { params: idParams, body: json(updateTaskSchema) },
  responses: {
    200: { description: "Atualizada" },
    403: { description: "Sem permissão de edição" },
  },
});
registry.registerPath({
  method: "patch",
  path: "/tasks/{id}/status",
  tags: ["Tasks"],
  security: bearer,
  request: { params: idParams, body: json(updateStatusSchema) },
  responses: {
    200: { description: "Status atualizado (Kanban)" },
    400: { description: "Status inválido" },
    403: { description: "Sem permissão de edição" },
  },
});
registry.registerPath({
  method: "delete",
  path: "/tasks/{id}",
  tags: ["Tasks"],
  security: bearer,
  request: { params: idParams },
  responses: { 204: { description: "Removida (só o dono)" } },
});

registry.registerPath({
  method: "post",
  path: "/tasks/{id}/collaborators",
  tags: ["Collaborators"],
  security: bearer,
  request: { params: idParams, body: json(collaboratorSchema) },
  responses: {
    201: { description: "Colaborador adicionado" },
    400: { description: "Role inválido / não pode ser o dono" },
    409: { description: "Já é colaborador" },
  },
});
registry.registerPath({
  method: "get",
  path: "/tasks/{id}/collaborators",
  tags: ["Collaborators"],
  security: bearer,
  request: { params: idParams },
  responses: { 200: { description: "Lista de colaboradores" } },
});
registry.registerPath({
  method: "delete",
  path: "/tasks/{id}/collaborators/{collaboratorId}",
  tags: ["Collaborators"],
  security: bearer,
  request: { params: collabParams },
  responses: {
    204: { description: "Colaborador removido" },
    404: { description: "Não é colaborador" },
  },
});

export function buildOpenApiDoc(serverUrl = "http://localhost:3000") {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Case Watch API",
      version: "1.0.0",
      description: "API de gerenciamento de tarefas com colaboração.",
    },
    servers: [{ url: serverUrl }],
  });
}
