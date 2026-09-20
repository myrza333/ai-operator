"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import scss from "./AppSidebar.module.scss";
import AiChat from "@/components/pages/aiChat/AiChat";

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
  },
  {
    title: "Gmail",
    href: "/gmail",
  },
  {
    title: "Calendar",
    href: "/calendar",
  },
  {
    title: "Drive",
    href: "/drive",
  },
  {
    title: "Notes",
    href: "/notes",
  },
  {
    title: "✨ AI Chat",
    href: "/aiChat",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent className={scss.main}>
        <div className={scss.logo}>
          <h1>AI</h1>
          <Link href={"/"}>
            <span>AI Operator</span>
          </Link>
        </div>
        <div className={scss.chat}></div>
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <SidebarMenuButton
              key={item.href}
              render={<Link href={item.href} />}
              isActive={isActive}
              className={scss.items}
            >
              {item.title}
            </SidebarMenuButton>
          );
        })}
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>

      <SidebarFooter className={scss.footer}>
        <Link
          href="/privacy"
          className={
            pathname === "/privacy" ? scss.privacyActive : scss.privacy
          }
        >
          Privacy Policy
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
