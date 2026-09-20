import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { INoteItem } from "./useGetNotes";

export const useCreateNoteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createNoteItem"],
    mutationFn: async ({
      noteId,
      content,
    }: {
      noteId: number;
      content: string;
    }) => {
      const response = await api.post<{ data: INoteItem }>(
        `/notes/${noteId}/items`,
        { content },
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
