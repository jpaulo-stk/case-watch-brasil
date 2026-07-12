import {
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

z.setErrorMap((issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      return issue.received === "undefined"
        ? { message: "Campo obrigatório" }
        : { message: "Tipo inválido" };
    case z.ZodIssueCode.too_small:
      return { message: `Mínimo de ${issue.minimum} caractere(s)` };
    case z.ZodIssueCode.too_big:
      return { message: `Máximo de ${issue.maximum} caractere(s)` };
    case z.ZodIssueCode.invalid_string:
      return issue.validation === "email"
        ? { message: "Email inválido" }
        : { message: "Formato inválido" };
    default:
      return { message: ctx.defaultError };
  }
});

export const registry = new OpenAPIRegistry();
export { z };
