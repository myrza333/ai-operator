import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export interface IDriveOwner {
  displayName: string;
}

export interface IDriveFile {
  id: string;
  name: string;
  mimeType: string;
  iconLink?: string;
  webViewLink?: string;
  modifiedTime?: string;
  size?: string;
  starred?: boolean;
  owners?: IDriveOwner[];
}

interface IGetResponse {
  message: string;
  data: IDriveFile[];
}

export const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

interface IUseGetDriveParams {
  folderId?: string;
  starred?: boolean;
}

export const useGetDrive = ({ folderId, starred }: IUseGetDriveParams = {}) =>
  useQuery({
    queryKey: starred ? ["drive", "starred"] : ["drive", folderId || "root"],
    queryFn: async () => {
      const response = await api.get<IGetResponse>("/auth/drive", {
        params: starred ? { starred: "true" } : folderId ? { folderId } : undefined,
      });
      return response.data.data;
    },
  });
