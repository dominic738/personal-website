import { useState, useRef, useEffect } from "react";
import type { RefObject } from "react";
import type { LucideIcon } from "lucide-react";
import { Bike, BriefcaseBusiness, Code, FileText, UserRound } from "lucide-react";
import { PROFILE_PHOTO } from "../projects";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  typing?: boolean;
  error?: boolean;
}

type VideoState = "enter" | "idle" | "handsup" | "typing" | "handsdown";

type ToastState = "hidden" | "shown" | "leaving";

const QUICK_PROMPTS: {
  label: string;
  hint: string;
  icon: LucideIcon;
  prompt?: string;
  opensResume?: boolean;
}[] = [
  {
    label: "About me",
    hint: "My background and what I'm into",
    icon: UserRound,
    prompt: "Tell me about yourself and your background",
  },
  { label: "Resume", hint: "Opens my resume", icon: FileText, opensResume: true },
  {
    label: "Work",
    hint: "My professional experience",
    icon: BriefcaseBusiness,
    prompt: "What's your professional experience?",
  },
  { label: "Hobbies", hint: "What I do for fun", icon: Bike, prompt: "What do you do for fun?" },
  {
    label: "Skills",
    hint: "My technical skills",
    icon: Code,
    prompt: "What are your technical skills?",
  },
];

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

interface ConversationProps {
  // Plays the "enter" clip and the sign-in toast the first time this turns true
  active: boolean;
  layout: "desktop" | "stacked";
  onOpenResume: () => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}

