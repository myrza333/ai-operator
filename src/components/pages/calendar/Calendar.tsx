"use client";

import { useMemo, useState } from "react";
import scss from "./Calendar.module.scss";
import Header from "../header/Header";
import AuthGuard from "@/components/layout/auth/AuthGuard";
import { EventType, useGetCalendar } from "@/hooks/calendar/useGetCalendar";
import { useCreateEvent } from "@/hooks/calendar/useCreateEvent";
import { useDeleteEvent } from "@/hooks/calendar/useDeleteEvent";
import { useUpdateEvent } from "@/hooks/calendar/useUpdateEvent";

// сколько событий помещается в ячейку дня; остальные уходят в "+ ещё N",
// чтобы ячейки не растягивались и не сдвигали нижние недели
const MAX_VISIBLE_EVENTS = 2;
const MAX_TITLE_LENGTH = 150;

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const months = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

type CalendarEvent = {
  id: number | string;
  date: string;
  title: string;
  type: EventType;
  source: "own" | "google";
  link?: string | null;
};

const TypePicker = ({
  value,
  onChange,
}: {
  value: EventType;
  onChange: (type: EventType) => void;
}) => (
  <div className={scss.types}>
    <button
      type="button"
      className={value === "plan" ? scss.activeType : ""}
      onClick={() => onChange("plan")}
    >
      <span className={scss.planDot} />
      План
    </button>

    <button
      type="button"
      className={value === "holiday" ? scss.activeType : ""}
      onClick={() => onChange("holiday")}
    >
      <span className={scss.holidayDot} />
      Праздник
    </button>

    <button
      type="button"
      className={value === "other" ? scss.activeType : ""}
      onClick={() => onChange("other")}
    >
      <span className={scss.otherDot} />
      Другое
    </button>
  </div>
);

const formatLongDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const CalendarContent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data, isLoading } = useGetCalendar();
  const { mutate: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const {
    mutate: updateEvent,
    isPending: isUpdating,
    isError: isUpdateError,
    reset: resetUpdate,
  } = useUpdateEvent();

  const events: CalendarEvent[] = useMemo(() => {
    const own = (data?.own || []).map((event) => ({
      ...event,
      source: "own" as const,
    }));
    const google = (data?.google || []).map((event) => ({
      ...event,
      source: "google" as const,
    }));

    return [...own, ...google];
  }, [data]);

  const [showModal, setShowModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("plan");

  // просмотр / редактирование существующего события
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState<EventType>("plan");

  // модалка со списком всех событий дня ("+ ещё N")
  const [dayListDate, setDayListDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();

    return Array.from({ length: 42 }, (_, index) => {
      const dayIndex = index - startDay + 1;

      if (dayIndex <= 0) {
        return {
          day: previousMonthDays + dayIndex,
          month: month - 1,
          year: month === 0 ? year - 1 : year,
          outside: true,
        };
      }

      if (dayIndex > totalDays) {
        return {
          day: dayIndex - totalDays,
          month: month + 1,
          year: month === 11 ? year + 1 : year,
          outside: true,
        };
      }

      return {
        day: dayIndex,
        month,
        year,
        outside: false,
      };
    });
  }, [year, month]);

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  const getEvents = (day: number, itemMonth: number, itemYear: number) => {
    const date = formatDate(new Date(itemYear, itemMonth, day));

    return events.filter((event) => event.date === date);
  };

  const changeMonth = (value: number) => {
    setCurrentDate(new Date(year, month + value, 1));
  };

  const isToday = (day: number, itemMonth: number, itemYear: number) => {
    const today = new Date();

    return (
      today.getDate() === day &&
      today.getMonth() === itemMonth &&
      today.getFullYear() === itemYear
    );
  };

  const isSelected = (day: number, itemMonth: number, itemYear: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === itemMonth &&
      selectedDate.getFullYear() === itemYear
    );
  };

  const selectDate = (day: number, itemMonth: number, itemYear: number) => {
    const date = new Date(itemYear, itemMonth, day);

    setSelectedDate(date);

    if (itemMonth !== month || itemYear !== year) {
      setCurrentDate(new Date(itemYear, itemMonth, 1));
    }
  };

  const openEventModal = () => {
    setEventTitle("");
    setEventType("plan");
    setShowModal(true);
  };

  const addEvent = () => {
    if (!eventTitle.trim()) return;

    createEvent(
      {
        date: formatDate(selectedDate),
        title: eventTitle.trim(),
        type: eventType,
      },
      {
        onSuccess: () => {
          setShowModal(false);
          setEventTitle("");
        },
      },
    );
  };

  const removeEvent = (event: CalendarEvent, onDone?: () => void) => {
    if (event.source !== "own") return;
    deleteEvent(event.id as number, { onSuccess: onDone });
  };

  const openEvent = (event: CalendarEvent) => {
    resetUpdate();
    setEditTitle(event.title);
    setEditDate(event.date);
    setEditType(event.type);
    setDayListDate(null);
    setActiveEvent(event);
  };

  const closeEvent = () => setActiveEvent(null);

  const canSaveEdit =
    editTitle.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(editDate);

  const saveEvent = () => {
    if (!activeEvent || activeEvent.source !== "own" || !canSaveEdit) return;

    updateEvent(
      {
        id: activeEvent.id as number,
        title: editTitle.trim(),
        date: editDate,
        type: editType,
      },
      { onSuccess: closeEvent },
    );
  };

  const openDayList = (day: number, itemMonth: number, itemYear: number) => {
    selectDate(day, itemMonth, itemYear);
    setDayListDate(formatDate(new Date(itemYear, itemMonth, day)));
  };

  const dayListEvents = dayListDate
    ? events.filter((event) => event.date === dayListDate)
    : [];

  const goToToday = () => {
    const today = new Date();

    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

    setSelectedDate(today);
  };

  return (
    <>
      <Header />
      <main className={scss.container}>
        <section className={scss.calendar}>
          <header className={scss.header}>
            <div>
              <p className={scss.label}>Календарь</p>

              <h1>
                {months[month]} <span>{year}</span>
              </h1>

              {isLoading && <p className={scss.label}>Загрузка событий...</p>}
            </div>

            <div className={scss.actions}>
              <button onClick={goToToday}>Сегодня</button>

              <button
                className={scss.addButton}
                onClick={openEventModal}
                disabled={isCreating}
              >
                + Событие
              </button>

              <div className={scss.navigation}>
                <button
                  onClick={() => changeMonth(-1)}
                  aria-label="Предыдущий месяц"
                >
                  ‹
                </button>

                <button
                  onClick={() => changeMonth(1)}
                  aria-label="Следующий месяц"
                >
                  ›
                </button>
              </div>
            </div>
          </header>

          <div className={scss.week}>
            {weekDays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className={scss.grid}>
            {days.map((item, index) => {
              const dayEvents = getEvents(item.day, item.month, item.year);

              return (
                <div
                  key={`${item.year}-${item.month}-${item.day}-${index}`}
                  role="button"
                  tabIndex={0}
                  className={[
                    scss.day,
                    item.outside ? scss.outside : "",
                    isToday(item.day, item.month, item.year) ? scss.today : "",
                    isSelected(item.day, item.month, item.year)
                      ? scss.selected
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => selectDate(item.day, item.month, item.year)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectDate(item.day, item.month, item.year);
                    }
                  }}
                >
                  <span className={scss.dayNumber}>{item.day}</span>

                  {isToday(item.day, item.month, item.year) && <i />}

                  <div className={scss.events}>
                    {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => (
                      <div
                        key={event.id}
                        role="button"
                        tabIndex={0}
                        className={`${scss.event} ${scss[event.type]} ${
                          event.source === "google" ? scss.google : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEvent(event);
                        }}
                        onKeyDown={(e) => {
                          if (e.target !== e.currentTarget) return;

                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            openEvent(event);
                          }
                        }}
                        title={event.title}
                      >
                        <span>{event.title}</span>

                        {event.source === "own" && (
                          <button
                            type="button"
                            aria-label="Удалить событие"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeEvent(event);
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}

                    {dayEvents.length > MAX_VISIBLE_EVENTS && (
                      <button
                        type="button"
                        className={scss.more}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDayList(item.day, item.month, item.year);
                        }}
                      >
                        +<span className={scss.moreLabel}> ещё </span>
                        {dayEvents.length - MAX_VISIBLE_EVENTS}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <footer className={scss.footer}>
            <div>
              <span className={scss.dot} />
              Сегодня
            </div>

            <div className={scss.selectedDate}>
              {selectedDate.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </footer>
        </section>
        {showModal && (
          <div
            className={scss.modalOverlay}
            onClick={() => setShowModal(false)}
          >
            <div className={scss.modal} onClick={(e) => e.stopPropagation()}>
              <div className={scss.modalHeader}>
                <div>
                  <p>Новое событие</p>

                  <h2>
                    {selectedDate.toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                    })}
                  </h2>
                </div>

                <button
                  className={scss.close}
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              <label>
                Название
                <input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Например, встреча"
                  maxLength={MAX_TITLE_LENGTH}
                  autoFocus
                />
              </label>
              <TypePicker value={eventType} onChange={setEventType} />
              <button
                className={scss.createButton}
                onClick={addEvent}
                disabled={isCreating}
              >
                {isCreating ? "Добавляем..." : "Добавить событие"}
              </button>
            </div>
          </div>
        )}

        {dayListDate && (
          <div
            className={scss.modalOverlay}
            onClick={() => setDayListDate(null)}
          >
            <div className={scss.modal} onClick={(e) => e.stopPropagation()}>
              <div className={scss.modalHeader}>
                <div>
                  <p>События</p>

                  <h2>{formatLongDate(dayListDate)}</h2>
                </div>

                <button
                  className={scss.close}
                  onClick={() => setDayListDate(null)}
                  aria-label="Закрыть"
                >
                  ×
                </button>
              </div>

              <ul className={scss.dayList}>
                {dayListEvents.map((event) => (
                  <li key={event.id}>
                    <button
                      type="button"
                      className={`${scss.dayListItem} ${scss[event.type]}`}
                      onClick={() => openEvent(event)}
                    >
                      {event.title}
                    </button>
                  </li>
                ))}
              </ul>

              <button
                className={scss.createButton}
                onClick={() => {
                  setDayListDate(null);
                  openEventModal();
                }}
              >
                + Добавить событие
              </button>
            </div>
          </div>
        )}

        {activeEvent && (
          <div className={scss.modalOverlay} onClick={closeEvent}>
            <div className={scss.modal} onClick={(e) => e.stopPropagation()}>
              <div className={scss.modalHeader}>
                <div>
                  <p>
                    {activeEvent.source === "google"
                      ? "Событие из Google Calendar"
                      : "Редактирование события"}
                  </p>

                  <h2>{formatLongDate(activeEvent.date)}</h2>
                </div>

                <button
                  className={scss.close}
                  onClick={closeEvent}
                  aria-label="Закрыть"
                >
                  ×
                </button>
              </div>

              {activeEvent.source === "own" ? (
                <>
                  <label>
                    Название
                    <textarea
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={MAX_TITLE_LENGTH}
                      rows={3}
                      autoFocus
                    />
                  </label>

                  <label className={scss.dateField}>
                    Дата
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </label>

                  <TypePicker value={editType} onChange={setEditType} />

                  {isUpdateError && (
                    <p className={scss.error}>
                      Не удалось сохранить событие. Попробуйте ещё раз.
                    </p>
                  )}

                  <div className={scss.modalActions}>
                    <button
                      className={scss.deleteButton}
                      onClick={() => removeEvent(activeEvent, closeEvent)}
                      disabled={isDeleting || isUpdating}
                    >
                      {isDeleting ? "Удаляем..." : "Удалить"}
                    </button>

                    <button
                      className={scss.createButton}
                      onClick={saveEvent}
                      disabled={!canSaveEdit || isUpdating || isDeleting}
                    >
                      {isUpdating ? "Сохраняем..." : "Сохранить"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className={scss.fullTitle}>{activeEvent.title}</p>

                  {activeEvent.link && (
                    <a
                      className={scss.createButton}
                      href={activeEvent.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Открыть в Google Calendar
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

const Calendar = () => (
  <AuthGuard service="Calendar">
    <CalendarContent />
  </AuthGuard>
);

export default Calendar;
