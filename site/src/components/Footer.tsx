import { useState, useEffect } from "react";
import {
  MessageCircle,
  Zap,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  FileQuestionMark,
  Database,
} from "lucide-react";

const WebsiteComponents = () => {
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [stats, setStats] = useState<Stats>({
    conversations: 0,
    messages: 0,
    total_tokens: 0,
    memories_indexed: 0,
  });

  type Stats = {
    conversations: number;
    messages: number;
    total_tokens: number;
    memories_indexed: number;
  };

  const animateStat = (key: keyof Stats, target: number, duration = 2000) => {
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const stepDuration = duration / steps;

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setStats((prev) => ({ ...prev, [key]: Math.floor(current) }));
    }, stepDuration);
  };

  useEffect(() => {
    // Count the visit
    fetch("http://localhost:8000/visit", {
      method: "POST",
      credentials: "include",
    }).catch((err) => console.error("Failed to count visit:", err));

    // Fetch real stats from API
    fetch("http://localhost:8000/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations)
          animateStat("conversations", data.conversations, 2000);
        if (data.messages) animateStat("messages", data.messages, 2000);
        if (data.total_tokens)
          animateStat("total_tokens", data.total_tokens, 2000);
      })
      .catch((err) => console.error("Failed to fetch stats:", err));

    // Animate static stats
    animateStat("memories_indexed", 217, 1500);
  }, []);

  const projects = [
    {
      title: "The Musical Compass",
      description:
        "Maps songs and playlists onto semantic axes using language embeddings to explore musical mood and meaning.",
      tech: ["Python", "SBERT", "Generative AI", "Linear Algebra"],
      gradient: "from-indigo-500 to-purple-500",
      link: "https://themusicalcompass.com/",
    },
    {
      title: "Album Mosaic Creator",
      description:
        "Generates a live video mosaic using album artwork matched in LAB color space for perceptual accuracy.",
      tech: ["Python", "OpenCV", "Color Science", "API Integration"],
      gradient: "from-rose-500 to-orange-500",
      link: "https://github.com/dominic738/album-filter",
    },
    {
      title: "Make Your Own World",
      description:
        "Procedurally generated tile-based world with deterministic seeds, persistence, and interactive gameplay mechanics.",
      tech: ["Java", "Algorithms", "Object-Oriented Programming"],
      gradient: "from-sky-500 to-cyan-500",
      link: "https://github.com/Berkeley-CS61B-Student/fa25-proj5c-new-g263",
    },
    {
      title: "Personal AI Chatbot",
      description:
        "A personalized conversational system designed to reflect voice, memory, and long-term context.",
      tech: ["React", "LLMs", "Prompt Engineering", "RAG", "Pinecone"],
      gradient: "from-green-500 to-emerald-500",
      link: "https://github.com/dominic738/domchat",
    },
  ];

  const statItems = [
    {
      icon: MessageCircle,
      label: "Conversations Had",
      value: stats.conversations,
      color: "text-blue-400",
    },
    {
      icon: FileQuestionMark,
      label: "Questions Answered",
      value: stats.messages,
      color: "text-purple-400",
    },
    {
      icon: Zap,
      label: "Tokens Processed",
      value: stats.total_tokens,
      color: "text-amber-400",
    },
    {
      icon: Database,
      label: "Memories Indexed",
      value: stats.memories_indexed,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="min-h-screen p-8 space-y-16">
      {/* Live Stats Section */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-8 text-center">
          Live Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((stat, idx) => (
            <div
              key={idx}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gray-900/50"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-8 text-center">
          Featured Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              ></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                    {project.title}
                  </h3>
                  <a href={project.link}>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                  </a>
                </div>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech, techIdx) => (
                    <span
                      key={techIdx}
                      className="px-3 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300 border border-gray-600/50"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Footer */}
      <footer className="max-w-6xl mx-auto border-t border-gray-700/50 pt-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-3">Let's Connect</h2>
          <p className="text-gray-400">
            Feel free to reach out through any of these channels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <a
            href="https://www.linkedin.com/in/dominic-bankovitch/"
            className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-blue-500/50 hover:bg-gray-700/50 transition-all duration-300 group"
          >
            <Linkedin className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-xs text-gray-500">LinkedIn</div>
              <div className="text-sm text-gray-300">Connect</div>
            </div>
          </a>

          <a
            href="https://github.com/dominic738"
            className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/50 hover:bg-gray-700/50 transition-all duration-300 group"
          >
            <Github className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-xs text-gray-500">GitHub</div>
              <div className="text-sm text-gray-300">Follow</div>
            </div>
          </a>

          <a
            href="dbankovitch@berkeley.edu"
            className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-green-500/50 hover:bg-gray-700/50 transition-all duration-300 group"
          >
            <Mail className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-xs text-gray-500">Email</div>
              <div className="text-sm text-gray-300">Send</div>
            </div>
          </a>

          <a
            role="button"
            onClick={() => {
              navigator.clipboard.writeText("+14156403302");
              setPhoneCopied(true);
              setTimeout(() => setPhoneCopied(false), 1200);
            }}
            className="cursor-pointer flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-cyan-500/50 hover:bg-gray-700/50 transition-all duration-300 group"
          >
            <Phone className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-xs text-gray-500">Phone</div>
              <div className="text-sm text-gray-300">Copy Number</div>
            </div>

            {phoneCopied && (
              <div className="absolute -top-2 right-3 text-xs bg-cyan-500/90 text-black px-2 py-0.5 rounded-md shadow-lg">
                Copied!
              </div>
            )}
          </a>

          <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <MapPin className="w-6 h-6 text-orange-400" />
            <div className="text-left">
              <div className="text-xs text-gray-500">Location</div>
              <div className="text-sm text-gray-300">San Francisco, CA</div>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p> 2026 - Dominic Bankovitch</p>
        </div>
      </footer>
    </div>
  );
};

export default WebsiteComponents;
