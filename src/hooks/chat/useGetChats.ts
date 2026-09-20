import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export interface IChatSummary {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface IGetResponse {
  message: string;
  data: IChatSummary[];
}

export const useGetChats = (enabled = true) =>
  useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const response = await api.get<IGetResponse>("/chat/chats");
      return response.data.data;
    },
    enabled,
  });