function Conversation({ active, layout, onOpenResume, inputRef }: ConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoState, setVideoState] = useState<VideoState>("idle");
  const [hasEntered, setHasEntered] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [lastReceivedAt, setLastReceivedAt] = useState<Date | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [videoSize, setVideoSize] = useState(420);

  const [toast, setToast] = useState<ToastState>("hidden");

  const scrollRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  // Separate video refs for each state
  const videoRefs = useRef<{ [key in VideoState]?: HTMLVideoElement }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Typewriter state
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState("");

  // On the desktop, the video takes as much of the window as the chat column leaves it
  useEffect(() => {
    if (layout !== "desktop" || !areaRef.current) return;
    const area = areaRef.current;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const byHeight = (height - 76) * 0.85;
      const byWidth = (width - 400 - 48) * 0.85;
      setVideoSize(Math.max(200, Math.floor(Math.min(byHeight, byWidth))));
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, [layout]);

  // Preload all videos
  useEffect(() => {
    const states: VideoState[] = [
      "enter",
      "idle",
      "handsup",
      "typing",
      "handsdown",
    ];

    states.forEach((state) => {
      const video = document.createElement("video");
      video.src = `/videos/${state}.mp4`;
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.className = "absolute inset-0 h-full w-full object-cover";
      video.style.display = "none";

      if (state === "idle" || state === "typing") {
        video.loop = true;
      }

      videoRefs.current[state] = video;

      if (containerRef.current) {
        containerRef.current.appendChild(video);
      }
    });

    const videos = videoRefs.current;

    // Show idle's first frame, paused, until the visitor signs in
    if (videos.idle) {
      videos.idle.style.display = "block";
    }

    return () => {
      Object.values(videos).forEach((video) => {
        video?.remove();
      });
    };
  }, []);

  // First time the conversation is on screen: play "enter" and show the sign-in toast
  useEffect(() => {
    if (!active || hasEntered || !rootRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVideoState("enter");
          setHasEntered(true);
          setToast("shown");
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [active, hasEntered]);

  // Dismiss the sign-in toast after a few seconds
  useEffect(() => {
    if (toast !== "shown") return;
    const leave = window.setTimeout(() => setToast("leaving"), 6500);
    return () => clearTimeout(leave);
  }, [toast]);

  useEffect(() => {
    if (toast !== "leaving") return;
    const hide = window.setTimeout(() => setToast("hidden"), 400);
    return () => clearTimeout(hide);
  }, [toast]);

  // Switch videos when state changes
  useEffect(() => {
    const currentVideo = videoRefs.current[videoState];
    if (!currentVideo) return;

    // Hide all videos
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.style.display = "none";
        video.pause();
      }
    });

    // Show the current video; nothing plays until sign-in starts the "enter" clip
    currentVideo.style.display = "block";
    currentVideo.currentTime = 0;
    if (!hasEntered) return;
    currentVideo.play().catch(console.error);

    // Handle video end for non-looping videos
    const handleVideoEnd = () => {
      if (videoState === "enter") {
        setVideoState("idle");
      } else if (videoState === "handsup") {
        setVideoState("typing");
      } else if (videoState === "handsdown") {
        setVideoState("idle");
      }
    };

    if (!currentVideo.loop) {
      currentVideo.addEventListener("ended", handleVideoEnd);
      return () => currentVideo.removeEventListener("ended", handleVideoEnd);
    }
  }, [videoState, hasEntered]);

  // Typewriter effect for responses
  useEffect(() => {
    if (!isTyping || !currentTypingMessage) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < currentTypingMessage.length) {
        setDisplayedContent(currentTypingMessage.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        setActivePrompt(null);
        setLastReceivedAt(new Date());
        setAnnouncement(`Dominic says: ${currentTypingMessage}`);
        setVideoState("handsdown");
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isTyping, currentTypingMessage]);

  const sendMessage = async (messageText?: string, promptLabel?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading || isTyping) return;

    setActivePrompt(promptLabel ?? null);

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE;
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: textToSend }),
      });

      if (!response.ok) throw new Error(`Chat request failed: ${response.status}`);
      const data = await response.json();
      if (typeof data.answer !== "string" || !data.answer.trim()) {
        throw new Error("Chat response had no answer");
      }

      // Trigger handsup video
      setVideoState("handsup");

      // Wait for handsup to finish, then start typing
      setTimeout(() => {
        setCurrentTypingMessage(data.answer);
        setDisplayedContent("");
        setIsTyping(true);

        const assistantMessage: Message = {
          role: "assistant",
          content: data.answer,
          typing: true,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "system",
        content: `This message could not be delivered: “${textToSend}”. Check your connection and send it again.`,
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setActivePrompt(null);
      setVideoState("idle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      // Scroll only the log, never the page
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, displayedContent, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const runPrompt = (item: (typeof QUICK_PROMPTS)[number]) => {
    if (item.opensResume) {
      onOpenResume();
    } else if (item.prompt) {
      sendMessage(item.prompt, item.label);
    }
  };

  const busy = loading || isTyping;

  const statusText = busy
    ? "Dominic is typing a message…"
    : lastReceivedAt
      ? `Last message received at ${formatTime(lastReceivedAt)}.`
      : "Press Enter to send. Shift + Enter starts a new line.";

  // Group consecutive messages from the same sender under one "says:" line
  const renderMessages = () =>
    messages.map((msg, idx) => {
      const isLastMessage = idx === messages.length - 1;
      const showTyping =
        msg.role === "assistant" && msg.typing && isLastMessage && isTyping;

      if (msg.role === "system") {
        return (
          <p key={idx} className={`msn-system ${msg.error ? "is-error" : ""}`}>
            {msg.content}
          </p>
        );
      }

      const previous = messages[idx - 1];
      const newSender = !previous || previous.role !== msg.role;

      return (
        <div key={idx}>
          {newSender && (
            <p className="msn-sender">
              {msg.role === "user" ? "You say:" : "Dominic says:"}
            </p>
          )}
          <p className="msn-line">
            {showTyping ? (
              <>
                {displayedContent}
                <span className="msn-caret" aria-hidden="true" />
              </>
            ) : (
              msg.content
            )}
          </p>
        </div>
      );
    });

  const desktop = layout === "desktop";

  return (
    <div ref={rootRef} className="flex min-h-0 flex-1 flex-col">
      <div className="msn-body min-h-0 flex-1">
        <nav className="msn-toolbar" aria-label="Conversation topics">
          <span className="msn-toolbar-label" aria-hidden="true">
            Ask me about
          </span>
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={activePrompt === item.label}
              disabled={!item.opensResume && busy}
              onClick={() => runPrompt(item)}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        <div
          ref={areaRef}
          className={desktop ? "flex min-h-0 flex-1" : "flex flex-col"}
        >
          {/* Display picture */}
          <aside
            className={`msn-band flex shrink-0 flex-col items-center justify-center gap-3 px-6 py-5 ${
              desktop ? "border-r border-[var(--band-line)]" : "border-b border-[var(--band-line)]"
            }`}
          >
            <div
              className="dp w-full"
              style={desktop ? { width: videoSize } : { maxWidth: 560 }}
            >
              <div ref={containerRef} className="dp-inner aspect-square" />
            </div>
            <p className="text-sm text-[var(--ink-soft)]">Look closely: it's all album art.</p>
          </aside>

          {/* Conversation */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="msn-band px-5 py-3">
              <p className="flex items-center gap-2 text-lg">
                <span className="orb" aria-hidden="true" />
                <span className="font-semibold">Dominic Bankovitch</span>
                <span className="text-[var(--ink-muted)]">(Online)</span>
              </p>
              <p className="mt-0.5 text-sm text-[var(--ink-soft)]">
                Ask me anything about my projects, experience, or interests.
              </p>
            </header>

            <div
              ref={scrollRef}
              className={`msn-scroll msn-log has-scrollbar overflow-y-auto px-5 py-4 ${
                desktop ? "min-h-0 flex-1" : "h-[56svh] min-h-[300px]"
              }`}
            >
              {messages.length === 0 && !loading && (
                <div>
                  <p className="msn-system">
                    Dominic Bankovitch is Online. Pick a topic to start, or type your own
                    question below.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {QUICK_PROMPTS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        className="msn-starter"
                        onClick={() => runPrompt(item)}
                      >
                        <span className="msn-starter-icon">
                          <item.icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-[var(--ink)]">
                            {item.label}
                          </span>
                          <span className="block text-[13px] text-[var(--ink-soft)]">
                            {item.hint}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {renderMessages()}
            </div>

            <div className="border-t border-[var(--band-line)] bg-[#f3f8fc] p-3">
              <div className="flex items-end gap-3">
                <div className="msn-compose min-w-0 flex-1">
                  <label htmlFor={`chat-input-${layout}`} className="sr-only">
                    Message Dominic
                  </label>
                  <textarea
                    id={`chat-input-${layout}`}
                    ref={inputRef}
                    className="has-scrollbar"
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything…"
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  className="msn-send"
                  onClick={() => sendMessage()}
                  disabled={busy || !input.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <p className="status-bar-field">{statusText}</p>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {toast !== "hidden" && (
        <div className={`msn-toast ${toast === "leaving" ? "is-leaving" : ""}`} role="status">
          <button
            type="button"
            className="msn-toast-button"
            onClick={() => {
              setToast("leaving");
              inputRef.current?.focus({ preventScroll: true });
            }}
          >
            <div className="dp w-14 shrink-0 p-1">
              <div className="dp-inner aspect-square">
                <img src={PROFILE_PHOTO} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
            <span className="text-sm leading-snug text-[var(--ink)]">
              <strong className="font-semibold">Dominic Bankovitch</strong> has just
              signed in.
              <span className="mt-0.5 block text-[var(--link)] underline underline-offset-2">
                Say hi
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Conversation;
