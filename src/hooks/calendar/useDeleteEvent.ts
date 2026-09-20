import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteEvent"],
    mutationFn: async (id: number) => {
      const response = await api.delete(`/calendar/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
};
