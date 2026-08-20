import { api } from "@/lib/api";
import type { Board, UpdateBoardData } from "@/types/board";
import type { MessageResponse } from "@/types/task";

export const getAllUserBoards = async () => {
  const response = await api.get("/boards");
  return response.data;
};

export const getBoardById = async (boardId: string): Promise<any> => {
  const response = await api.get(`/boards/${boardId}`);
  return response.data;
};

export const updateBoard = async (
  boardId: string,
  data: UpdateBoardData,
): Promise<Board> => {
  const response = await api.patch<Board>(`/boards/${boardId}`, data);
  return response.data;
};

export const deleteBoard = async (
  boardId: string,
): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>(`/boards/${boardId}`);
  return response.data;
};
