"use client";

import { ReactNode } from "react";
import Header from "@/components/pages/header/Header";
import { useProfile } from "@/hooks/auth/useProfile";
import { useAuthModal } from "./AuthModalContext";
import scss from "./AuthGuard.module.scss";

interface IAuthGuardProps {
  // что именно закрыто до входа: "Gmail", "Drive" — подставляется в подсказку
  service: string;
  children: ReactNode;
}

// Пока профиль не получен, детей не монтируем — так их запросы к API
// не уходят без авторизации и не висят на "Loading..." из-за ретраев 401.
const AuthGuard = ({ service, children }: IAuthGuardProps) => {
  const { data: profile, isLoading } = useProfile();
  const { openLogin, openRegister } = useAuthModal();

  if (profile) return <>{children}</>;

  return (
    <>
      <Header />

      <div className={scss.wrap}>
        {isLoading ? (
          <p className={scss.loading}>Loading...</p>
        ) : (
          <div className={scss.card} role="alert">
            <span className={scss.code}>401</span>

            <h1>Unauthorized</h1>

            <p>Log in to your account to access {service}.</p>

            <div className={scss.actions}>
              <button type="button" onClick={openLogin}>
                Log in
              </button>

              <button
                type="button"
                className={scss.secondary}
                onClick={openRegister}
              >
                Register
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AuthGuard;
