// Static, faint line-art "ball caught in the net" tucked into the bottom-right
// corner as a subtle background accent (sits behind all content).
export default function NetBall() {
  const ax: number[] = [];
  for (let i = -3; i <= 13; i++) ax.push(i * 34);

  return (
    <div
      className="pointer-events-none fixed bottom-0 right-0 z-0 hidden select-none sm:block"
      style={{ opacity: 0.55 }}
      aria-hidden="true"
    >
      <svg width="400" height="330" viewBox="0 0 400 330" fill="none">
        {/* net mesh (behind the ball) */}
        <g stroke="#1B2447" strokeOpacity="0.16" strokeWidth="1">
          {ax.map((x, i) => (
            <line key={`a${i}`} x1={x} y1={0} x2={x + 180} y2={330} />
          ))}
          {ax.map((x, i) => (
            <line key={`b${i}`} x1={x} y1={0} x2={x - 180} y2={330} />
          ))}
        </g>

        {/* ball */}
        <g transform="translate(270,195)" stroke="#1B2447" strokeOpacity="0.4">
          <circle r="66" fill="#ffffff" fillOpacity="0.55" strokeWidth="2.4" />
          <polygon
            points="0,-27 26,-8 16,23 -16,23 -26,-8"
            fill="#1B2447"
            fillOpacity="0.14"
            strokeWidth="1.6"
          />
          <g strokeWidth="1.8" fill="none" strokeLinecap="round">
            <path d="M0 -27 L0 -54" />
            <path d="M26 -8 L52 -19" />
            <path d="M16 23 L31 48" />
            <path d="M-16 23 L-31 48" />
            <path d="M-26 -8 L-52 -19" />
          </g>
        </g>

        {/* a few net strands draped in front of the ball */}
        <g stroke="#1B2447" strokeOpacity="0.22" strokeWidth="1" fill="none">
          <path d="M205 195 q55 55 130 60" />
          <path d="M235 138 q-28 75 35 128" />
          <path d="M214 250 q60 -10 96 -66" />
        </g>
      </svg>
    </div>
  );
}
