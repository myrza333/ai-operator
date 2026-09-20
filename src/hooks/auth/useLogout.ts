"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { useRouter } from "next/navigation";
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationKey: ["Logout"],
    mutationFn: async () => {
      const response = await api.post("/auth/logout");
      return response.data;
    },
    onSuccess: () => {
      localStorage.removeItem("token");

      queryClient.setQueryData(["Profile"], null);

      router.push("/");
    },
  });
};
