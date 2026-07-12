import type { ZodSchema } from "zod";

export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown,
): { ok: true; data: T } | { ok: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
