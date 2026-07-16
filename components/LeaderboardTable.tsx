"use client";

import { motion } from "framer-motion";
import CountUp from "@/components/CountUp";

export interface LbRow {
  id: string;
  name: string;
  isChampion?: boolean;
}

export interface LbColumn<R> {
  label: string;
  get: (row: R) => number;
  bold?: boolean;
}

// Grid-based standings table. Rows are keyed by id and use Framer Motion's
// `layout`, so when the incoming order changes (after a result is entered) the
// rows slide to their new positions (FLIP). Numbers roll via CountUp.
export default function LeaderboardTable<R extends LbRow>({
  rows,
  columns,
  onSelect,
}: {
  rows: R[];
  columns: LbColumn<R>[];
  onSelect: (id: string) => void;
}) {
  const template = `2.25rem minmax(0,1fr) ${columns
    .map(() => "minmax(3.25rem,auto)")
    .join(" ")}`;

  return (
    <div className="text-sm">
      {/* Header */}
      <div
        className="grid items-center border-b border-line/60 px-3 py-2 text-[10px] uppercase tracking-wider text-muted"
        style={{ gridTemplateColumns: template }}
      >
        <span className="text-center font-medium">#</span>
        <span className="font-medium">Nimi</span>
        {columns.map((c) => (
          <span key={c.label} className="text-center font-medium">
            {c.label}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div>
        {rows.map((row, rowIdx) => (
          <motion.div
            key={row.id}
            layout
            transition={{ type: "spring", stiffness: 520, damping: 40 }}
            className={`relative grid items-center px-3 py-2.5 transition-colors ${
              rowIdx === 0 ? "bg-fifagreen/[0.14]" : "hover:bg-white/[0.06]"
            }`}
            style={{ gridTemplateColumns: template }}
          >
            {rowIdx === 0 && (
              <span className="gold-shine pointer-events-none absolute inset-0" />
            )}
            <span className="text-center font-semibold text-fifagreen">
              {rowIdx + 1}
            </span>
            <span className="min-w-0 truncate font-medium text-ink">
              <button
                type="button"
                onClick={() => onSelect(row.id)}
                className="truncate text-left underline decoration-stone-300 decoration-dotted underline-offset-2 transition-colors hover:text-fifagreen hover:decoration-fifagreen"
              >
                {row.name}
                {row.isChampion && <span title="Maailmameister"> 🏆</span>}
              </button>
            </span>
            {columns.map((c) => (
              <span
                key={c.label}
                className={`text-center ${
                  c.bold ? "font-bold text-ink" : "text-ink/75"
                }`}
              >
                <CountUp value={c.get(row)} delay={Math.min(rowIdx, 16) * 0.05} />
              </span>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
