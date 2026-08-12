export interface Board {
  _id: string;
  name: string;
  description?: string;
  type: "kanban" | "scrum";
  projectId: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardData {
  name: string;
  description?: string;
  type: "kanban" | "scrum";
}

export interface UpdateBoardData {
  name?: string;
  description?: string;
  type?: "kanban" | "scrum";
}
