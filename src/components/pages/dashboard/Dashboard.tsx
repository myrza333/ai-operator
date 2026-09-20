"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  FolderOpen,
  Mail,
  Sparkles,
  StickyNote,
} from "lucide-react";
import Header from "../header/Header";
import AuthGuard from "@/components/layout/auth/AuthGuard";
import scss from "./Dashboard.module.scss";
import { useGetGmail } from "@/hooks/gmail/useGetGmail";
import { useGetCalendar } from "@/hooks/calendar/useGetCalendar";
import { useGetDrive } from "@/hooks/drive/useGetDrive";
import { useGetNotes } from "@/hooks/notes/useGetNotes";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const formatEventDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

const features = [
  {
    href: "/gmail",
    icon: Mail,
    title: "Gmail",
    description:
      "Read, search, reply and organize your inbox without leaving the app.",
  },
  {
    href: "/calendar",
    icon: CalendarDays,
    title: "Calendar",
    description:
      "Keep your own events alongside your Google Calendar schedule.",
  },
  {
    href: "/drive",
    icon: FolderOpen,
    title: "Drive",
    description: "Browse folders, star important files and upload new ones.",
  },
  {
    href: "/notes",
    icon: StickyNote,
    title: "Notes",
    description:
      "Write things down and keep checklists for anything you need to do.",
  },
];

const DashboardContent = () => {
  const { data: unreadMessages } = useGetGmail({ filter: "unread" });
  const { data: calendarData } = useGetCalendar();
  const { data: driveItems } = useGetDrive();
  const { data: notes } = useGetNotes();

  const nextEvent = useMemo(() => {
    if (!calendarData) return null;

    const todayStr = new Date().toISOString().slice(0, 10);
    const upcoming = [...calendarData.own, ...calendarData.google]
      .filter((event) => event.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    return upcoming[0] || null;
  }, [calendarData]);

  const notesStats = useMemo(() => {
    if (!notes) return null;

    const openTasks = notes.reduce(
      (sum, note) => sum + note.items.filter((item) => !item.done).length,
      0,
    );

    return { totalNotes: notes.length, openTasks };
  }, [notes]);

  const stats: Record<string, string | null> = {
    "/gmail": unreadMessages
      ? `${unreadMessages.length} unread`
      : null,
    "/calendar": nextEvent
      ? `Next: ${nextEvent.title} · ${formatEventDate(nextEvent.date)}`
      : calendarData
        ? "No upcoming events"
        : null,
    "/drive": driveItems ? `${driveItems.length} item${driveItems.length === 1 ? "" : "s"} in My Drive` : null,
    "/notes": notesStats
      ? `${notesStats.totalNotes} note${notesStats.totalNotes === 1 ? "" : "s"} · ${notesStats.openTasks} task${notesStats.openTasks === 1 ? "" : "s"} open`
      : null,
  };

  return (
    <>
      <Header />

      <main className={scss.page}>
        <section className={scss.hero}>
          <span className={scss.eyebrow}>{getGreeting()}</span>
          <h1>AI Operator</h1>
          <p>
            Your personal productivity hub — email, calendar, files and notes,
            all in one place.
          </p>

          <Link href="/aiChat" className={scss.heroCta}>
            <Sparkles size={18} />
            Open AI Chat
            <ArrowRight size={16} />
          </Link>
        </section>

        <section className={scss.grid}>
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Link
                key={feature.href}
                href={feature.href}
                className={scss.card}
              >
                <div className={scss.cardIcon}>
                  <Icon size={24} />
                </div>

                <div className={scss.cardBody}>
                  <h2>{feature.title}</h2>
                  <p>{feature.description}</p>
                  {stats[feature.href] && (
                    <span className={scss.cardStat}>
                      {stats[feature.href]}
                    </span>
                  )}
                </div>

                <ArrowRight size={20} className={scss.cardArrow} />
              </Link>
            );
          })}
        </section>
      </main>
    </>
  );
};

const Dashboard = () => (
  <AuthGuard service="the Dashboard">
    <DashboardContent />
  </AuthGuard>
);

export default Dashboard;
