/**
 * Jalka MM ball mark, recreated as inline SVG to match the brand logo:
 * a royal-blue ball with a dark-navy top panel, white seams, and a couple
 * of detached hexagon accents for a dynamic, modern feel.
 */
export function BallMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Jalka MM"
    >
      {/* Detached accent hexagons */}
      <polygon
        points="20,62 27,58 34,62 34,70 27,74 20,70"
        fill="#1652C9"
      />
      <polygon
        points="54,86 60,83 66,86 66,93 60,96 54,93"
        fill="#1652C9"
      />

      {/* Ball body */}
      <g stroke="#FFFFFF" strokeWidth="3.2" strokeLinejoin="round">
        {/* Dark navy top-center panel */}
        <polygon points="50,18 67,30 60,50 40,50 33,30" fill="#0E1A4D" />
        {/* Upper-left blue panel */}
        <polygon points="50,18 33,30 18,40 24,30 38,20" fill="#1652C9" />
        {/* Left blue panel */}
        <polygon points="33,30 40,50 34,70 21,62 18,40" fill="#1652C9" />
        {/* Bottom-center blue panel */}
        <polygon points="40,50 60,50 66,72 50,84 34,70" fill="#1652C9" />
        {/* Right blue panel */}
        <polygon points="60,50 67,30 82,40 79,62 66,72" fill="#1652C9" />
        {/* Upper-right blue panel */}
        <polygon points="67,30 50,18 62,20 76,30 82,40" fill="#1652C9" />
      </g>
    </svg>
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <BallMark className="h-9 w-9 flex-shrink-0" />
      <div className="leading-none">
        <span className="block text-2xl font-extrabold tracking-tight text-navy md:text-[1.6rem]">
          Jalka <span className="gradient-text">MM</span>
        </span>
        <span className="eyebrow mt-1 block">2026 Ennustusmäng</span>
      </div>
    </div>
  );
}
