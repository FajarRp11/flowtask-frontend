import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Nama workspace wajib diisi")
    .max(255, "Nama terlalu panjang"),
  description: z.string().optional().nullable(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Nama workspace wajib diisi")
    .max(255, "Nama terlalu panjang"),
  description: z.string().optional().nullable(),
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

export const inviteMemberSchema = z.object({
  user_id: z
    .string()
    .min(1, "User ID / UUID wajib diisi")
    .uuid("Format User ID harus UUID yang valid"),
  role: z.enum(["admin", "member", "viewer"], {
    error: "Peran harus admin, member, atau viewer",
  }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
