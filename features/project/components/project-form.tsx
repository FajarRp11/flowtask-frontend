"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api/client";
import { projectPriorityOptions, projectStatusOptions } from "../config";
import {
  useCreateProject,
  useUpdateProject,
} from "../hooks/use-project-queries";
import { projectSchema, ProjectInput } from "../schemas";
import { Project } from "../types";

interface ProjectFormProps {
  workspaceId: string;
  project?: Project;
  onSuccess: (project: Project) => void;
  onCancel?: () => void;
}

export function ProjectForm({
  workspaceId,
  project,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const mutation = project ? updateMutation : createMutation;
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      status: project?.status || "planning",
      priority: project?.priority || "medium",
      start_date: project?.start_date || "",
      due_date: project?.due_date || "",
    },
  });

  useEffect(() => {
    reset({
      name: project?.name || "",
      description: project?.description || "",
      status: project?.status || "planning",
      priority: project?.priority || "medium",
      start_date: project?.start_date || "",
      due_date: project?.due_date || "",
    });
  }, [project, reset]);

  const onSubmit = async (data: ProjectInput) => {
    try {
      setServerError(null);
      const payload = {
        ...data,
        description: data.description || null,
        start_date: data.start_date || null,
        due_date: data.due_date || null,
      };
      const savedProject = project
        ? await updateMutation.mutateAsync({ id: project.id, payload })
        : await createMutation.mutateAsync({
            workspace_id: workspaceId,
            ...payload,
          });
      reset(data);
      onSuccess(savedProject);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 422 && error.data?.errors) {
          Object.entries(error.data.errors).forEach(([field, messages]) => {
            if (field in data) {
              setError(field as keyof ProjectInput, {
                type: "server",
                message: (messages as string[])[0],
              });
            }
          });
        } else {
          setServerError(error.message || "Unable to save project.");
        }
      } else {
        setServerError("An unexpected error occurred.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {serverError}
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="project-name" className="text-sm font-medium">
          Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="project-name"
          placeholder="Website Redesign"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="project-description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="project-description"
          rows={3}
          className="flex min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="What is this project about?"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Priority</label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectPriorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="project-start-date" className="text-sm font-medium">
            Start date
          </label>
          <Input
            id="project-start-date"
            type="date"
            {...register("start_date")}
          />
          {errors.start_date && (
            <p className="text-xs text-red-500">{errors.start_date.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="project-due-date" className="text-sm font-medium">
            Due date
          </label>
          <Input id="project-due-date" type="date" {...register("due_date")} />
          {errors.due_date && (
            <p className="text-xs text-red-500">{errors.due_date.message}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Saving..."
            : project
              ? "Save changes"
              : "Create project"}
        </Button>
      </div>
    </form>
  );
}
