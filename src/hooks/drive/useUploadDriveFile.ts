import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export const useUploadDriveFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["uploadDriveFile"],
    mutationFn: async ({
      file,
      folderId,
    }: {
      file: File;
      folderId?: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (folderId) formData.append("folderId", folderId);

      const response = await api.post("/auth/drive/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drive"] });
    },
  });
};
