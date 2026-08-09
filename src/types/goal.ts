export type GoalStatus =
  | "planning"
  | "active"
  | "completed"
  | "on_hold"
  | "cancelled"
  | "archived";

export interface Goal {
  _id: string;
  name: string;
  description?: string;
  status: GoalStatus;
  startDate?: string;
  endDate?: string;

  workspace: string;

  owner: string;

  tasks?: string[];

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGoalData {
  name: string;
  description?: string;
  status?: GoalStatus;
  startDate?: string;
  endDate?: string;
}

export interface UpdateGoalData {
  name?: string;
  description?: string;
  status?: GoalStatus;
  startDate?: string;
  endDate?: string;
}

export interface GoalResponse {
  goal: Goal;
  message?: string;
}

export interface GoalsResponse {
  goals: Goal[];
  message?: string;
}

export interface MessageResponse {
  message: string;
}
