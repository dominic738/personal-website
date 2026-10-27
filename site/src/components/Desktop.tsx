import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";
import type { LucideIcon } from "lucide-react";
import { MessageCircle, FolderOpen, FileText, Activity, Phone, Spade } from "lucide-react";
import DesktopWindow from "./DesktopWindow";
import type { Rect, WinState } from "./DesktopWindow";
import Conversation from "./Conversation";
import { ProjectsExplorer, ProjectDetails } from "./Projects";
import Stats from "./Stats";
import Solitaire from "./Solitaire";
import Taskbar from "./Taskbar";
import { CONTACTS, usePhoneCopy } from "../contacts";
import { PROJECTS } from "../projects";

const TASKBAR = 44;
const ICON_COLUMN = 112;
const GAP = 16;
const RESUME_URL = "/Bankovitch_Resume.pdf";

type Bounds = { w: number; h: number };

const getBounds = (): Bounds => ({
  w: window.innerWidth,
  h: window.innerHeight - TASKBAR,
});

const projectFor = (id: string) =>
  PROJECTS.find((p) => `project:${p.slug}` === id);

const titleFor = (id: string) => {
  if (id === "chat") return "Dominic Bankovitch - Conversation";
  if (id === "projects") return "Projects";
  if (id === "stats") return "What's new";
  if (id === "resume") return "Bankovitch_Resume.pdf";
  if (id === "solitaire") return "Solitaire";
  return projectFor(id)?.title ?? "Project";
};

// Where each window opens: the conversation owns most of the screen,
// projects and stats stack on the right, everything else cascades in the middle
function defaultRect(id: string, b: Bounds, cascade: number): Rect {
  const rightW = Math.round(Math.min(440, Math.max(320, b.w * 0.25)));
  const rightX = b.w - rightW - GAP;
  const projectsH = Math.round((b.h - GAP * 3) * 0.62);

  if (id === "chat") {
    return { x: ICON_COLUMN, y: GAP, w: rightX - GAP - ICON_COLUMN, h: b.h - GAP * 2 };
  }
  if (id === "projects") return { x: rightX, y: GAP, w: rightW, h: projectsH };
  if (id === "stats") {
    return { x: rightX, y: GAP * 2 + projectsH, w: rightW, h: b.h - GAP * 3 - projectsH };
  }
  if (id === "solitaire") {
    const w = Math.min(900, b.w - GAP * 2);
    const h = Math.min(680, b.h - GAP * 2);
    return { x: Math.round((b.w - w) / 2), y: Math.round((b.h - h) / 2), w, h };
  }
  if (id === "resume") {
    const w = Math.min(920, b.w - GAP * 2);
    return { x: Math.round((b.w - w) / 2), y: GAP, w, h: b.h - GAP * 2 };
  }
  const w = Math.min(1040, Math.round(b.w * 0.64));
  const h = Math.min(b.h - GAP * 2, 780);
  const offset = (cascade % 5) * 28;
  return { x: Math.round((b.w - w) / 2) - 56 + offset, y: GAP + offset, w, h };
}

const topZ = (list: WinState[]) => list.reduce((max, w) => Math.max(max, w.z), 0);

const createWin = (id: string, b: Bounds, z: number, cascade = 0): WinState => ({
  id,
  title: titleFor(id),
  ...defaultRect(id, b, cascade),
  z,
  minimized: false,
  maximized: false,
});

// Bring a window to the front, creating it if it isn't open yet
const openIn = (list: WinState[], id: string): WinState[] => {
  const z = topZ(list) + 1;
  if (list.some((w) => w.id === id)) {
    return list.map((w) => (w.id === id ? { ...w, z, minimized: false } : w));
  }
  const cascade = list.filter((w) => w.id.startsWith("project:")).length;
  return [...list, createWin(id, getBounds(), z, cascade)];
};

const topmostVisible = (list: WinState[]) =>
  list.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0]?.id ?? null;

interface DesktopProps {
  signedIn: boolean;
  resumeRequest: number;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onSignOut: () => void;
}

