import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { IChatSummary } from "./useGetChats";

export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createChat"],
    mutationFn: async () => {
      const response = await api.post<{ data: IChatSummary }>("/chat/chats");
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteChat"],
    mutationFn: async (id: number) => {
      const response = await api.delete(`/chat/chats/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["sendChatMessage"],
    mutationFn: async ({
      chatId,
      message,
    }: {
      chatId: number;
      message: string;
    }) => {
      const response = await api.post<{
        data: { reply: string; title: string };
      }>(
        `/chat/chats/${chatId}/messages`,
        { message },
        // AI-ответ может занять время; таймаут страхует от бесконечного
        // "Thinking..." на фронте, если бэкенд/Gemini реально зависли
        { timeout: 45000 },
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat", variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};
