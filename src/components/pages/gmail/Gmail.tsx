"use client";

import { useEffect, useState } from "react";
import { Archive, Forward, Mail, Reply, Trash2 } from "lucide-react";
import { GmailFilter, useGetGmail } from "@/hooks/gmail/useGetGmail";
import { useGetGmailMessage } from "@/hooks/gmail/useGetGmailMessage";
import {
  useArchiveGmail,
  useDeleteGmail,
  useForwardGmail,
  useReplyGmail,
} from "@/hooks/gmail/useGmailActions";
import Header from "../header/Header";
import AuthGuard from "@/components/layout/auth/AuthGuard";
import scss from "./Gmail.module.scss";

interface HeaderData {
  name: string;
  value: string;
}

interface GmailPayload {
  mimeType: string;
  headers: HeaderData[];
}

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: GmailPayload;
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
}

const filters: { value: GmailFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "starred", label: "Starred" },
  { value: "important", label: "Important" },
];

const getHeader = (message: GmailMessage, name: string) =>
  message.payload?.headers?.find(
    (header) => header.name.toLowerCase() === name.toLowerCase(),
  )?.value;

const getSender = (message: GmailMessage) => {
  const from = getHeader(message, "From");

  if (!from) return "Unknown sender";

  // John Smith <john@gmail.com> → John Smith
  const match = from.match(/^(.+?)\s*<.*>$/);

  return match ? match[1].replace(/^["']|["']$/g, "") : from;
};

const getSubject = (message: GmailMessage) =>
  getHeader(message, "Subject") || "(No subject)";

const getDate = (message: GmailMessage) => {
  const date = new Date(Number(message.internalDate));

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
};

interface MessageDetailProps {
  id: string;
  onClosed: () => void;
}

const MessageDetail = ({ id, onClosed }: MessageDetailProps) => {
  const { data: message, isLoading, isError } = useGetGmailMessage(id);
  const { mutate: reply, isPending: isReplying } = useReplyGmail();
  const { mutate: forward, isPending: isForwarding } = useForwardGmail();
  const { mutate: archive, isPending: isArchiving } = useArchiveGmail();
  const { mutate: remove, isPending: isDeleting } = useDeleteGmail();

  const [mode, setMode] = useState<"none" | "reply" | "forward">("none");
  const [replyBody, setReplyBody] = useState("");
  const [forwardTo, setForwardTo] = useState("");
  const [forwardNote, setForwardNote] = useState("");

  useEffect(() => {
    setMode("none");
    setReplyBody("");
    setForwardTo("");
    setForwardNote("");
  }, [id]);

  const isBusy = isArchiving || isDeleting;

  const handleReplySend = () => {
    if (!replyBody.trim()) return;
    reply(
      { id, body: replyBody.trim() },
      { onSuccess: () => setMode("none") },
    );
  };

  const handleForwardSend = () => {
    if (!forwardTo.trim()) return;
    forward(
      { id, to: forwardTo.trim(), body: forwardNote.trim() || undefined },
      { onSuccess: () => setMode("none") },
    );
  };

  const handleArchive = () => {
    archive(id, { onSuccess: onClosed });
  };

  const handleDelete = () => {
    remove(id, { onSuccess: onClosed });
  };

  return (
    <div className={scss.detail}>
      {isLoading && <div className={scss.detailNotice}>Loading message...</div>}
      {isError && (
        <div className={scss.detailNotice}>Failed to load this message.</div>
      )}

      {message && (
        <>
          <div className={scss.detailHeader}>
            <div className={scss.detailMeta}>
              <h2>{message.subject || "(No subject)"}</h2>
              <p>
                <strong>{message.from}</strong>
                <span> to {message.to}</span>
              </p>
              <span className={scss.detailDate}>{message.date}</span>
            </div>

            <div className={scss.detailActions}>
              <button
                className={scss.actionButton}
                onClick={() => setMode(mode === "reply" ? "none" : "reply")}
                disabled={isBusy}
              >
                <Reply size={15} />
                Reply
              </button>
              <button
                className={scss.actionButton}
                onClick={() =>
                  setMode(mode === "forward" ? "none" : "forward")
                }
                disabled={isBusy}
              >
                <Forward size={15} />
                Forward
              </button>
              <button
                className={scss.actionButton}
                onClick={handleArchive}
                disabled={isBusy}
              >
                <Archive size={15} />
                Archive
              </button>
              <button
                className={`${scss.actionButton} ${scss.actionButtonDanger}`}
                onClick={handleDelete}
                disabled={isBusy}
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </div>

          <div className={scss.detailBody}>{message.body}</div>

          {mode === "reply" && (
            <div className={scss.composer}>
              <span className={scss.composerLabel}>Reply to {message.from}</span>
              <textarea
                className={scss.composerInput}
                placeholder="Write your reply..."
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                autoFocus
              />
              <div className={scss.composerActions}>
                <button
                  className={scss.composerCancel}
                  onClick={() => setMode("none")}
                >
                  Cancel
                </button>
                <button
                  className={scss.composerSend}
                  onClick={handleReplySend}
                  disabled={isReplying || !replyBody.trim()}
                >
                  {isReplying ? "Sending..." : "Send reply"}
                </button>
              </div>
            </div>
          )}

          {mode === "forward" && (
            <div className={scss.composer}>
              <span className={scss.composerLabel}>Forward this message</span>
              <input
                className={scss.composerTo}
                placeholder="Recipient email"
                value={forwardTo}
                onChange={(event) => setForwardTo(event.target.value)}
                autoFocus
              />
              <textarea
                className={scss.composerInput}
                placeholder="Add a note (optional)..."
                value={forwardNote}
                onChange={(event) => setForwardNote(event.target.value)}
              />
              <div className={scss.composerActions}>
                <button
                  className={scss.composerCancel}
                  onClick={() => setMode("none")}
                >
                  Cancel
                </button>
                <button
                  className={scss.composerSend}
                  onClick={handleForwardSend}
                  disabled={isForwarding || !forwardTo.trim()}
                >
                  {isForwarding ? "Sending..." : "Forward"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const GmailContent = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<GmailFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const {
    data: messages,
    isLoading,
    isError,
    error,
  } = useGetGmail({ q: search, filter });

  return (
    <>
      <Header />

      <div className={scss.gmail}>
        <main className={scss.main}>
          <header className={scss.topBar}>
            <div className={scss.search}>
              <span className={scss.searchIcon}>⌕</span>

              <input
                type="text"
                placeholder="Search mail"
                className={scss.searchInput}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
          </header>

          <div className={scss.filters}>
            {filters.map((item) => (
              <button
                key={item.value}
                className={`${scss.filterTab} ${
                  filter === item.value ? scss.filterTabActive : ""
                }`}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={scss.toolbar}>
            <div className={scss.pageInfo}>
              {isLoading ? "Loading..." : `${messages?.length || 0} messages`}
            </div>
          </div>

          <div className={scss.body}>
            <section className={scss.mailList}>
              {isLoading && (
                <div className={scss.mail}>
                  <div className={scss.mailContent}>Loading Gmail...</div>
                </div>
              )}

              {isError && (
                <div className={scss.mail}>
                  <div className={scss.mailContent}>
                    <span className={scss.sender}>Failed to load Gmail</span>

                    <div className={scss.subjectRow}>
                      <span className={scss.preview}>
                        {error instanceof Error
                          ? error.message
                          : "Something went wrong"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!isLoading && !isError && messages?.length === 0 && (
                <div className={scss.mail}>
                  <div className={scss.mailContent}>
                    <span className={scss.sender}>No messages</span>

                    <div className={scss.subjectRow}>
                      <span className={scss.preview}>
                        {search || filter !== "all"
                          ? "Nothing matches your search or filter."
                          : "Your Gmail inbox is empty."}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!isLoading &&
                !isError &&
                messages?.map((message: GmailMessage) => {
                  const isUnread = message.labelIds?.includes("UNREAD");

                  return (
                    <div
                      className={`${scss.mail} ${isUnread ? scss.unread : ""} ${
                        message.id === selectedId ? scss.mailActive : ""
                      }`}
                      key={message.id}
                      onClick={() => setSelectedId(message.id)}
                    >
                      <div className={scss.mailContent}>
                        <span className={scss.sender}>
                          {getSender(message)}
                        </span>

                        <div className={scss.subjectRow}>
                          <span className={scss.subject}>
                            {getSubject(message)}
                          </span>

                          <span className={scss.separator}>—</span>

                          <span className={scss.preview}>
                            {message.snippet}
                          </span>
                        </div>
                      </div>

                      <div className={scss.mailRight}>
                        <span className={scss.date}>{getDate(message)}</span>
                      </div>
                    </div>
                  );
                })}
            </section>

            {selectedId ? (
              <MessageDetail
                key={selectedId}
                id={selectedId}
                onClosed={() => setSelectedId(null)}
              />
            ) : (
              <div className={scss.detailEmpty}>
                <Mail size={26} strokeWidth={1.3} />
                <p>Select a message to read it</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

const Gmail = () => (
  <AuthGuard service="Gmail">
    <GmailContent />
  </AuthGuard>
);

export default Gmail;