function Desktop({ signedIn, resumeRequest, inputRef, onSignOut }: DesktopProps) {
  const [bounds, setBounds] = useState(getBounds);
  const [wins, setWins] = useState<WinState[]>(() => {
    const b = getBounds();
    return [createWin("chat", b, 3), createWin("projects", b, 1), createWin("stats", b, 2)];
  });
  const [activeId, setActiveId] = useState<string | null>("chat");
  const [dragging, setDragging] = useState(false);
  const { copied, copy } = usePhoneCopy();

  const [seenResumeRequest, setSeenResumeRequest] = useState(resumeRequest);

  const focus = useCallback((id: string) => {
    setWins((prev) => {
      const z = topZ(prev) + 1;
      return prev.map((w) => (w.id === id ? { ...w, z, minimized: false } : w));
    });
    setActiveId(id);
  }, []);

  const open = useCallback((id: string) => {
    setWins((prev) => openIn(prev, id));
    setActiveId(id);
  }, []);

  // The sign-in screen's "view my resume" asks for the resume window
  if (resumeRequest !== seenResumeRequest) {
    setSeenResumeRequest(resumeRequest);
    open("resume");
  }

  const minimize = (id: string) => {
    const next = wins.map((w) => (w.id === id ? { ...w, minimized: true } : w));
    setWins(next);
    setActiveId(topmostVisible(next));
  };

  const close = (id: string) => {
    const next = wins.filter((w) => w.id !== id);
    setWins(next);
    setActiveId(topmostVisible(next));
  };

  const toggleMaximize = (id: string) => {
    setWins((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized && w.restore) return { ...w, ...w.restore, maximized: false, restore: undefined };
        return {
          ...w,
          restore: { x: w.x, y: w.y, w: w.w, h: w.h },
          x: 0,
          y: 0,
          w: bounds.w,
          h: bounds.h,
          maximized: true,
        };
      })
    );
    focus(id);
  };

  const move = (id: string, rect: Rect) => {
    setWins((prev) => prev.map((w) => (w.id === id ? { ...w, ...rect } : w)));
  };

  // Keep every window reachable when the browser window changes size
  useEffect(() => {
    const onResize = () => {
      const b = getBounds();
      setBounds(b);
      setWins((prev) =>
        prev.map((w) => {
          if (w.maximized) return { ...w, w: b.w, h: b.h };
          const width = Math.min(w.w, b.w);
          const height = Math.min(w.h, b.h);
          return {
            ...w,
            w: width,
            h: height,
            x: Math.min(Math.max(w.x, 0), b.w - width),
            y: Math.min(Math.max(w.y, 0), b.h - height),
          };
        })
      );
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onTaskbarItem = (id: string) => {
    const win = wins.find((w) => w.id === id);
    if (!win) return;
    if (!win.minimized && activeId === id) minimize(id);
    else focus(id);
  };

  const icons: { label: string; icon: LucideIcon; color: string; onClick?: () => void; href?: string }[] = [
    { label: "Conversation", icon: MessageCircle, color: "#2f9a3c", onClick: () => open("chat") },
    { label: "Projects", icon: FolderOpen, color: "#d48a12", onClick: () => open("projects") },
    { label: "Resume.pdf", icon: FileText, color: "#c0392b", onClick: () => open("resume") },
    { label: "What's new", icon: Activity, color: "#1683bd", onClick: () => open("stats") },
    { label: "Solitaire", icon: Spade, color: "#2f7d32", onClick: () => open("solitaire") },
    ...CONTACTS.map((c) => ({ label: c.name, icon: c.icon, color: c.color, href: c.href })),
    {
      label: copied ? "Number copied" : "Copy phone number",
      icon: Phone,
      color: "#138a8a",
      onClick: copy,
    },
  ];

  const renderContent = (win: WinState) => {
    if (win.id === "chat") {
      return (
        <Conversation
          active={signedIn}
          layout="desktop"
          onOpenResume={() => open("resume")}
          inputRef={inputRef}
        />
      );
    }
    if (win.id === "projects") {
      return <ProjectsExplorer onOpen={(slug) => open(`project:${slug}`)} />;
    }
    if (win.id === "stats") return <Stats />;
    if (win.id === "solitaire") return <Solitaire />;
    if (win.id === "resume") {
      return (
        <>
          <div className="msn-body min-h-0 flex-1">
            <iframe src={RESUME_URL} title="Dominic Bankovitch's resume" className="h-full w-full" />
          </div>
          <div className="status-bar">
            <a
              className="status-bar-field text-[var(--link)] underline underline-offset-2"
              href={RESUME_URL}
              target="_blank"
              rel="noreferrer"
            >
              Open in a new tab
            </a>
          </div>
        </>
      );
    }
    const project = projectFor(win.id);
    return project ? <ProjectDetails project={project} /> : null;
  };

  return (
    <>
      <div className={`desktop ${dragging ? "is-dragging" : ""}`} style={{ height: bounds.h }}>
        <ul className="desktop-icons" aria-label="Desktop">
          {icons.map((item) => {
            const inner = (
              <>
                <span className="tile h-12 w-12 rounded-[10px]" style={{ backgroundColor: item.color }}>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="desktop-icon-label">{item.label}</span>
              </>
            );
            return (
              <li key={item.label}>
                {item.href ? (
                  <a
                    className="desktop-icon"
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    {inner}
                  </a>
                ) : (
                  <button type="button" className="desktop-icon" onClick={item.onClick}>
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className="win7">
          {wins.map((win) => (
            <DesktopWindow
              key={win.id}
              win={win}
              active={activeId === win.id}
              bounds={bounds}
              onFocus={() => {
                if (activeId !== win.id) focus(win.id);
              }}
              onChange={(rect) => move(win.id, rect)}
              onMinimize={() => minimize(win.id)}
              onToggleMaximize={() => toggleMaximize(win.id)}
              onClose={() => close(win.id)}
              onDragging={setDragging}
            >
              {renderContent(win)}
            </DesktopWindow>
          ))}
        </div>
      </div>

      <Taskbar
        windows={wins}
        activeId={activeId}
        onItem={onTaskbarItem}
        onSignOut={onSignOut}
      />
    </>
  );
}

export default Desktop;
