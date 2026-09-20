import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { EventType } from "./useGetCalendar";

interface IUpdateEventBody {
  id: number;
  title?: string;
  date?: string;
  type?: EventType;
}

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateEvent"],
    mutationFn: async ({ id, ...body }: IUpdateEventBody) => {
      const response = await api.put(`/calendar/${id}`, body);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
};
