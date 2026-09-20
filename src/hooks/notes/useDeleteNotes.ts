import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export const useDeleteNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteNotes"],
    mutationFn: async (id: number) => {
      const response = await api.delete(`/notes/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
