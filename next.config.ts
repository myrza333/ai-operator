import type { NextConfig } from "next";

// Адрес бэкенда, на который Next проксирует запросы /api/*. Так браузер ходит
// только на домен фронтенда, и cookie с refresh-токеном остаётся first-party
// (иначе Safari/Firefox режут её, когда фронт и бэк на разных доменах).
// В разработке переменную можно не задавать — прокси тогда выключен и фронт
// ходит на NEXT_PUBLIC_API_URL напрямую.
const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiProxyTarget) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
