import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export const useEditProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["editProfile"],
    mutationFn: async (formData: FormData) => {
      const result = await api.patch("/auth/profile", formData);
      return result.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Profile"],
      });
    },
  });
};
