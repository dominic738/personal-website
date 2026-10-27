import type { LucideIcon } from "lucide-react";
import { Compass, Images, Map as MapIcon, MessagesSquare } from "lucide-react";

export type Project = {
  slug: string;
  title: string;
  where: string;
  description: string;
  path: string;
  tech: string[];
  color: string;
  icon: LucideIcon;
  link: string;
  linkLabel: string;
  // Screenshot in site/public/projects/. Falls back to the project's tile when missing.
  image: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "musical-compass",
    title: "The Musical Compass",
    where: "Live site",
    description:
      "Maps songs and playlists onto semantic axes using language embeddings to explore musical mood and meaning.",
    path: "songs → SBERT embeddings → semantic mood axes",
    tech: ["Python", "SBERT", "Generative AI", "Linear Algebra"],
    color: "#4b52c8",
    icon: Compass,
    link: "https://mymusicalcompass.com/",
    linkLabel: "Visit the site",
    image: "/projects/musical-compass.png",
  },
  {
    slug: "album-mosaic",
    title: "The Musical Mosaic",
    where: "Live site",
    description:
      "A web app that rebuilds your webcam live out of album covers, from my 2,184-album Good Songs playlist or your own Spotify library. Every tile is matched in LAB color space, and you can take a four-pose photo strip. Your video never leaves the browser.",
    path: "webcam → LAB color matching → live album-cover mosaic",
    tech: ["JavaScript", "Canvas", "Color Science", "Spotify API"],
    color: "#cf4a24",
    icon: Images,
    link: "https://dominic738.github.io/the-musical-mosaic/",
    linkLabel: "Try it live",
    image: "/projects/album-mosaic.png",
  },
  {
    slug: "make-your-own-world",
    title: "Make Your Own World",
    where: "GitHub",
    description:
      "Procedurally generated tile-based world with deterministic seeds, persistence, and interactive gameplay mechanics.",
    path: "seed → procedural generation → persistent tile world",
    tech: ["Java", "Algorithms", "Object-Oriented Programming"],
    color: "#1683bd",
    icon: MapIcon,
    link: "https://github.com/Berkeley-CS61B-Student/fa25-proj5c-new-g263",
    linkLabel: "View the code",
    image: "/projects/make-your-own-world.png",
  },
  {
    slug: "ai-chatbot",
    title: "Personal AI Chatbot",
    where: "You're talking to it",
    description:
      "A personalized conversational system designed to reflect voice, memory, and long-term context.",
    path: "memories → RAG on Pinecone → replies in my voice",
    tech: ["React", "LLMs", "Prompt Engineering", "RAG", "Pinecone"],
    color: "#2f9a3c",
    icon: MessagesSquare,
    link: "https://github.com/dominic738/domchat",
    linkLabel: "View the code",
    image: "/projects/ai-chatbot.png",
  },
];

export const PROFILE_PHOTO = "/profile.jpg";

export const PERSONAL_MESSAGE =
  "Studying data science at Berkeley. I build fun projects with ML, race triathlon, and collect records.";

// Shown as "Listening to: …" on the sign-in screen. Leave empty to hide the line.
export const NOW_PLAYING = "";

export const PHONE = "+14156403302";
