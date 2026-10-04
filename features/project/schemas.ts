import { z } from "zod";

export const projectSchema = z
    .object({
        name: z.string().min(1, "Project name is required").max(255, "Project name is too long"),
        description: z.string().optional().nullable(),
        status: z.enum(["planning", "active", "on_hold", "completed", "archived"]),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        start_date: z.string().optional().nullable(),
        due_date: z.string().optional().nullable(),
    })
    .refine(
        (data) => !data.start_date || !data.due_date || data.due_date >= data.start_date,
        { message: "Due date must be on or after the start date", path: ["due_date"] },
    );

export type ProjectInput = z.infer<typeof projectSchema>;

export const addProjectMemberSchema = z.object({
    user_id: z.string().min(1, "Select a workspace member"),
    role: z.enum(["manager", "member"]),
});

export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;