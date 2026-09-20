import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { INote } from "./useGetNotes";

interface ICreateNoteBody {
  title: string;
  content?: string;
}

export const useCreateNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createNote"],
    mutationFn: async (body: ICreateNoteBody) => {
      const response = await api.post<{ data: INote }>("/notes", body);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
