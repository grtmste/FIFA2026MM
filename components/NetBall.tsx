// Static, faint football-goal net tucked into the bottom-right corner as a
// subtle background accent (sits behind all content).
export default function NetBall() {
  const SIZE = 22; // mesh cell size
  const W = 460;
  const H = 360;
  // Diamond goal-net mesh: two families of parallel diagonal lines.
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let c = -H; c <= W; c += SIZE) {
    lines.push({ x1: c, y1: 0, x2: c + H, y2: H }); // ↘
    lines.push({ x1: c, y1: 0, x2: c - H, y2: H }); // ↙
  }

  return (
    <div
      className="pointer-events-none fixed bottom-0 right-0 z-0 hidden select-none sm:block"
      style={{ opacity: 0.5 }}
      aria-hidden="true"
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
        <g stroke="#1B2447" strokeOpacity="0.14" strokeWidth="1">
          {lines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
          ))}
        </g>
      </svg>
    </div>
  );
}
