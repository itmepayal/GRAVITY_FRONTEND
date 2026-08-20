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
  title: string;
  description?: string;
  status?: GoalStatus | string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  targetDate?: string;
  keyResults?: any[];
}

export interface UpdateGoalData {
  title?: string;
  description?: string;
  status?: GoalStatus | string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  targetDate?: string;
  keyResults?: any[];
}

export interface GoalResponse {
  goal?: Goal;
  data?: any;
  message?: string;
  success?: boolean;
}

export interface GoalsResponse {
  goals?: Goal[];
  data?: any;
  message?: string;
  success?: boolean;
}

export interface MessageResponse {
  message: string;
}
