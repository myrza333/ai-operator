"use client";

import { useRef, useState } from "react";
import { Star, Upload } from "lucide-react";
import Header from "../header/Header";
import AuthGuard from "@/components/layout/auth/AuthGuard";
import { API_URL } from "@/lib/config";
import scss from "./Drive.module.scss";
import {
  FOLDER_MIME_TYPE,
  IDriveFile,
  useGetDrive,
} from "@/hooks/drive/useGetDrive";
import { useSetDriveStar } from "@/hooks/drive/useSetDriveStar";
import { useUploadDriveFile } from "@/hooks/drive/useUploadDriveFile";

interface IBreadcrumbItem {
  id?: string;
  name: string;
}

const isAxiosLikeError = (
  error: unknown,
): error is { response?: { data?: { message?: string } } } =>
  typeof error === "object" && error !== null && "response" in error;

const getBadge = (mimeType: string) => {
  if (mimeType === "application/pdf")
    return { label: "PDF", type: "PDF document", className: scss.pdf };

  if (
    mimeType === "application/vnd.google-apps.document" ||
    mimeType.includes("wordprocessingml") ||
    mimeType === "application/msword"
  )
    return { label: "DOC", type: "Document", className: scss.doc };

  if (
    mimeType === "application/vnd.google-apps.spreadsheet" ||
    mimeType.includes("spreadsheetml") ||
    mimeType === "application/vnd.ms-excel"
  )
    return { label: "XLS", type: "Spreadsheet", className: scss.xls };

  if (
    mimeType === "application/vnd.google-apps.presentation" ||
    mimeType.includes("presentationml") ||
    mimeType === "application/vnd.ms-powerpoint"
  )
    return { label: "PPT", type: "Presentation", className: scss.ppt };

  if (mimeType.startsWith("image/"))
    return { label: "IMG", type: "Image", className: scss.img };
  if (mimeType.startsWith("video/"))
    return { label: "VID", type: "Video", className: scss.vid };
  if (mimeType.startsWith("audio/"))
    return { label: "AUD", type: "Audio", className: scss.aud };

  return { label: "FILE", type: "File", className: "" };
};

const formatSize = (size?: string) => {
  const bytes = Number(size);

  if (!size || !bytes) return "—";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
};

