import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export interface IGmailMessageDetail {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
}

interface IGetResponse {
  message: string;
  data: IGmailMessageDetail;
}

export const useGetGmailMessage = (id: string | null) =>
  useQuery({
    queryKey: ["gmail-message", id],
    queryFn: async () => {
      const response = await api.get<IGetResponse>(`/auth/gmail/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
