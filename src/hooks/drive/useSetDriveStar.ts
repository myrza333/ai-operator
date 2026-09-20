import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export const useSetDriveStar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["setDriveStar"],
    mutationFn: async ({
      id,
      starred,
    }: {
      id: string;
      starred: boolean;
    }) => {
      const response = await api.patch(`/auth/drive/${id}/star`, { starred });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drive"] });
    },
  });
};
