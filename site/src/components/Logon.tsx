import { useState } from "react";
import { ArrowRight, Music, UserRound } from "lucide-react";
import { NOW_PLAYING, PERSONAL_MESSAGE, PROFILE_PHOTO } from "../projects";

interface LogonProps {
  // "overlay" covers the desktop until sign-in; "section" is the first screen on phones
  variant: "overlay" | "section";
  onStart: () => void;
  onOpenResume: () => void;
}

// Win7-style sign-in screen: who Dominic is, then one way in
function Logon({ variant, onStart, onOpenResume }: LogonProps) {
  const [photoMissing, setPhotoMissing] = useState(false);
  const [welcoming, setWelcoming] = useState(false);

  const start = () => {
    if (variant === "section") {
      onStart();
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      onStart();
      return;
    }
    setWelcoming(true);
    window.setTimeout(onStart, 900);
  };

  return (
    <section
      id="profile"
      aria-label="Dominic Bankovitch"
      className={`logon ${variant === "overlay" ? "is-overlay" : ""} ${welcoming ? "is-welcoming" : ""}`}
    >
      <div className="flex w-full max-w-3xl flex-col items-center px-6 text-center">
        <div className="user-tile">
          {photoMissing ? (
            <div className="user-tile-blank">
              <UserRound className="h-1/2 w-1/2" aria-hidden="true" />
            </div>
          ) : (
            <img
              src={PROFILE_PHOTO}
              alt="Dominic Bankovitch"
              onError={() => setPhotoMissing(true)}
            />
          )}
        </div>

        <h1 className="logon-name mt-7">Dominic Bankovitch</h1>

        {welcoming ? (
          <p className="logon-welcome mt-6" role="status">
            <span className="logon-spinner" aria-hidden="true" />
            Welcome
          </p>
        ) : (
          <>
            <p className="logon-text mt-3 flex items-center justify-center gap-2.5 text-lg">
              <span className="orb" aria-hidden="true" />
              Online · San Francisco, CA
            </p>
            <p className="logon-text mt-2 max-w-[48ch] text-xl leading-snug text-balance italic">
              {PERSONAL_MESSAGE}
            </p>
            {NOW_PLAYING && (
              <p className="logon-text mt-2 flex items-center justify-center gap-2 text-base">
                <Music className="h-4 w-4" aria-hidden="true" />
                Listening to: {NOW_PLAYING}
              </p>
            )}

            <button type="button" className="aero-cta mt-9" onClick={start}>
              Start a conversation
              <span className="logon-arrow" aria-hidden="true">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
            <button type="button" className="logon-link mt-5" onClick={onOpenResume}>
              Or view my resume
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default Logon;
