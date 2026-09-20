"use client";

import Link from "next/link";
import scss from "./Header.module.scss";
import { useForm } from "react-hook-form";
import { useAuthModal } from "@/components/layout/auth/AuthModalContext";
import { API_URL } from "@/lib/config";
import { useRegister } from "@/hooks/auth/useRegister";
import { useLogin } from "@/hooks/auth/useLogin";
import { useProfile } from "@/hooks/auth/useProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/hooks/schemas/auth/register.schema";
import { loginSchema } from "@/hooks/schemas/auth/login.schema";

interface IRegisterForm {
  name: string;
  email: string;
  password: string;
}

interface ILoginForm {
  email: string;
  password: string;
}

const Header = () => {
  // состояние модалок общее (контекст), чтобы их могли открывать и другие страницы
  const { mode, setMode } = useAuthModal();
  const isRegister = mode === "register";
  const isLogin = mode === "login";

  const setIsRegister = (open: boolean) =>
    setMode((prev) => (open ? "register" : prev === "register" ? null : prev));
  const setIsLogin = (open: boolean) =>
    setMode((prev) => (open ? "login" : prev === "login" ? null : prev));

  const { mutate: createAccount } = useRegister();
  const { mutate: joinAccount } = useLogin();

  const { data: profile, isLoading } = useProfile();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IRegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const {
    register: registerLogin,
    reset: resetLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<ILoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const handleRegister = (dataRegister: IRegisterForm) => {
    createAccount(dataRegister, {
      onSuccess: () => {
        reset();
        setIsRegister(false);
        setIsLogin(true);
      },
    });
  };

  const handleLogin = (dataLogin: ILoginForm) => {
    joinAccount(dataLogin, {
      onSuccess: () => {
        resetLogin();
        setIsLogin(false);
      },
    });

    resetLogin();
  };

  return (
    <div className={scss.container}>
      <div className={scss.mainContainer}>
        <div className={scss.profile}>
          {!isLoading && profile ? (
            <Link href="/profile">
              <img
                src={
                  profile?.avatar?.startsWith("http")
                    ? profile.avatar
                    : profile?.avatar
                      ? `${API_URL}/uploads/${profile.avatar}`
                      : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVntI8W66S4tpgqvs7Hap-E5_hdgwEzn_EtkT8HnIRwh6x-s4RwUMnwWA&s=10"
                }
                alt={profile?.name}
              />
            </Link>
          ) : (
            !isLoading && (
              <div className={scss.btns}>
                <button onClick={() => setIsRegister(true)}>Register</button>

                <button onClick={() => setIsLogin(true)}>Login</button>
              </div>
            )
          )}
        </div>

        {isRegister && (
          <form onSubmit={handleSubmit(handleRegister)}>
            <div
              className={scss.backgroundRegister}
              onClick={() => setIsRegister(false)}
            >
              <div
                className={scss.modalRegister}
                onClick={(e) => e.stopPropagation()}
              >
                <h1>Register</h1>

                <div className={scss.inputs}>
                  <input {...register("name")} type="text" placeholder="Name" />

                  {errors.name && <p>{errors.name.message}</p>}

                  <input
                    {...register("email")}
                    type="text"
                    placeholder="Email"
                  />

                  {errors.email && <p>{errors.email.message}</p>}

                  <input
                    {...register("password")}
                    type="password"
                    placeholder="Create password"
                  />

                  {errors.password && <p>{errors.password.message}</p>}
                </div>

                <button type="submit">Sign Up</button>

                <h4
                  onClick={() => {
                    setIsRegister(false);
                    setIsLogin(true);
                    reset();
                  }}
                >
                  Already have an account? Login
                </h4>
              </div>
            </div>
          </form>
        )}

        {isLogin && (
          <form onSubmit={handleSubmitLogin(handleLogin)}>
            <div
              className={scss.backgroundLogin}
              onClick={() => setIsLogin(false)}
            >
              <div
                className={scss.modalLogin}
                onClick={(e) => e.stopPropagation()}
              >
                <h1>Login</h1>

                <div className={scss.inputs}>
                  <input
                    {...registerLogin("email")}
                    type="text"
                    placeholder="Email"
                  />

                  {loginErrors.email && <p>{loginErrors.email.message}</p>}

                  <input
                    {...registerLogin("password")}
                    type="password"
                    placeholder="Password"
                  />

                  {loginErrors.password && (
                    <p>{loginErrors.password.message}</p>
                  )}
                </div>

                <button type="submit">Login</button>

                <h4
                  onClick={() => {
                    setIsLogin(false);
                    setIsRegister(true);
                    resetLogin();
                  }}
                >
                  Don't have an account? SignUp
                </h4>

                <div className={scss.lines}>
                  <div className={scss.line}></div>
                  <h3>or</h3>
                  <div className={scss.line}></div>
                </div>
                <button className={scss.google}>
                  <img
                    width={25}
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png?utm_source=ru.wikipedia.org&utm_campaign=index&utm_content=thumbnail"
                    alt=""
                  />
                  <a href={`${API_URL}/auth/google`}>
                    Continue with Google
                  </a>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Header;
