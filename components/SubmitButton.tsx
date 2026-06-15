"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

type Variant = "primary" | "outline" | "danger";

const BASE =
  "relative inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all duration-150 active:scale-95 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-gold text-white shadow-sm hover:bg-gold-dark",
  outline: "border border-gold text-gold hover:bg-gold/10",
  danger: "border border-rose-200 text-rose-500 hover:bg-rose-50",
};

const SUCCESS = "border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm";

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 animate-pop-in"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function SubmitButton({
  children,
  successLabel,
  variant = "outline",
  className = "",
}: {
  children: React.ReactNode;
  /** Optional text shown next to the checkmark on success. */
  successLabel?: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const [done, setDone] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    // Transition from pending -> idle means the submission finished.
    if (wasPending.current && !pending) {
      setDone(true);
      const timer = setTimeout(() => setDone(false), 1600);
      wasPending.current = pending;
      return () => clearTimeout(timer);
    }
    wasPending.current = pending;
  }, [pending]);

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${BASE} ${done ? SUCCESS : VARIANTS[variant]} ${className}`}
    >
      {pending ? (
        <Spinner />
      ) : done ? (
        <>
          <CheckIcon />
          {successLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
