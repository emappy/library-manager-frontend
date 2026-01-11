import { api } from "./axios";

export type StatsResponse = {
  totalBooks: number;
  totalMembers: number;
  activeBorrows: number;
  overdueBooks: number;
};

export const getStats = async (): Promise<StatsResponse> => {
  const { data } = await api.get<StatsResponse>("/stats");
  return data;
};
