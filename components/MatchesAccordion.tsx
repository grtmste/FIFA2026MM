"use client";

import { useState } from "react";
import { Match, Stage, STAGE_LABELS } from "@/lib/types";
import MatchCard from "@/components/MatchCard";

const STAGE_ORDER: Stage[] = ["group", "r32", "r16", "qf", "sf", "final"];

const STAGE_TITLES: Record<Stage, string> = {
  group: "Alagrupi mängud",
  r32: STAGE_LABELS.r32 + " mängud",
  r16: STAGE_LABELS.r16 + " mängud",
  qf: "Veerandfinaali mängud",
  sf: "Poolfinaali mängud",
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

  return (
    <div className="space-y-3">
      {stages.map(({ stage, items }) => {
        const isOpen = open.has(stage);
        return (
          <div
            key={stage}
            className="overflow-hidden rounded-sm border border-stone-200 border-t-2 border-t-gold/50 bg-white shadow-card"
          >
            <button
              type="button"
              onClick={() => toggle(stage)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50/60"
            >
              <span className="flex items-baseline gap-2">
                <span className="section-title text-lg text-navy">
                  {STAGE_TITLES[stage]}
                </span>
                <span className="eyebrow">{items.length} mängu</span>
              </span>
              <span
                className={`text-stone-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-stone-100 p-3">
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
