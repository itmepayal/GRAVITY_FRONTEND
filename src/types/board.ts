export interface Board {
  _id: string;
  name: string;
  description?: string;
  type: "kanban" | "scrum";
  projectId: string;
  workspaceId: string;
  columns: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardData {
  name: string;
  description?: string;
  type: "kanban" | "scrum";
  columns?: string[];
}

export interface UpdateBoardData {
  name?: string;
  description?: string;
  type?: "kanban" | "scrum";
  columns?: string[];
}
