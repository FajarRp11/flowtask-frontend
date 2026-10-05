import { z } from "zod";

export const taskSchema = z.object({
    title: z.string().min(1, "Task title is required").max(255, "Task title is too long"),
    description: z.string().optional().nullable(),
    status: z.enum(["todo", "in_progress", "review", "done"]),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    due_date: z.string().optional().nullable(),
});

export type TaskInput = z.infer<typeof taskSchema>;