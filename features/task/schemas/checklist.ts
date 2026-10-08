import { z } from "zod";

export const checklistItemSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title is too long")
    .transform((value) => value.trim()),
});

export type ChecklistItemInput = z.infer<typeof checklistItemSchema>;
