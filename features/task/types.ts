import { Label } from "@/features/label/types";

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface TaskProject {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  project?: TaskProject;
  assignees?: TaskAssignee[];
  labels?: Label[];
}

export interface TaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
}
