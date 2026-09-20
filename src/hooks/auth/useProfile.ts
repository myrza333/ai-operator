import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

interface IGetResponse {
  message: string;
  data: IProfile;
}

interface IProfile {
  name: string;
  email: string;
  avatar: any;
  id: number;
  google_id: number;
  created_at: string;
  description: string;
}

export const useProfile = () =>
  useQuery({
    queryKey: ["Profile"],
    queryFn: async () => {
      const response = await api.get<IGetResponse>("/auth/profile");
      return response.data.data;
    },
    retry: false,
  });
