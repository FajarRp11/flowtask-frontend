import { ProjectPriority, ProjectRole, ProjectStatus } from "./types";

export const projectStatusOptions: { value: ProjectStatus; label: string }[] = [
    { value: "planning", label: "Planning" },
    { value: "active", label: "Active" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" },
];

export const projectPriorityOptions: { value: ProjectPriority; label: string }[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
];

export const projectRoleOptions: { value: ProjectRole; label: string }[] = [
    { value: "manager", label: "Manager" },
    { value: "member", label: "Member" },
];

export const projectStatusLabels = Object.fromEntries(
    projectStatusOptions.map((option) => [option.value, option.label]),
) as Record<ProjectStatus, string>;

export const projectPriorityLabels = Object.fromEntries(
    projectPriorityOptions.map((option) => [option.value, option.label]),
) as Record<ProjectPriority, string>;

export const projectRoleLabels = Object.fromEntries(
    projectRoleOptions.map((option) => [option.value, option.label]),
) as Record<ProjectRole, string>;