"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

// Fires a celebratory FIFA-red/gold confetti burst the first time a champion
// appears (once per champion per browser session).
export default function ChampionConfetti({
  championId,
}: {
  championId: string | null;
}) {
  const fired = useRef<string | null>(null);

  useEffect(() => {
    if (!championId || fired.current === championId) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(`champConfetti:${championId}`) === "1";
    } catch {}
    if (seen) {
      fired.current = championId;
      return;
    }
    fired.current = championId;
    try {
      sessionStorage.setItem(`champConfetti:${championId}`, "1");
    } catch {}

    const colors = ["#FF3B4E", "#FF8A3D", "#FBD34D", "#A855F7", "#22D3EE", "#ffffff"];
    const end = Date.now() + 1400;

    // Two side cannons firing inward + a couple of centre bursts.
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 62,
        startVelocity: 55,
        origin: { x: 0, y: 0.7 },
        colors,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 62,
        startVelocity: 55,
        origin: { x: 1, y: 0.7 },
        colors,
        disableForReducedMotion: true,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    confetti({
      particleCount: 140,
      spread: 100,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.35 },
      colors,
      scalar: 1.1,
      disableForReducedMotion: true,
    });
  }, [championId]);

  return null;
}
