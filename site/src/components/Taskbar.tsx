import { useEffect, useState } from "react";
import { Activity, FileText, FolderOpen, MessageCircle, Presentation, Spade } from "lucide-react";
import type { WinState } from "./DesktopWindow";

interface TaskbarProps {
  windows: WinState[];
  activeId: string | null;
  onItem: (id: string) => void;
  onSignOut: () => void;
}

const formatClock = (date: Date) =>
  date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const iconFor = (id: string) => {
  if (id === "chat") return MessageCircle;
  if (id === "projects") return FolderOpen;
  if (id === "stats") return Activity;
  if (id === "resume") return FileText;
  if (id === "solitaire") return Spade;
  return Presentation;
};

// Win7-style taskbar: one button per open window, clock in the tray
function Taskbar({ windows, activeId, onItem, onSignOut }: TaskbarProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="taskbar" aria-label="Open windows">
      <button
        type="button"
        className="taskbar-orb"
        onClick={onSignOut}
        aria-label="Back to the sign-in screen"
        title="Back to the sign-in screen"
      >
        DB
      </button>
      <ul className="ml-1 flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
        {windows.map((win) => {
          const Icon = iconFor(win.id);
          const isActive = activeId === win.id && !win.minimized;
          return (
            <li key={win.id}>
              <button
                type="button"
                className={`taskbar-item ${isActive ? "is-active" : ""}`}
                aria-pressed={isActive}
                onClick={() => onItem(win.id)}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="max-w-[180px] truncate">{win.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="ml-auto flex items-center gap-4 px-3 text-[13px] text-white">
        <span className="hidden xl:inline">© 2026 Dominic Bankovitch</span>
        <time className="tabular" dateTime={now.toISOString()}>
          {formatClock(now)}
        </time>
      </div>
    </nav>
  );
}

export default Taskbar;
