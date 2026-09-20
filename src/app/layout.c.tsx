"use client";
import React, { useState } from "react";
import scss from "./layout.c.module.scss";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/AppSidebar";
import Header from "@/components/pages/header/Header";
import { AuthModalProvider } from "@/components/layout/auth/AuthModalContext";
type ChildrenProps = {
  children: React.ReactNode;
};

const layout = ({ children }: ChildrenProps) => {
  // useState (не let/const) — чтобы клиент создавался один раз, а не на каждый рендер,
  // и чтобы упавшие запросы не зависали в fetchStatus "paused" из-за networkMode по умолчанию
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { networkMode: "always" },
          mutations: { networkMode: "always" },
        },
      }),
  );

  return (
    <QueryClientProvider client={qc}>
      <AuthModalProvider>
        <div className={scss.layout}>
          <SidebarProvider>
            <AppSidebar />
            <main>
              <SidebarTrigger />
              {children}
            </main>
          </SidebarProvider>
        </div>
      </AuthModalProvider>
    </QueryClientProvider>
  );
};

export default layout;
