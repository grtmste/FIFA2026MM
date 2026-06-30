// Simple, light football mark (white with navy seams).
export default function Football({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#1B2447" strokeWidth="3" />
      <polygon points="50,28 67,40 60,61 40,61 33,40" fill="#1B2447" />
      <g stroke="#1B2447" strokeWidth="2.4" fill="none" strokeLinecap="round">
        <path d="M50 28 L50 9" />
        <path d="M67 40 L85 32" />
        <path d="M60 61 L71 79" />
        <path d="M40 61 L29 79" />
        <path d="M33 40 L15 32" />
      </g>
    </svg>
  );
}
