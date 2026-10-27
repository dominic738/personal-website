import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Github, Linkedin, Mail } from "lucide-react";
import { PHONE } from "./projects";

export type Contact = {
  icon: LucideIcon;
  color: string;
  name: string;
  detail: string;
  href: string;
};

export const CONTACTS: Contact[] = [
  {
    icon: Linkedin,
    color: "#0a66c2",
    name: "LinkedIn",
    detail: "in/dominic-bankovitch",
    href: "https://www.linkedin.com/in/dominic-bankovitch/",
  },
  {
    icon: Github,
    color: "#24292f",
    name: "GitHub",
    detail: "dominic738",
    href: "https://github.com/dominic738",
  },
  {
    icon: Mail,
    color: "#1a5fa3",
    name: "Email",
    detail: "dbankovitch@berkeley.edu",
    href: "mailto:dbankovitch@berkeley.edu",
  },
];

export function usePhoneCopy() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(PHONE);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return { copied, copy };
}
