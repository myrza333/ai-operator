import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export const useReplyGmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["replyGmail"],
    mutationFn: async ({ id, body }: { id: string; body: string }) => {
      const response = await api.post(`/auth/gmail/${id}/reply`, { body });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gmails"] });
    },
  });
};

export const useForwardGmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["forwardGmail"],
    mutationFn: async ({
      id,
      to,
      body,
    }: {
      id: string;
      to: string;
      body?: string;
    }) => {
      const response = await api.post(`/auth/gmail/${id}/forward`, {
        to,
        body,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gmails"] });
    },
  });
};

export const useArchiveGmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["archiveGmail"],
    mutationFn: async (id: string) => {
      const response = await api.post(`/auth/gmail/${id}/archive`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gmails"] });
    },
  });
};

export const useDeleteGmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteGmail"],
    mutationFn: async (id: string) => {
      const response = await api.delete(`/auth/gmail/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gmails"] });
    },
  });
};
