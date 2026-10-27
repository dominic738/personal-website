import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";

export type Rect = { x: number; y: number; w: number; h: number };

export type WinState = Rect & {
  id: string;
  title: string;
  z: number;
  minimized: boolean;
  maximized: boolean;
  restore?: Rect;
};

type Edge = "move" | "e" | "s" | "se" | "w" | "sw";

const MIN_W = 320;
const MIN_H = 220;

interface DesktopWindowProps {
  win: WinState;
  active: boolean;
  bounds: { w: number; h: number };
  onFocus: () => void;
  onChange: (rect: Rect) => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
  onDragging: (dragging: boolean) => void;
  children: ReactNode;
  statusBar?: ReactNode;
}

// A Win7 window that can be dragged by its title bar and resized from its edges
function DesktopWindow({
  win,
  active,
  bounds,
  onFocus,
  onChange,
  onMinimize,
  onToggleMaximize,
  onClose,
  onDragging,
  children,
  statusBar,
}: DesktopWindowProps) {
  const drag = useRef<{ edge: Edge; startX: number; startY: number; rect: Rect } | null>(
    null
  );

  const begin = (edge: Edge) => (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    if (edge === "move" && (e.target as HTMLElement).closest("button")) return;
    if (win.maximized) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      edge,
      startX: e.clientX,
      startY: e.clientY,
      rect: { x: win.x, y: win.y, w: win.w, h: win.h },
    };
    onFocus();
    onDragging(true);
  };

  const move = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    let { x, y, w, h } = d.rect;

    if (d.edge === "move") {
      x = Math.min(Math.max(x + dx, 100 - w), bounds.w - 100);
      y = Math.min(Math.max(y + dy, 0), bounds.h - 32);
    } else {
      if (d.edge.includes("e")) w = Math.max(MIN_W, Math.min(w + dx, bounds.w - x));
      if (d.edge.includes("s")) h = Math.max(MIN_H, Math.min(h + dy, bounds.h - y));
      if (d.edge.includes("w")) {
        const nextW = Math.max(MIN_W, w - dx);
        x = x + (w - nextW);
        w = nextW;
      }
    }
    onChange({ x, y, w, h });
  };

  const end = () => {
    if (!drag.current) return;
    drag.current = null;
    onDragging(false);
  };

  const handlers = (edge: Edge) => ({
    onPointerDown: begin(edge),
    onPointerMove: move,
    onPointerUp: end,
    onPointerCancel: end,
  });

  return (
    <section
      aria-label={win.title}
      className={`window desktop-window ${active ? "active" : ""} ${win.maximized ? "is-maximized" : ""}`}
      style={{
        position: "absolute",
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        zIndex: win.z,
        display: win.minimized ? "none" : "flex",
      }}
      onPointerDownCapture={onFocus}
    >
      <div
        className={`title-bar ${active ? "active" : ""}`}
        onDoubleClick={(e) => {
          if (!(e.target as HTMLElement).closest("button")) onToggleMaximize();
        }}
        {...handlers("move")}
      >
        <div className="title-bar-text">{win.title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button
            aria-label={win.maximized ? "Restore" : "Maximize"}
            onClick={onToggleMaximize}
          ></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>

      <div className="window-content">{children}</div>
      {statusBar}

      {!win.maximized && (
        <>
          <span className="resize-edge is-e" {...handlers("e")} />
          <span className="resize-edge is-w" {...handlers("w")} />
          <span className="resize-edge is-s" {...handlers("s")} />
          <span className="resize-edge is-se" {...handlers("se")} />
          <span className="resize-edge is-sw" {...handlers("sw")} />
        </>
      )}
    </section>
  );
}

// The same window chrome, laid out in the page flow for phones
export function StaticWindow({
  id,
  title,
  children,
  statusBar,
}: {
  id?: string;
  title: string;
  children: ReactNode;
  statusBar?: ReactNode;
}) {
  return (
    <section id={id} aria-label={title} className="window active static-window scroll-mt-3">
      <div className="title-bar active">
        <div className="title-bar-text">{title}</div>
      </div>
      <div className="window-content">{children}</div>
      {statusBar}
    </section>
  );
}

export default DesktopWindow;
