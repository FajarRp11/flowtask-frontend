export interface ChecklistItem {
  id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
}

export interface CreateChecklistItemPayload {
  title: string;
}

export interface UpdateChecklistItemPayload {
  title: string;
  is_completed?: boolean;
}

export interface ReorderChecklistPayload {
  items: { id: string; sort_order: number }[];
}
