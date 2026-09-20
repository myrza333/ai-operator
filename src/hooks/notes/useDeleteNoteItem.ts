import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export const useDeleteNoteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteNoteItem"],
    mutationFn: async ({
      noteId,
      itemId,
    }: {
      noteId: number;
      itemId: number;
    }) => {
      const response = await api.delete(`/notes/${noteId}/items/${itemId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
