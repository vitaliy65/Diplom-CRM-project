import { z } from "zod";

export function parseWithSchema<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; message: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const first = result.error.errors[0];
  const message = first
    ? `${first.path.join(".") || "form"}: ${first.message}`
    : "Невалідні дані форми";
  return { success: false, message };
}

export function formatZodErrors(error: z.ZodError): string {
  return error.errors.map((e) => e.message).join("; ");
}
