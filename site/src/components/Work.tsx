import { useState, useRef, useEffect } from "react";
import { MessagesSquare } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  typing?: boolean;
}

type VideoState = "enter" | "idle" | "handsup" | "typing" | "handsdown";

function Work() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoState, setVideoState] = useState<VideoState>("idle");
  const [hasEntered, setHasEntered] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Separate video refs for each state
  const videoRefs = useRef<{ [key in VideoState]?: HTMLVideoElement }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Typewriter state
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState("");
  const [showResume, setShowResume] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [videoPush, setVideoPush] = useState(false);

  // Auto-scroll to bottom when messages change

  // Custom cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
      video.className = "w-full h-full object-cover absolute top-0 left-0";
      video.style.display = "none";

      if (state === "idle" || state === "typing") {
        video.loop = true;
      }

      videoRefs.current[state] = video;

      if (containerRef.current) {
        containerRef.current.appendChild(video);
      }
    });

    // Start with idle visible
    if (videoRefs.current.idle) {
      videoRefs.current.idle.style.display = "block";
      videoRefs.current.idle.play();
    }

    return () => {
      Object.values(videoRefs.current).forEach((video) => {
        video?.remove();
      });
    };
  }, []);

  // Handle scroll to trigger "enter" video
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasEntered) {
          setVideoState("enter");
          setHasEntered(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasEntered]);

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

    // Show and play current video
    currentVideo.style.display = "block";
    currentVideo.currentTime = 0;
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
  }, [videoState]);

  // Typewriter effect for GPT responses
  useEffect(() => {
    if (!isTyping || !currentTypingMessage) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < currentTypingMessage.length) {
        setDisplayedContent(currentTypingMessage.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        setVideoState("handsdown");
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isTyping, currentTypingMessage]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    // Trigger video push animation
    setVideoPush(true);
    setTimeout(() => setVideoPush(false), 300);

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: textToSend }),
      });

      const data = await response.json();

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
        role: "assistant",
        content: "Sorry, something went wrong. Try again?",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setVideoState("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    { label: "About Me", prompt: "Tell me about yourself and your background" },
    {
      label: "Resume",
      prompt: "Can you show me your resume?",
      action: () => setShowResume(true),
    },
    { label: "Work", prompt: "What's your professional experience?" },
    { label: "Hobbies", prompt: "What do you do for fun?" },
    { label: "Skills", prompt: "What are your technical skills?" },
  ];

  return (
    <section id="work" ref={sectionRef} className="min-h-screen p-8 space-y-16">
      {/* Custom Cursor Highlight */}
      {isHovering && (
        <div
          className="fixed pointer-events-none z-50 mix-blend-screen"
          style={{
            left: cursorPos.x - 20,
            top: cursorPos.y - 20,
            width: "40px",
            height: "40px",
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-xl animate-pulse" />
        </div>
      )}

      {/* Resume Modal */}
      {showResume && (
        <div
          className="fixed top-0 left-0 z-[9999] w-screen h-[100dvh] flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden"
          onClick={() => setShowResume(false)}
        >
          <div
            className="relative w-[90vw] h-[90vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowResume(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2"
            ></button>
            <iframe
              src="/Bankovitch_Resume.pdf"
              title="Resume"
              className="w-full h-full rounded-lg shadow-2xl bg-white"
            />
          </div>
        </div>
      )}

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
        style={{ height: "calc(100vh - 12rem)" }}
      >
        {/* Left side - Full Album Mosaic Video */}
        <div className="flex flex-col justify-center h-full">
          {/* Online Status Badge - Above Video */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-full px-5 py-3 border border-white/20 shadow-2xl">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-white font-semibold text-sm tracking-wide">
                Dominic Bankovitch is Online
              </span>
            </div>
          </div>

          <div
            ref={containerRef}
            className={`group relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10 ${
              videoPush ? "scale-[0.98]" : "scale-100"
            }`}
            style={{ height: "65vh" }}
          >
            {/* Media */}
            <div className="absolute inset-0 pointer-events-none">
              {/* video / canvas appended here */}
            </div>

            {/* Hover hint */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div
                className="absolute bottom-4 right-4 text-xs text-white/60 bg-black/40 backdrop-blur px-3 py-1 rounded-full
          opacity-0 translate-y-2
          group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-300 ease-out"
              >
                Look closely: it’s all album art!
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Liquid Glass Chat */}
        <div className="h-full flex flex-col">
          <div className="mb-8">
            <h2 className="text-5xl font-bold mb-4 text-white tracking-tight">
              Let's Talk
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              Ask me anything about my projects, experience, or interests!
            </p>
          </div>

          {/* Liquid Glass Chat Container - Fixed Height */}
          <div
            className="rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl bg-white/5 border border-white/10"
            style={{
              height: "600px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Messages Area - Scrollable */}
            <div
              className="p-6 space-y-4"
              style={{
                flex: "1 1 auto",
                overflowY: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <style>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-gray-500 text-center space-y-2">
                    <div className="flex justify-center mb-4">
                      <MessagesSquare className="w-14 h-14 text-blue-400" />
                    </div>
                    <p className="text-lg">Start a conversation...</p>
                    <p className="text-sm text-gray-600">
                      I'm here to answer your questions
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isLastMessage = idx === messages.length - 1;
                const showTyping =
                  msg.role === "assistant" &&
                  msg.typing &&
                  isLastMessage &&
                  isTyping;

                return (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    } animate-in fade-in slide-in-from-bottom-4 duration-300`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-lg ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                          : "bg-white/10 text-gray-100 backdrop-blur-sm border border-white/10"
                      }`}
                    >
                      {showTyping ? (
                        <>
                          {displayedContent}
                          <span className="ml-1 text-blue-400">▍</span>
                        </>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && !isTyping && (
                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 text-gray-100 rounded-2xl px-5 py-3 text-sm">
                    <span className="inline-flex items-center gap-1">
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      >
                        ●
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      >
                        ●
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      >
                        ●
                      </span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Buttons - Fixed */}
            <div
              className="border-t border-white/10 bg-black/20 backdrop-blur-md px-4 py-3"
              style={{ flex: "0 0 auto" }}
            >
              <div className="flex flex-wrap gap-2 justify-center">
                {quickPrompts.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else {
                        sendMessage(item.prompt);
                      }
                    }}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    disabled={loading}
                    className="px-4 py-2 text-xs font-medium text-gray-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm transform active:scale-95"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area - Fixed */}
            <div
              className="border-t border-white/10 bg-black/20 backdrop-blur-md p-4"
              style={{ flex: "0 0 auto" }}
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent placeholder-gray-500 backdrop-blur-sm transition-all hover:bg-white/10"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-full px-8 py-3 text-sm font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:transform-none"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Work;
