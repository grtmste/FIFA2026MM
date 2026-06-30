"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import Football from "@/components/Football";

// One-time entry animation: a football arcs into the mesh net, the net gives
// with a ripple, then the cream cover lifts to reveal the page — leaving the
// ball resting faintly in the net. Plays once per browser session.
export default function IntroOverlay() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [frozen, setFrozen] = useState(false);

  const cover = useAnimationControls();
  const ball = useAnimationControls();
  const ripple = useAnimationControls();
  const net = useAnimationControls();

  // Decide whether to play (once per session) — runs before the scene mounts.
  useEffect(() => {
    setMounted(true);
    let seen = false;
    try {
      seen = sessionStorage.getItem("introSeen") === "1";
    } catch {}
    if (seen) return;
    try {
      sessionStorage.setItem("introSeen", "1");
    } catch {}
    if (reduce) return; // skip the animation entirely
    setActive(true);
  }, [reduce]);

  // Run the choreography once the scene has actually mounted.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      await ball.start({
        x: [-190, -30, 0],
        y: [150, -50, 0],
        rotate: [0, 230, 430],
        transition: { duration: 1.15, ease: "easeOut", times: [0, 0.62, 1] },
      });
      if (cancelled) return;
      ripple.start({
        scale: [0.2, 1.7],
        opacity: [0.55, 0],
        transition: { duration: 0.55, ease: "easeOut" },
      });
      net.start({
        scale: [1, 1.07, 1],
        transition: { duration: 0.45, ease: "easeOut" },
      });
      await ball.start({
        scaleX: [1, 1.22, 1],
        scaleY: [1, 0.82, 1],
        transition: { duration: 0.22, ease: "easeOut" },
      });
      await new Promise((r) => setTimeout(r, 360));
      if (cancelled) return;
      await Promise.all([
        cover.start({ opacity: 0, transition: { duration: 0.45, ease: "easeInOut" } }),
        ball.start({
          opacity: 0.13,
          scale: 0.46,
          transition: { duration: 0.45, ease: "easeInOut" },
        }),
      ]);
      if (cancelled) return;
      setFrozen(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [active, ball, cover, net, ripple]);

  if (!mounted || !active) return null;

  return createPortal(
    <div
      className={`pointer-events-none fixed inset-0 overflow-hidden ${
        frozen ? "z-0" : "z-[200]"
      }`}
    >
      {/* cream cover with the focal net */}
      <motion.div animate={cover} initial={{ opacity: 1 }} className="absolute inset-0 bg-cream">
        {/* static centering wrapper so Framer's transform on the svg doesn't
            clobber the centering */}
        <div className="absolute left-1/2 top-[42%] h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2">
          <motion.svg
            animate={net}
            initial={{ scale: 1 }}
            viewBox="0 0 440 440"
            className="h-full w-full"
            style={{ transformOrigin: "50% 50%" }}
          >
            <g fill="none" strokeWidth="1.6">
              <path d="M150 150 L300 150 L300 300 L150 300 Z" stroke="#1B2447" strokeOpacity="0.16" />
              <path d="M220 220 L150 150" stroke="#9355E0" strokeOpacity="0.2" />
              <path d="M220 220 L300 150" stroke="#7FC2BC" strokeOpacity="0.2" />
              <path d="M220 220 L300 300" stroke="#3D5AC0" strokeOpacity="0.2" />
              <path d="M220 220 L150 300" stroke="#E9A8C9" strokeOpacity="0.2" />
              <path d="M150 150 L58 78" stroke="#1B2447" strokeOpacity="0.12" />
              <path d="M300 150 L380 64" stroke="#9355E0" strokeOpacity="0.12" />
              <path d="M300 300 L392 366" stroke="#3D5AC0" strokeOpacity="0.12" />
              <path d="M150 300 L66 380" stroke="#7FC2BC" strokeOpacity="0.12" />
              <path d="M58 78 L380 64" stroke="#F4C7A1" strokeOpacity="0.1" />
              <path d="M380 64 L392 366" stroke="#1B2447" strokeOpacity="0.1" />
              <path d="M392 366 L66 380" stroke="#9355E0" strokeOpacity="0.1" />
              <path d="M66 380 L58 78" stroke="#7FC2BC" strokeOpacity="0.1" />
            </g>
            <g>
              {[
                [150, 150, "#9355E0"],
                [300, 150, "#7FC2BC"],
                [300, 300, "#3D5AC0"],
                [150, 300, "#E9A8C9"],
                [220, 220, "#1B2447"],
              ].map(([cx, cy, c], i) => (
                <circle
                  key={i}
                  cx={cx as number}
                  cy={cy as number}
                  r={i === 4 ? 3.2 : 2.4}
                  fill={c as string}
                  fillOpacity="0.45"
                />
              ))}
            </g>
          </motion.svg>
        </div>
      </motion.div>

      {/* impact ripple — static centered wrapper, motion scale inside */}
      <div className="absolute left-1/2 top-[42%] h-0 w-0 -translate-x-1/2 -translate-y-1/2">
        <motion.span
          animate={ripple}
          initial={{ scale: 0, opacity: 0 }}
          className="absolute left-1/2 top-1/2 h-24 w-24 rounded-full border-2 border-gold/50"
          style={{ x: "-50%", y: "-50%", transformOrigin: "50% 50%" }}
        />
      </div>

      {/* ball — lands on the net centre; transforms entirely Framer-controlled */}
      <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={ball}
          initial={{ x: -190, y: 150, rotate: 0, opacity: 1 }}
          className="will-change-transform"
          style={{ marginLeft: "-2rem", marginTop: "-2rem" }}
        >
          <Football className="h-16 w-16 drop-shadow-[0_6px_12px_rgba(27,36,71,0.22)]" />
        </motion.div>
      </div>
    </div>,
    document.body
  );
}
