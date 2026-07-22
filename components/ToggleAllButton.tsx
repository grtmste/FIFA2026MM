"use client";

// Small "expand all / collapse all" control for the accordion pages.
export default function ToggleAllButton({
  allOpen,
  onToggle,
  className,
}: {
  allOpen: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <div className={`flex justify-end ${className ?? ""}`}>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink/80 shadow-sm transition-colors hover:border-fifared/60 hover:text-ink"
      >
        <span className="text-fifared">{allOpen ? "⤡" : "⤢"}</span>
        {allOpen ? "Sulge kõik" : "Ava kõik"}
      </button>
    </div>
  );
}
