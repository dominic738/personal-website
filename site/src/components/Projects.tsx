import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { PROJECTS } from "../projects";
import type { Project } from "../projects";

// Screenshot of a project, or its glossy tile until a screenshot is added
export function ProjectShot({ project, large = false }: { project: Project; large?: boolean }) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <div
        className="project-shot is-placeholder"
        style={{ backgroundColor: project.color }}
        role="img"
        aria-label={`${project.title} (screenshot coming soon)`}
      >
        <span className={`tile ${large ? "h-24 w-24 rounded-2xl" : "h-14 w-14"}`} style={{ backgroundColor: project.color }}>
          <project.icon className={large ? "h-11 w-11" : "h-7 w-7"} aria-hidden="true" />
        </span>
      </div>
    );
  }

  return (
    <img
      className="project-shot"
      src={project.image}
      alt={`Screenshot of ${project.title}`}
      onError={() => setMissing(true)}
    />
  );
}

// Explorer-style list of projects; each opens in its own viewer
export function ProjectsExplorer({ onOpen }: { onOpen: (slug: string) => void }) {
  return (
    <div className="msn-body min-h-0 flex-1">
      <div className="msn-band px-4 py-3">
        <h2 className="text-xl font-light text-[var(--ink)]">Things I've built</h2>
        <p className="text-sm text-[var(--ink-soft)]">Open one for screenshots and details.</p>
      </div>
      <ul className="has-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
        {PROJECTS.map((project) => (
          <li key={project.slug} className="explorer-entry">
            <button type="button" className="explorer-item" onClick={() => onOpen(project.slug)}>
              <ProjectShot project={project} />
              <span className="mt-2 block font-semibold text-[var(--ink)]">{project.title}</span>
              <span className="block text-sm text-[var(--ink-muted)]">{project.where}</span>
            </button>
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="explorer-link"
            >
              {project.linkLabel}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Full project write-up: big screenshot, how it works, and where it lives
export function ProjectDetails({ project }: { project: Project }) {
  return (
    <div className="msn-body min-h-0 flex-1">
      <div className="project-commandbar">
        <a href={project.link} target="_blank" rel="noreferrer">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          {project.linkLabel}
        </a>
        <span className="truncate text-[13px] text-[var(--ink-muted)]">
          {project.link.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </span>
      </div>
      <div className="has-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="project-hero">
          <ProjectShot project={project} large />
        </div>
        <div className="grid gap-x-10 gap-y-6 px-6 py-6 md:grid-cols-[1fr_240px]">
          <div>
            <h2 className="text-3xl font-light tracking-[-0.01em] text-[var(--ink)]">
              {project.title}
            </h2>
            <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-[#2b3d4f]">
              {project.description}
            </p>
            <p className="mt-5 text-sm font-semibold text-[var(--ink)]">How it works</p>
            <p className="mt-1 text-base text-[var(--link)]">{project.path}</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-[var(--ink)]">Built with</p>
            <ul className="mt-1 space-y-0.5 text-[var(--ink-soft)]">
              {project.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="aero-cta mt-5 !px-4 !py-2.5 !text-[15px]"
            >
              {project.linkLabel}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Phones: every project written out in full, one after another
export function ProjectsStacked() {
  return (
    <div className="msn-body">
      {PROJECTS.map((project) => (
        <article key={project.slug} className="border-b border-[#e3ecf4] last:border-b-0">
          <ProjectShot project={project} />
          <div className="px-4 py-4">
            <h3 className="text-xl font-semibold text-[var(--ink)]">
              {project.title}{" "}
              <span className="text-base font-normal text-[var(--ink-muted)]">
                ({project.where})
              </span>
            </h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-[#2b3d4f]">
              {project.description}
            </p>
            <p className="mt-2 text-sm text-[var(--link)]">{project.path}</p>
            <p className="mt-1 text-[13px] text-[var(--ink-muted)]">{project.tech.join(" · ")}</p>
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[var(--link)] underline underline-offset-4"
            >
              {project.linkLabel}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
