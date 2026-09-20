import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type EventType = "plan" | "holiday" | "other";

export interface IOwnEvent {
  id: number;
  title: string;
  date: string;
  type: EventType;
  created_at: string;
  updated_at: string;
}

export interface IGoogleEvent {
  id: string;
  title: string;
  date: string;
  type: EventType;
  source: "google";
  link: string | null;
}

interface IGetResponse {
  message: string;
  data: {
    own: IOwnEvent[];
    google: IGoogleEvent[];
  };
}

export const useGetCalendar = () =>
  useQuery({
    queryKey: ["calendar"],
    queryFn: async () => {
      const response = await api.get<IGetResponse>("/calendar");
      return response.data.data;
    },
  });