const DriveContent = () => {
  const [stack, setStack] = useState<IBreadcrumbItem[]>([
    { id: undefined, name: "My Drive" },
  ]);
  const [view, setView] = useState<"browse" | "starred">("browse");

  const currentFolder = stack[stack.length - 1];

  const { data, isLoading, isError, error } = useGetDrive(
    view === "starred" ? { starred: true } : { folderId: currentFolder.id },
  );

  const { mutate: setStar } = useSetDriveStar();
  const { mutate: uploadFile, isPending: isUploading } = useUploadDriveFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const items = data || [];
  const folders = items.filter((item) => item.mimeType === FOLDER_MIME_TYPE);
  const files = items.filter((item) => item.mimeType !== FOLDER_MIME_TYPE);

  const openFolder = (folder: IDriveFile) => {
    setView("browse");
    setStack((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const goToBreadcrumb = (index: number) => {
    setStack((prev) => prev.slice(0, index + 1));
  };

  const openFile = (file: IDriveFile) => {
    if (file.webViewLink) {
      window.open(file.webViewLink, "_blank", "noopener,noreferrer");
    }
  };

  const toggleStar = (item: IDriveFile, event: React.MouseEvent) => {
    event.stopPropagation();
    setStar({ id: item.id, starred: !item.starred });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    uploadFile({ file, folderId: currentFolder.id });
  };

  const errorMessage =
    (isAxiosLikeError(error) && error.response?.data?.message) ||
    "Failed to load Drive";

  return (
    <>
      <Header />
      <div className={scss.container}>
        <main className={scss.main}>
          <div className={scss.pageTop}>
            <div className={scss.pageInfo}>
              {view === "browse" ? (
                <div className={scss.breadcrumb}>
                  {stack.map((item, index) => (
                    <span key={item.id || "root"}>
                      {index > 0 && <span>/</span>}
                      <button
                        className={scss.breadcrumbItem}
                        onClick={() => goToBreadcrumb(index)}
                        disabled={index === stack.length - 1}
                      >
                        {item.name}
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className={scss.breadcrumb}>Starred</div>
              )}

              <h1>{view === "starred" ? "Starred" : currentFolder.name}</h1>
            </div>

            <div className={scss.tabs}>
              <button
                className={`${scss.tab} ${
                  view === "browse" ? scss.tabActive : ""
                }`}
                onClick={() => setView("browse")}
              >
                My Drive
              </button>
              <button
                className={`${scss.tab} ${
                  view === "starred" ? scss.tabActive : ""
                }`}
                onClick={() => setView("starred")}
              >
                <Star size={13} />
                Starred
              </button>

              {view === "browse" && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className={scss.hiddenFileInput}
                    onChange={handleFileSelected}
                  />
                  <button
                    className={scss.uploadButton}
                    onClick={handleUploadClick}
                    disabled={isUploading}
                  >
                    <Upload size={14} />
                    {isUploading ? "Uploading..." : "Upload"}
                  </button>
                </>
              )}
            </div>
          </div>

          {isError && errorMessage === "Google account is not connected" && (
            <div className={scss.notice}>
              <p>Your Google account isn&apos;t connected yet.</p>
              <a href={`${API_URL}/auth/google`}>
                Connect Google account
              </a>
            </div>
          )}

          {isError && errorMessage !== "Google account is not connected" && (
            <div className={scss.notice}>
              <p>{errorMessage}</p>
            </div>
          )}

          {isLoading && <div className={scss.notice}>Loading Drive...</div>}

          {!isLoading && !isError && items.length === 0 && (
            <div className={scss.emptyState}>
              <Star size={26} strokeWidth={1.3} />
              <p>
                {view === "starred"
                  ? "You haven't starred anything yet."
                  : "This folder is empty."}
              </p>
            </div>
          )}

          {!isLoading && !isError && items.length > 0 && (
            <>
              {folders.length > 0 && (
                <section className={scss.section}>
                  <div className={scss.sectionHeader}>
                    <h2>Folders</h2>
                    <span>{folders.length}</span>
                  </div>

                  <div className={scss.folderList}>
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        className={scss.folder}
                        onClick={() => openFolder(folder)}
                      >
                        <div className={scss.folderIcon}>▰</div>

                        <div className={scss.folderInfo}>
                          <h3>{folder.name}</h3>
                          <p>{formatDate(folder.modifiedTime)}</p>
                        </div>

                        <button
                          className={`${scss.starButton} ${
                            folder.starred ? scss.starButtonActive : ""
                          }`}
                          onClick={(event) => toggleStar(folder, event)}
                          aria-label={
                            folder.starred
                              ? "Remove from starred"
                              : "Add to starred"
                          }
                        >
                          <Star size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {files.length > 0 && (
                <section className={scss.section}>
                  <div className={scss.sectionHeader}>
                    <h2>Files</h2>
                    <span>{files.length}</span>
                  </div>

                  <div className={scss.files}>
                    <div className={scss.fileHeader}>
                      <div className={scss.nameColumn}>Name</div>
                      <div className={scss.ownerColumn}>Owner</div>
                      <div className={scss.dateColumn}>Last modified</div>
                      <div className={scss.sizeColumn}>Size</div>
                      <div className={scss.starColumn} />
                    </div>

                    {files.map((file) => {
                      const badge = getBadge(file.mimeType);
                      const owner = file.owners?.[0]?.displayName;

                      return (
                        <div
                          key={file.id}
                          className={scss.file}
                          onClick={() => openFile(file)}
                        >
                          <div className={scss.nameColumn}>
                            <div
                              className={`${scss.fileIcon} ${badge.className}`}
                            >
                              {badge.label}
                            </div>

                            <div className={scss.fileInfo}>
                              <strong>{file.name}</strong>
                              <span>{badge.type}</span>
                            </div>
                          </div>

                          <div className={scss.ownerColumn}>
                            {owner && (
                              <>
                                <div className={scss.smallAvatar}>
                                  {owner.charAt(0).toUpperCase()}
                                </div>
                                <span>{owner}</span>
                              </>
                            )}
                          </div>

                          <div className={scss.dateColumn}>
                            {formatDate(file.modifiedTime)}
                          </div>

                          <div className={scss.sizeColumn}>
                            {formatSize(file.size)}
                          </div>

                          <div className={scss.starColumn}>
                            <button
                              className={`${scss.starButton} ${
                                file.starred ? scss.starButtonActive : ""
                              }`}
                              onClick={(event) => toggleStar(file, event)}
                              aria-label={
                                file.starred
                                  ? "Remove from starred"
                                  : "Add to starred"
                              }
                            >
                              <Star size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};

const Drive = () => (
  <AuthGuard service="Drive">
    <DriveContent />
  </AuthGuard>
);

export default Drive;
