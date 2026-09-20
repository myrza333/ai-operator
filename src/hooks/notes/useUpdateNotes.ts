import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { INote } from "./useGetNotes";

interface IUpdateNoteBody {
  id: number;
  title?: string;
  content?: string;
}

export const useUpdateNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateNotes"],
    mutationFn: async ({ id, ...body }: IUpdateNoteBody) => {
      const response = await api.put<{ data: INote }>(`/notes/${id}`, body);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
