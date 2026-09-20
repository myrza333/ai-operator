import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { EventType } from "./useGetCalendar";

interface ICreateEventBody {
  title: string;
  date: string;
  type: EventType;
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createEvent"],
    mutationFn: async (body: ICreateEventBody) => {
      const response = await api.post("/calendar", body);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
};
