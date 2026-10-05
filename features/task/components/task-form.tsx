"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api/client";
import { taskPriorityOptions, taskStatusOptions } from "../config";
import { useCreateTask, useUpdateTask } from "../hooks/use-task-queries";
import { taskSchema, TaskInput } from "../schemas";
import { Task } from "../types";

interface TaskFormProps {
    projectId: string;
    task?: Task;
    onSuccess: (task: Task) => void;
    onCancel?: () => void;
}

export function TaskForm({ projectId, task, onSuccess, onCancel }: TaskFormProps) {
    const createMutation = useCreateTask(projectId);
    const updateMutation = useUpdateTask();
    const mutation = task ? updateMutation : createMutation;
    const [serverError, setServerError] = useState<string | null>(null);
    const { register, control, handleSubmit, reset, setError, formState: { errors } } = useForm<TaskInput>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: task?.title || "",
            description: task?.description || "",
            status: task?.status || "todo",
            priority: task?.priority || "medium",
            due_date: task?.due_date || "",
        },
    });

    useEffect(() => {
        reset({
            title: task?.title || "",
            description: task?.description || "",
            status: task?.status || "todo",
            priority: task?.priority || "medium",
            due_date: task?.due_date || "",
        });
    }, [task, reset]);

    const onSubmit = async (data: TaskInput) => {
        try {
            setServerError(null);
            const payload = { ...data, description: data.description || null, due_date: data.due_date || null };
            const savedTask = task
                ? await updateMutation.mutateAsync({ taskId: task.id, payload })
                : await createMutation.mutateAsync(payload);
            reset(data);
            onSuccess(savedTask);
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 422 && error.data?.errors) {
                    Object.entries(error.data.errors).forEach(([field, messages]) => {
                        if (field in data) setError(field as keyof TaskInput, { type: "server", message: (messages as string[])[0] });
                    });
                } else setServerError(error.message || "Unable to save task.");
            } else setServerError("An unexpected error occurred.");
        }
    };

    return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{serverError}</div>}
        <div className="space-y-1.5"><label htmlFor="task-title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label><Input id="task-title" placeholder="Implement login" {...register("title")} />{errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}</div>
        <div className="space-y-1.5"><label htmlFor="task-description" className="text-sm font-medium">Description</label><textarea id="task-description" rows={3} className="flex min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" placeholder="Describe this task" {...register("description")} />{errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}</div>
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><label className="text-sm font-medium">Status</label><Controller name="status" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{taskStatusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>} /></div><div className="space-y-1.5"><label className="text-sm font-medium">Priority</label><Controller name="priority" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{taskPriorityOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>} /></div></div>
        <div className="space-y-1.5"><label htmlFor="task-due-date" className="text-sm font-medium">Due date</label><Input id="task-due-date" type="date" {...register("due_date")} />{errors.due_date && <p className="text-xs text-red-500">{errors.due_date.message}</p>}</div>
        <div className="flex justify-end gap-2 pt-2">{onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>Cancel</Button>}<Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : task ? "Save changes" : "Create task"}</Button></div>
    </form>;
}