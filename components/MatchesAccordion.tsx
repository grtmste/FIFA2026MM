"use client";

import { useState } from "react";
import { Match, Stage, STAGE_LABELS } from "@/lib/types";
import MatchCard from "@/components/MatchCard";
import Reveal from "@/components/Reveal";
import ToggleAllButton from "@/components/ToggleAllButton";

const STAGE_ORDER: Stage[] = ["group", "r32", "r16", "qf", "sf", "third", "final"];

const STAGE_TITLES: Record<Stage, string> = {
  group: "Alagrupi mängud",
  r32: STAGE_LABELS.r32 + " mängud",
  r16: STAGE_LABELS.r16 + " mängud",
  qf: "Veerandfinaali mängud",
  sf: "Poolfinaali mängud",
  third: STAGE_LABELS.third,
  final: "Finaalmäng",
};

export default function MatchesAccordion({ matches }: { matches: Match[] }) {
  // All sections start collapsed; the user opens each round on demand.
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const stages = STAGE_ORDER.map((stage) => ({
    stage,
    items: matches.filter((m) => m.stage === stage),
  })).filter((s) => s.items.length > 0);

  const allOpen = stages.length > 0 && stages.every((s) => open.has(s.stage));
  const toggleAll = () =>
    setOpen(allOpen ? new Set() : new Set(stages.map((s) => s.stage)));

  return (
    <div className="space-y-3">
      <ToggleAllButton allOpen={allOpen} onToggle={toggleAll} />
      {stages.map(({ stage, items }, idx) => {
        const isOpen = open.has(stage);
        return (
          <Reveal
            key={stage}
            delay={Math.min(idx, 6) * 0.05}
            className="overflow-hidden rounded-lg border border-line border-t-2 border-t-fifared/50 bg-surface shadow-card transition-shadow hover:shadow-card-hover"
          >
            <button
              type="button"
              onClick={() => toggle(stage)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.06]"
            >
              <span className="flex items-baseline gap-2">
                <span className="text-sm font-semibold tracking-tight text-ink">
                  {STAGE_TITLES[stage]}
                </span>
                <span className="eyebrow">{items.length} mängu</span>
              </span>
              <span
                className={`text-muted transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-line/60 p-3">
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((match, i) => (
                    <div
                      key={match.id}
                      className="animate-fade-in-up motion-reduce:animate-none"
                      style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                    >
                      <MatchCard match={match} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}
