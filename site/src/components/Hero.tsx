import { useEffect, useState } from "react";

const PHRASES = [
  "UC Berkeley Data Science & Computer Science student",
  "Software Engineer",
  "Triathlete",
  "Eagle Scout",
  "Turning ideas into production code",
  "Collects records, not just datasets",
  "Thinks better with headphones on",
];

function Hero() {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = PHRASES[phraseIndex];

    let timeout: number;

    if (!deleting && charIndex < currentPhrase.length) {
      timeout = window.setTimeout(() => {
        setText(currentPhrase.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, 80);
    } else if (!deleting && charIndex === currentPhrase.length) {
      timeout = window.setTimeout(() => {
        setDeleting(true);
      }, 1200);
    } else if (deleting && charIndex > 0) {
      timeout = window.setTimeout(() => {
        setText(currentPhrase.slice(0, charIndex - 1));
        setCharIndex((c) => c - 1);
      }, 50);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % PHRASES.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex]);

  const scrollToWork = () => {
    const target = document.getElementById("work");
    if (!target) return;

    const start = window.scrollY;
    const end = target.offsetTop;
    const duration = 1400;
    const startTime = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const ease =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      window.scrollTo(0, start + (end - start) * ease);

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  return (
    <section className="min-h-screen flex flex-col justify-center px-12">
      <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
        Dominic Bankovitch
      </h1>

      <p className="mt-6 text-2xl text-gray-400 h-8">
        {text}
        <span className="ml-1 animate-pulse">▍</span>
      </p>

      <button
        onClick={scrollToWork}
        className="mt-14 w-fit text-lg text-gray-300 hover:text-white transition border border-gray-700 px-6 py-3 rounded-full"
      >
        Lets Talk ↓
      </button>
    </section>
  );
}

export default Hero;
