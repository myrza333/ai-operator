import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { INoteItem } from "./useGetNotes";

interface IUpdateNoteItemArgs {
  noteId: number;
  itemId: number;
  content?: string;
  done?: boolean;
}

export const useUpdateNoteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateNoteItem"],
    mutationFn: async ({ noteId, itemId, ...body }: IUpdateNoteItemArgs) => {
      const response = await api.patch<{ data: INoteItem }>(
        `/notes/${noteId}/items/${itemId}`,
        body,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
