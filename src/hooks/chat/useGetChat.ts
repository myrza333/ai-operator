import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export interface IChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface IChatDetail {
  id: number;
  title: string;
  messages: IChatMessage[];
}

interface IGetResponse {
  message: string;
  data: IChatDetail;
}

export const useGetChat = (id: number | null) =>
  useQuery({
    queryKey: ["chat", id],
    queryFn: async () => {
      const response = await api.get<IGetResponse>(`/chat/chats/${id}`);
      return response.data.data;
    },
    enabled: id !== null,
  });
