# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
A broad mix of visitors who find Dominic Bankovitch: recruiters and hiring managers (often arriving from a resume or LinkedIn link), technical peers and collaborators, and friends or curious strangers. They usually want to know quickly who Dominic is and what Dominic builds, and the site should feel fun and playful to spend time on, not just a credentials page.

## Product Purpose
Dominic's personal website: a single page that introduces Dominic and lets visitors get to know Dominic through conversation. Success means a visitor does at least one of these:
1. Talks to the AI chatbot (the primary interaction).
2. Views the resume (`site/public/Bankovitch_Resume.pdf`).
3. Explores the projects (outbound links to live sites and GitHub repos).

## Positioning
Instead of a static bio, visitors talk with a personal AI chatbot that answers in Dominic's voice and memory. It sits beside a video avatar of Dominic made entirely of album artwork, built with Dominic's own Musical Mosaic project, which reacts to the conversation. The site is itself a demonstration of Dominic's work in ML/RAG and color science.

## Operating Context
- Single-page React 19 + TypeScript + Vite + Tailwind v4 app in `site/`.
- The chat POSTs `{question}` to `${VITE_API_BASE}/chat` and receives `{answer}` (a RAG backend with Pinecone, in a separate repo, `domchat`).
- On load, the page POSTs `/visit` and GETs `/stats`, which returns conversations, messages and total_tokens.
- The avatar is a state machine of five video clips (`enter`, `idle`, `handsup`, `typing`, `handsdown`) in `site/public/videos/`, driven by chat state.

## Capabilities and Constraints
Must stay as part of the identity:
- **AI chatbot**: free-text input, quick-prompt chips (About Me, Resume, Work, Hobbies, Skills), and the resume opening in a modal.
- **Album-art video avatar**: including the reveal that "it's all album art".
- **Live stats counters**: conversations, questions answered, tokens processed, memories indexed. Memories indexed is currently hardcoded at 217.

The typewriter hero phrases are not a required part of the identity. The facts in them are real and may be reused: UC Berkeley Data Science & Computer Science student, software engineer, triathlete, Eagle Scout, record collector, "thinks better with headphones on".

The video files are large (the clips in use total about 46 MB), so performance on load is a real constraint.

## Brand Commitments
- Name: Dominic Bankovitch.
- Voice: friendly, first-person, with some fun to it. Dominic rejected a cartoonish, collage-style direction as "way too playful", so the fun should be in the details, not in the whole page.
- Visual constraint (pinned by Dominic): the Y2K / Frutiger Aero aesthetic.
- Things the site must not feel like: corporate or LinkedIn-style, the current dark-mode tech template, or minimal and empty.
- Personal motifs drawn from real facts: music and vinyl records, album art, triathlon.

## Evidence on Hand
- Projects (real; links in `site/src/components/Footer.tsx`):
  - The Musical Compass: https://mymusicalcompass.com/
  - The Musical Mosaic: https://dominic738.github.io/the-musical-mosaic/
  - Make Your Own World (CS61B)
  - Personal AI Chatbot: https://github.com/dominic738/domchat
- Resume PDF, a portrait (`site/public/me.png`) and the avatar videos.
- Contact: LinkedIn (dominic-bankovitch), GitHub (dominic738), email dbankovitch@berkeley.edu, phone (copy to clipboard), San Francisco, CA.
- Live usage stats from the API.
- There are no testimonials, employers' logos or press. Do not fabricate any.

## Product Principles
1. Conversation over brochure: the chatbot is the front door, and everything else supports it.
2. Show the work by being the work: the avatar and chatbot are themselves projects, so let them speak.
3. Playful but legible: personality should never cost a recruiter a fast scan of who Dominic is or a path to the resume.
4. Real numbers only: stats and claims come from live data or confirmed facts.
