import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import { log } from "console";

interface IRegisterBody {
  email: string;
  password: string;
  name: string;
}

export const useRegister = () =>
  useMutation({
    mutationKey: ["register"],
    mutationFn: async (body: IRegisterBody) => {
      const response = await api.post("/auth/register", body);
      console.log(response);
      return response.data;
    },
  });
