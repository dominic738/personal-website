import { useState, useEffect } from "react";

type StatsData = {
  conversations: number;
  messages: number;
  total_tokens: number;
  memories_indexed: number;
};

// Ease-out count so each number visibly rolls to its value
function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const length = reduce ? 0 : duration;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = length ? Math.min((now - start) / length, 1) : 1;
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function StatRow({ label, target, failed }: { label: string; target: number; failed: boolean }) {
  const value = useCountUp(target);
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#e3ecf4] py-2.5 last:border-b-0">
      <dt className="text-[15px] text-[var(--ink-soft)]">{label}</dt>
      <dd className="tabular text-2xl font-light text-[var(--ink)]">
        {target ? value.toLocaleString() : failed ? "–" : "…"}
      </dd>
    </div>
  );
}

// Live numbers from the chatbot's server
function Stats() {
  const API_BASE = import.meta.env.VITE_API_BASE;
  const [failed, setFailed] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    conversations: 0,
    messages: 0,
    total_tokens: 0,
    memories_indexed: 217,
  });

  useEffect(() => {
    // Fetch real stats from API
    fetch(`${API_BASE}/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats((prev) => ({
          ...prev,
          conversations: data.conversations ?? 0,
          messages: data.messages ?? 0,
          total_tokens: data.total_tokens ?? 0,
        }));
      })
      .catch((err) => {
        console.error("Failed to fetch stats:", err);
        setFailed(true);
      });
  }, [API_BASE]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="msn-body min-h-0 flex-1 px-5 py-2">
        <dl>
          <StatRow label="Conversations had" target={stats.conversations} failed={failed} />
          <StatRow label="Questions answered" target={stats.messages} failed={failed} />
          <StatRow label="Tokens processed" target={stats.total_tokens} failed={failed} />
          <StatRow label="Memories indexed" target={stats.memories_indexed} failed={failed} />
        </dl>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">
          {failed ? "Couldn't reach my chatbot's server" : "Live from my chatbot's server"}
        </p>
      </div>
    </div>
  );
}

export default Stats;
