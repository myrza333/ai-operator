import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "../api";

interface ILoginBody {
  email: string;
  password: string;
}

interface ILoginRes {
  message: string;
  user: IUser;
}

interface IUser {
  user: {
    email: string;
    name: string;
    avatar: any;
    id: number;
  };
  accessToken: string;
}

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["login"],

    mutationFn: async (body: ILoginBody) => {
      const response = await api.post<ILoginRes>("/auth/login", body);

      console.log(response);

      return response.data.user;
    },

    onSuccess: (res) => {
      localStorage.setItem("token", res.accessToken);

      queryClient.invalidateQueries({
        queryKey: ["Profile"],
      });
    },
  });
};
