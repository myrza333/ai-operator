"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Header from "../header/Header";
import scss from "./AiChat.module.scss";
import ReactMarkdown from "react-markdown";

import {
  LuSparkles,
  LuInbox,
  LuCalendarDays,
  LuFolder,
  LuNotebookPen,
  LuPlus,
  LuX,
  LuHistory,
} from "react-icons/lu";
import { useGetChats } from "@/hooks/chat/useGetChats";
import { useGetChat } from "@/hooks/chat/useGetChat";
import {
  useCreateChat,
  useDeleteChat,
  useSendChatMessage,
} from "@/hooks/chat/useChatActions";
import { useProfile } from "@/hooks/auth/useProfile";
import { useAuthModal } from "@/components/layout/auth/AuthModalContext";

const MAX_CHATS = 5;

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "The AI is taking too long to respond — it might be rate-limited right now. Please try again in a bit.";
    }

    const backendMessage = error.response?.data?.message;

    if (typeof backendMessage === "string" && backendMessage) {
      if (error.response?.status === 429 || /quota|rate.?limit/i.test(backendMessage)) {
        return "The AI service is rate-limited right now. Please try again in a minute.";
      }

      return backendMessage;
    }
  }

  return "Sorry, something went wrong. Please try again.";
};

const AiChat = () => {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  // на телефоне список чатов не помещается рядом с перепиской — открывается
  // отдельной панелью поверх, а не сжимает чат вбок
  const [isChatsOpen, setIsChatsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { openLogin } = useAuthModal();
  const isAuthed = !!profile;

  // неавторизованному чаты не грузим, а закешированные (после logout) не показываем
  const { data: cachedChats } = useGetChats(isAuthed);
  const { data: cachedChat } = useGetChat(isAuthed ? selectedChatId : null);
  const chats = isAuthed ? cachedChats : undefined;
  const chat = isAuthed ? cachedChat : undefined;
  const { mutate: createChat, isPending: isCreating } = useCreateChat();
  const { mutate: deleteChat } = useDeleteChat();
  const { mutate: sendMessage, isPending: isSending } = useSendChatMessage();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstScroll = useRef(true);

  const messages = chat?.messages ?? [];
  const showEmptyState =
    !pendingMessage && !isSending && !errorMessage && messages.length === 0;
  const atChatLimit = (chats?.length ?? 0) >= MAX_CHATS;

  // выбираем самый недавний чат, если ничего не выбрано или выбранный пропал (удалили)
  useEffect(() => {
    if (!chats) return;

    if (selectedChatId === null || !chats.some((c) => c.id === selectedChatId)) {
      setSelectedChatId(chats[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats]);

  // при первом открытии сразу прыгаем в конец переписки, дальше — плавно
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: isFirstScroll.current ? "auto" : "smooth",
    });
    isFirstScroll.current = false;
  }, [messages, pendingMessage, isSending]);

  const sendMessageTo = (chatId: number, text: string) => {
    setPendingMessage(text);
    setErrorMessage(null);
    setInput("");

    sendMessage(
      { chatId, message: text },
      {
        onSuccess: () => setPendingMessage(null),
        onError: (error) => {
          setPendingMessage(null);
          setErrorMessage(getErrorMessage(error));
        },
      },
    );
  };

  // писать AI Operator-у может только авторизованный: остальных отправляем на Login
  const requireAuth = () => {
    if (isAuthed) return true;

    if (!isProfileLoading) openLogin();

    return false;
  };

  const sendMessageText = (text?: string) => {
    if (!requireAuth()) return;

    const value = (text ?? input).trim();

    if (!value || isSending || isCreating) return;

    if (selectedChatId) {
      sendMessageTo(selectedChatId, value);
      return;
    }

    createChat(undefined, {
      onSuccess: (newChat) => {
        setSelectedChatId(newChat.id);
        sendMessageTo(newChat.id, value);
      },
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessageText();
  };

  const handleNewChat = () => {
    if (!requireAuth()) return;

    if (atChatLimit || isCreating) return;

    setErrorMessage(null);
    setIsChatsOpen(false);

    createChat(undefined, {
      onSuccess: (newChat) => setSelectedChatId(newChat.id),
    });
  };

  const handleSelectChat = (id: number) => {
    setSelectedChatId(id);
    setErrorMessage(null);
    setIsChatsOpen(false);
  };

  const handleDeleteChat = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteChat(id);
  };

  return (
    <div className={scss.page}>
      <Header />

      <div className={scss.body}>
        {/* на мобильном — затемнение под выехавшей панелью чатов, закрывает её по тапу */}
        {isChatsOpen && (
          <div
            className={scss.chatsBackdrop}
            onClick={() => setIsChatsOpen(false)}
          />
        )}

        <aside
          className={`${scss.chatsPanel} ${
            isChatsOpen ? scss.chatsPanelOpen : ""
          }`}
        >
          <div className={scss.chatsPanelHeader}>
            <span>Chats</span>

            <div className={scss.chatsPanelHeaderActions}>
              <button
                type="button"
                className={scss.newChatButton}
                onClick={handleNewChat}
                disabled={atChatLimit || isCreating}
                title={
                  atChatLimit
                    ? `You can have up to ${MAX_CHATS} chats — delete one first`
                    : "New chat"
                }
                aria-label="New chat"
              >
                <LuPlus size={15} />
              </button>

              {/* виден только на узких экранах — там панель открыта поверх чата */}
              <button
                type="button"
                className={scss.closeChatsButton}
                onClick={() => setIsChatsOpen(false)}
                aria-label="Close chats"
              >
                <LuX size={15} />
              </button>
            </div>
          </div>

          <div className={scss.chatsList}>
            {chats?.length === 0 && (
              <p className={scss.chatsHint}>No chats yet</p>
            )}

            {chats?.map((item) => (
              <div
                key={item.id}
                className={`${scss.chatItem} ${
                  item.id === selectedChatId ? scss.chatItemActive : ""
                }`}
                onClick={() => handleSelectChat(item.id)}
              >
                <span className={scss.chatItemTitle}>{item.title}</span>

                <button
                  type="button"
                  className={scss.chatItemDelete}
                  onClick={(event) => handleDeleteChat(item.id, event)}
                  aria-label="Delete chat"
                >
                  <LuX size={13} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        <main className={scss.chatArea}>
          <header className={scss.topBar}>
            {/* виден только на узких экранах — открывает панель чатов поверх */}
            <button
              type="button"
              className={scss.historyButton}
              onClick={() => setIsChatsOpen(true)}
              aria-label="Chat history"
            >
              <LuHistory size={18} />
            </button>

            <div className={scss.brand}>
              <LuSparkles className={scss.brandIcon} />
              <span>AI Operator</span>
            </div>

            <span className={scss.preview}>PREVIEW</span>
          </header>

          {showEmptyState ? (
            <div className={scss.emptyWrap}>
              <div className={scss.operatorIcon}>
                <LuSparkles />
                <span />
              </div>

              <h1>How can I help?</h1>

              <p className={scss.description}>
                Ask me about your Gmail, Calendar, Drive or Notes — or try one
                of these.
              </p>

              <div className={scss.cards}>
                <button
                  type="button"
                  className={scss.card}
                  onClick={() =>
                    sendMessageText(
                      "Summarize the most important emails in my inbox today",
                    )
                  }
                >
                  <div className={scss.cardIcon}>
                    <LuInbox />
                  </div>

                  <div>
                    <h3>Inbox summary</h3>
                    <p>Summarize the most important emails in my inbox today</p>
                  </div>
                </button>

                <button
                  type="button"
                  className={scss.card}
                  onClick={() =>
                    sendMessageText("What's on my calendar for today?")
                  }
                >
                  <div className={scss.cardIcon}>
                    <LuCalendarDays />
                  </div>

                  <div>
                    <h3>Today's schedule</h3>
                    <p>What's on my calendar for today?</p>
                  </div>
                </button>

                <button
                  type="button"
                  className={scss.card}
                  onClick={() =>
                    sendMessageText("Find the latest budget file in my Drive")
                  }
                >
                  <div className={scss.cardIcon}>
                    <LuFolder />
                  </div>

                  <div>
                    <h3>Find a file</h3>
                    <p>Find the latest budget file in my Drive</p>
                  </div>
                </button>

                <button
                  type="button"
                  className={scss.card}
                  onClick={() =>
                    sendMessageText(
                      "Create a note with today's meeting takeaways",
                    )
                  }
                >
                  <div className={scss.cardIcon}>
                    <LuNotebookPen />
                  </div>

                  <div>
                    <h3>Create a note</h3>
                    <p>Create a note with today's meeting takeaways</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className={scss.messages}>
              {messages.map((message) =>
                message.role === "user" ? (
                  <div key={message.id} className={scss.userMessage}>
                    {message.content}
                  </div>
                ) : (
                  <div key={message.id} className={scss.assistantMessage}>
                    <ReactMarkdown
                      components={{
                        a: (props) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ),
              )}

              {pendingMessage && (
                <div className={scss.userMessage}>{pendingMessage}</div>
              )}

              {isSending && (
                <div className={scss.assistantMessage}>Thinking...</div>
              )}

              {errorMessage && (
                <div className={scss.errorMessage}>{errorMessage}</div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {!isAuthed && !isProfileLoading && (
            <div className={scss.authNotice}>
              <span>You need to log in to chat with AI Operator.</span>

              <button type="button" onClick={openLogin}>
                Log in
              </button>
            </div>
          )}

          <form className={scss.inputWrapper} onSubmit={handleSubmit}>
            <div className={scss.inputInner}>
              <input
                className={scss.input}
                type="text"
                placeholder={
                  isAuthed
                    ? "Message AI Operator..."
                    : "Log in to message AI Operator..."
                }
                value={input}
                onChange={(event) => setInput(event.target.value)}
                readOnly={!isAuthed}
                onClick={() => {
                  if (!isAuthed) requireAuth();
                }}
                onKeyDown={(event) => {
                  if (!isAuthed && event.key !== "Tab") requireAuth();
                }}
                disabled={isSending || isCreating}
              />

              <button
                type="submit"
                className={scss.sendButton}
                disabled={
                  isAuthed && (isSending || isCreating || !input.trim())
                }
              >
                <LuSparkles />
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AiChat;
