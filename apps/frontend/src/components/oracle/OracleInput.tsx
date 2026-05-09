"use client";

import { FormEvent, useState } from "react";
import { Send, Sparkles } from "lucide-react";

interface OracleInputProps {
  onSubmit: (query: string) => void;
}

const demoQueries = [
  "How is my startup doing?",
  "Should I buy Bitcoin right now?",
  "What's my 5-year vision?",
  "I have 12 tasks due this week",
  "Am I going to make it?",
];

export function OracleInput({ onSubmit }: OracleInputProps) {
  const [query, setQuery] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setQuery("");
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-5 md:pb-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {demoQueries.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSubmit(item)}
              className="shrink-0 border border-[#4a3f28] bg-[#040508]/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#e8e4d9]/70 backdrop-blur transition hover:border-[#c9a84c]/70 hover:text-[#c9a84c]"
            >
              {item}
            </button>
          ))}
        </div>
        <form
          onSubmit={submit}
          className="flex items-center gap-3 border-b border-[#c9a84c]/45 bg-[#040508]/50 px-1 pb-2 backdrop-blur"
        >
          <Sparkles size={18} className="shrink-0 text-[#c9a84c]/80" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask the Oracle..."
            className="min-w-0 flex-1 bg-transparent py-3 font-mono text-sm text-[#e8e4d9] outline-none placeholder:text-[#e8e4d9]/42"
          />
          <button
            type="submit"
            aria-label="Ask the Oracle"
            className="grid size-10 shrink-0 place-items-center border border-[#c9a84c]/35 text-[#c9a84c] transition hover:border-[#c9a84c] hover:bg-[#c9a84c]/10"
          >
            <Send size={16} aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
}
