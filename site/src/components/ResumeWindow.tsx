import { useEffect, useRef } from "react";

interface ResumeWindowProps {
  onClose: () => void;
}

const RESUME_URL = "/Bankovitch_Resume.pdf";

function ResumeWindow({ onClose }: ResumeWindowProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0b223980] p-3"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-title"
        className="win7 h-[min(92svh,1100px)] w-[min(980px,100%)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="window active flex h-full flex-col">
          <div className="title-bar active">
            <div id="resume-title" className="title-bar-text">
              Bankovitch_Resume.pdf
            </div>
            <div className="title-bar-controls">
              <button
                aria-label="Close"
                style={{ pointerEvents: "auto" }}
                onClick={onClose}
              ></button>
            </div>
          </div>
          <div className="msn-body min-h-0 flex-1">
            <iframe src={RESUME_URL} title="Dominic Bankovitch's resume" className="h-full w-full" />
          </div>
          <div className="flex items-center justify-end gap-2 px-2 pb-2">
            <a
              href={RESUME_URL}
              target="_blank"
              rel="noreferrer"
              className="mr-auto px-2 text-sm text-[var(--link)] underline underline-offset-2"
            >
              Open in a new tab
            </a>
            <button ref={closeRef} type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeWindow;
