import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export interface INoteItem {
  id: number;
  content: string;
  done: boolean;
  position: number;
}

export interface INote {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  items: INoteItem[];
}

interface IGetResponse {
  message: string;
  data: INote[];
}

export const useGetNotes = () =>
  useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const response = await api.get<IGetResponse>("/notes");
      return response.data.data;
    },
  });
