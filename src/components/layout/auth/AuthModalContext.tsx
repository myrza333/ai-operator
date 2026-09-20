"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

export type AuthModalMode = "login" | "register" | null;

interface IAuthModalContext {
  mode: AuthModalMode;
  setMode: Dispatch<SetStateAction<AuthModalMode>>;
  openLogin: () => void;
  openRegister: () => void;
}

const AuthModalContext = createContext<IAuthModalContext | null>(null);

// состояние модалок Login/Register живёт здесь, а не в Header, чтобы любая
// страница (Gmail, Drive, AI Chat) могла "забросить" пользователя на авторизацию
export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<AuthModalMode>(null);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      openLogin: () => setMode("login"),
      openRegister: () => setMode("register"),
    }),
    [mode],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);

  if (!context) {
    throw new Error("useAuthModal must be used inside AuthModalProvider");
  }

  return context;
};
