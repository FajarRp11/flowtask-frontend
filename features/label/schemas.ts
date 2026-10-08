import { z } from "zod";

export const labelSchema = z.object({
  name: z.string().min(1, "Label name is required").max(50, "Label name is too long"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a 6-digit hexadecimal value"),
});

export type LabelInput = z.infer<typeof labelSchema>;