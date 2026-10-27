import { useRef, useState } from "react";
import Wallpaper from "./components/Wallpaper";
import Logon from "./components/Logon";
import Desktop from "./components/Desktop";
import { StaticWindow } from "./components/DesktopWindow";
import Conversation from "./components/Conversation";
import { ProjectsStacked } from "./components/Projects";
import Stats from "./components/Stats";
import { ContactsList } from "./components/Contacts";
import ResumeWindow from "./components/ResumeWindow";
import { useMediaQuery } from "./hooks/useMediaQuery";

const SIGNED_IN_KEY = "signedIn";

const readSignedIn = () => {
  try {
    return sessionStorage.getItem(SIGNED_IN_KEY) === "1";
  } catch {
    return false;
  }
};

function App() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [signedIn, setSignedIn] = useState(readSignedIn);
  const [resumeRequest, setResumeRequest] = useState(0);
  const [showResume, setShowResume] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const signIn = () => {
    setSignedIn(true);
    try {
      sessionStorage.setItem(SIGNED_IN_KEY, "1");
    } catch {
      // Private mode: sign-in just won't be remembered
    }
  };

  const signOut = () => {
    setSignedIn(false);
    try {
      sessionStorage.removeItem(SIGNED_IN_KEY);
    } catch {
      // Nothing stored to clear
    }
  };

  if (isDesktop) {
    return (
      <>
        <Wallpaper />
        <Desktop
          signedIn={signedIn}
          resumeRequest={resumeRequest}
          inputRef={inputRef}
          onSignOut={signOut}
        />
        {!signedIn && (
          <Logon
            variant="overlay"
            onStart={() => {
              signIn();
              window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
            }}
            onOpenResume={() => {
              signIn();
              setResumeRequest((n) => n + 1);
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Wallpaper />
      <Logon
        variant="section"
        onStart={() => {
          document.getElementById("chat")?.scrollIntoView({ block: "start" });
          inputRef.current?.focus({ preventScroll: true });
        }}
        onOpenResume={() => setShowResume(true)}
      />
      <main className="win7 space-y-5 px-3 pb-10">
        <StaticWindow id="chat" title="Dominic Bankovitch - Conversation">
          <Conversation
            active
            layout="stacked"
            onOpenResume={() => setShowResume(true)}
            inputRef={inputRef}
          />
        </StaticWindow>
        <StaticWindow id="projects" title="Projects">
          <ProjectsStacked />
        </StaticWindow>
        <StaticWindow title="What's new">
          <Stats />
        </StaticWindow>
        <StaticWindow
          title="Contacts"
          statusBar={
            <div className="status-bar">
              <p className="status-bar-field">© 2026 Dominic Bankovitch</p>
            </div>
          }
        >
          <ContactsList />
        </StaticWindow>
      </main>
      {showResume && <ResumeWindow onClose={() => setShowResume(false)} />}
    </>
  );
}

export default App;
