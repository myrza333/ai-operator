"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Plus,
  Search,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import scss from "./Notes.module.scss";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "../header/Header";
import AuthGuard from "@/components/layout/auth/AuthGuard";
import { INoteItem, useGetNotes } from "@/hooks/notes/useGetNotes";
import { useCreateNotes } from "@/hooks/notes/useCreateNotes";
import { useUpdateNotes } from "@/hooks/notes/useUpdateNotes";
import { useDeleteNotes } from "@/hooks/notes/useDeleteNotes";
import { useCreateNoteItem } from "@/hooks/notes/useCreateNoteItem";
import { useUpdateNoteItem } from "@/hooks/notes/useUpdateNoteItem";
import { useDeleteNoteItem } from "@/hooks/notes/useDeleteNoteItem";

const formatRelativeDate = (value: string) => {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
};

interface NoteItemRowProps {
  item: INoteItem;
  onToggle: () => void;
  onDelete: () => void;
  onEditCommit: (content: string) => void;
}

const NoteItemRow = ({
  item,
  onToggle,
  onDelete,
  onEditCommit,
}: NoteItemRowProps) => {
  const [text, setText] = useState(item.content);

  useEffect(() => {
    setText(item.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, item.content]);

  const commit = () => {
    const trimmed = text.trim();

    if (trimmed && trimmed !== item.content) {
      onEditCommit(trimmed);
    } else if (!trimmed) {
      setText(item.content);
    }
  };

  return (
    <div className={`${scss.taskRow} ${item.done ? scss.taskDone : ""}`}>
      <button
        type="button"
        className={scss.checkbox}
        onClick={onToggle}
        aria-pressed={item.done}
        aria-label={item.done ? "Mark as not done" : "Mark as done"}
      >
        {item.done && <Check size={12} strokeWidth={3} />}
      </button>

      <input
        className={scss.taskInput}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            (event.target as HTMLInputElement).blur();
          }
        }}
      />

      <button
        type="button"
        className={scss.taskDelete}
        onClick={onDelete}
        aria-label="Delete task"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const NotesContent = () => {
  const { data: notes, isLoading } = useGetNotes();
  const { mutate: createNote, isPending: isCreating } = useCreateNotes();
  const { mutate: updateNote } = useUpdateNotes();
  const { mutate: deleteNote } = useDeleteNotes();
  const { mutate: createItem } = useCreateNoteItem();
  const { mutate: updateItem } = useUpdateNoteItem();
  const { mutate: deleteItem } = useDeleteNoteItem();

  // на телефоне список и заметка не помещаются рядом — не открываем заметку
  // автоматически, чтобы человек сначала увидел список, а не редактор
  const isMobile = useIsMobile();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newTask, setNewTask] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const newTaskInputRef = useRef<HTMLInputElement>(null);

  const selectedNote = notes?.find((note) => note.id === selectedId) || null;

  useEffect(() => {
    if (!notes || notes.length === 0) {
      setSelectedId(null);
      return;
    }

    if (selectedId && !notes.some((note) => note.id === selectedId)) {
      setSelectedId(isMobile ? null : notes[0].id);
      return;
    }

    if (!selectedId && !isMobile) {
      setSelectedId(notes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  useEffect(() => {
    isFirstRender.current = true;
    setTitle(selectedNote?.title || "");
    setContent(selectedNote?.content || "");
    setNewTask("");
    setSaveState("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!selectedId) return;

    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    setSaveState("saving");
    saveTimeout.current = setTimeout(() => {
      updateNote(
        { id: selectedId, title: title.trim() || "Untitled note", content },
        { onSuccess: () => setSaveState("saved") },
      );
    }, 700);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  const handleCreate = () => {
    createNote(
      { title: "Untitled note", content: "" },
      { onSuccess: (note) => setSelectedId(note.id) },
    );
  };

  const handleDelete = (id: number) => {
    deleteNote(id, {
      onSuccess: () => {
        if (selectedId === id) setSelectedId(null);
      },
    });
  };

  const handleAddTask = () => {
    const text = newTask.trim();
    if (!text || !selectedId) return;

    createItem(
      { noteId: selectedId, content: text },
      { onSuccess: () => newTaskInputRef.current?.focus() },
    );
    setNewTask("");
  };

  const filteredNotes = notes?.filter((note) =>
    `${note.title} ${note.content}`.toLowerCase().includes(search.toLowerCase()),
  );

  const items = selectedNote?.items || [];
  const doneCount = items.filter((item) => item.done).length;
  const progress = items.length ? (doneCount / items.length) * 100 : 0;

  return (
    <div className={scss.page}>
      <Header />

      <main
        className={`${scss.body} ${
          selectedNote ? scss.bodyDetailOpen : ""
        }`}
      >
        <section className={scss.list}>
          <div className={scss.listHeader}>
            <h1>Notes</h1>
            <button
              className={scss.newButton}
              onClick={handleCreate}
              disabled={isCreating}
              aria-label="New note"
            >
              <Plus size={17} strokeWidth={2.5} />
            </button>
          </div>

          <div className={scss.search}>
            <Search size={15} />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className={scss.items}>
            {isLoading && <p className={scss.hint}>Loading notes...</p>}

            {!isLoading && filteredNotes?.length === 0 && (
              <div className={scss.emptyList}>
                <StickyNote size={22} />
                <p>No notes yet. Create your first one.</p>
              </div>
            )}

            {filteredNotes?.map((note) => {
              const total = note.items.length;
              const done = note.items.filter((item) => item.done).length;

              return (
                <button
                  key={note.id}
                  className={`${scss.item} ${
                    note.id === selectedId ? scss.itemActive : ""
                  }`}
                  onClick={() => setSelectedId(note.id)}
                >
                  <div className={scss.itemTop}>
                    <strong>{note.title || "Untitled note"}</strong>
                    <time>{formatRelativeDate(note.updated_at)}</time>
                  </div>

                  {total > 0 ? (
                    <div className={scss.itemProgress}>
                      <div className={scss.progressTrack}>
                        <div
                          className={scss.progressFill}
                          style={{ width: `${(done / total) * 100}%` }}
                        />
                      </div>
                      <span>
                        {done}/{total}
                      </span>
                    </div>
                  ) : (
                    <p>{note.content || "No content yet"}</p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className={scss.editor}>
          {!selectedNote && (
            <div className={scss.empty}>
              <StickyNote size={30} strokeWidth={1.3} />
              <h2>No note selected</h2>
              <p>Pick a note from the list, or create a new one to start.</p>
              <button
                className={scss.emptyCta}
                onClick={handleCreate}
                disabled={isCreating}
              >
                <Plus size={15} strokeWidth={2.5} />
                New note
              </button>
            </div>
          )}

          {selectedNote && (
            <>
              <div className={scss.editorToolbar}>
                {/* виден только на узких экранах — там список и заметка не
                    помещаются рядом, поэтому заметка открывается на весь экран */}
                <button
                  type="button"
                  className={scss.backButton}
                  onClick={() => setSelectedId(null)}
                  aria-label="Back to notes"
                >
                  <ArrowLeft size={16} />
                  Notes
                </button>

                <span className={scss.saveState}>
                  {saveState === "saving" && "Saving..."}
                  {saveState === "saved" && "Saved"}
                </span>

                <button
                  className={scss.deleteButton}
                  onClick={() => handleDelete(selectedNote.id)}
                  aria-label="Delete note"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className={scss.editorScroll}>
                <input
                  className={scss.titleInput}
                  value={title}
                  placeholder="Untitled note"
                  onChange={(event) => setTitle(event.target.value)}
                />

                <div className={scss.addTask}>
                  <Plus size={16} className={scss.addTaskIcon} />
                  <input
                    ref={newTaskInputRef}
                    placeholder="Add a task and press Enter"
                    value={newTask}
                    onChange={(event) => setNewTask(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddTask();
                      }
                    }}
                  />
                </div>

                {items.length > 0 && (
                  <div className={scss.tasksSection}>
                    <div className={scss.tasksMeta}>
                      <div className={scss.progressTrack}>
                        <div
                          className={scss.progressFill}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span>
                        {doneCount} of {items.length} done
                      </span>
                    </div>

                    <div className={scss.taskList}>
                      {items.map((item) => (
                        <NoteItemRow
                          key={item.id}
                          item={item}
                          onToggle={() =>
                            updateItem({
                              noteId: selectedNote.id,
                              itemId: item.id,
                              done: !item.done,
                            })
                          }
                          onDelete={() =>
                            deleteItem({
                              noteId: selectedNote.id,
                              itemId: item.id,
                            })
                          }
                          onEditCommit={(value) =>
                            updateItem({
                              noteId: selectedNote.id,
                              itemId: item.id,
                              content: value,
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className={scss.descriptionSection}>
                  <span className={scss.descriptionLabel}>Description</span>
                  <textarea
                    className={scss.contentInput}
                    value={content}
                    placeholder="Add more details... (optional)"
                    onChange={(event) => setContent(event.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

const Notes = () => (
  <AuthGuard service="Notes">
    <NotesContent />
  </AuthGuard>
);

export default Notes;
