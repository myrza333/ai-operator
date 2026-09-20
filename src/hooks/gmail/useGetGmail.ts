import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type GmailFilter = "all" | "unread" | "starred" | "important";

interface IGetResponse {
  message: string;
  data: IData[];
}

interface IData {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: Payload;
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
}

export interface Payload {
  mimeType: string;
  headers: Header[];
}

export interface Header {
  name: string;
  value: string;
}

interface IGetGmailParams {
  q?: string;
  filter?: GmailFilter;
}

export const useGetGmail = ({ q, filter }: IGetGmailParams = {}) =>
  useQuery({
    queryKey: ["gmails", filter || "all", q || ""],
    queryFn: async () => {
      const response = await api.get<IGetResponse>("/auth/gmail", {
        params: {
          ...(q ? { q } : {}),
          ...(filter && filter !== "all" ? { filter } : {}),
        },
      });
      return response.data.data;
    },
  });
