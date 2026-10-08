"use client";

import { ChecklistItem as ChecklistItemType } from "../types/checklist";

export function ChecklistProgress({
  items,
}: {
  items: ChecklistItemType[];
}) {
  if (items.length === 0) return null;

  const completed = items.filter((item) => item.is_completed).length;
  const total = items.length;
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">
        {completed} of {total} completed
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Checklist progress: ${percentage}%`}
        />
      </div>
    </div>
  );
}
