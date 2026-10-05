import { TaskPriority, TaskStatus } from "./types";

export const taskStatusOptions: { value: TaskStatus; label: string }[] = [
    { value: "todo", label: "Todo" },
    { value: "in_progress", label: "In Progress" },
    { value: "review", label: "Review" },
    { value: "done", label: "Done" },
];

export const taskPriorityOptions: { value: TaskPriority; label: string }[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
];

export const taskStatusLabels = Object.fromEntries(
    taskStatusOptions.map((option) => [option.value, option.label]),
) as Record<TaskStatus, string>;

export const taskPriorityLabels = Object.fromEntries(
    taskPriorityOptions.map((option) => [option.value, option.label]),
) as Record<TaskPriority, string>;