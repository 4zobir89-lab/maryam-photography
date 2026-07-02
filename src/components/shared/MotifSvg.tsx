// Shared decorative SVG used as a placeholder image for projects that don't
// have a real cover image. Used by both the public Portfolio section and the
// fullscreen Gallery page. Extracted from src/components/sections/Portfolio.tsx.

export type MotifName =
  | "bride"
  | "mountain"
  | "face"
  | "city"
  | "desert"
  | "tower"
  | "wave"
  | "tree";

export function MotifSvg({
  motif,
  palette,
}: {
  motif: string;
  palette: string[];
}) {
  const m = (motif || "bride") as MotifName;
  const [c1, c2, c3] = palette;
  const gradId = `g-${m}-${(c1 || "").replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      viewBox="0 0 400 300"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="60%" stopColor={c2} />
          <stop offset="100%" stopColor="oklch(0.05 0 0)" />
        </linearGradient>
        <radialGradient id={`${gradId}-r`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={c3} stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${gradId})`} />
      <rect width="400" height="300" fill={`url(#${gradId}-r)`} />

      {/* Motif */}
      {m === "bride" && (
        <g opacity="0.85">
          <ellipse cx="200" cy="130" rx="55" ry="65" fill={c3} opacity="0.4" />
          <path
            d="M 130 300 Q 130 200 200 180 Q 270 200 270 300 Z"
            fill={c3}
            opacity="0.3"
          />
          <path
            d="M 145 110 Q 200 50 255 110 Q 255 70 200 50 Q 145 70 145 110 Z"
            fill="oklch(0.1 0 0)"
            opacity="0.7"
          />
          <circle cx="200" cy="135" r="40" fill="none" stroke={c3} strokeWidth="0.5" opacity="0.5" />
        </g>
      )}
      {m === "face" && (
        <g opacity="0.8">
          <ellipse cx="200" cy="150" rx="80" ry="100" fill={c2} opacity="0.6" />
          <ellipse cx="180" cy="140" rx="6" ry="4" fill="oklch(0.05 0 0)" />
          <ellipse cx="220" cy="140" rx="6" ry="4" fill="oklch(0.05 0 0)" />
          <path d="M 180 180 Q 200 195 220 180" stroke="oklch(0.1 0 0)" strokeWidth="2" fill="none" />
          <path d="M 200 70 Q 140 90 130 130" stroke={c3} strokeWidth="3" fill="none" opacity="0.6" />
        </g>
      )}
      {m === "tower" && (
        <g opacity="0.85">
          {[100, 180, 260].map((x, i) => (
            <g key={i}>
              <rect x={x - 25} y={80 + i * 20} width="50" height={220 - i * 20} fill={c3} opacity="0.3" />
              <rect x={x - 30} y={70 + i * 20} width="60" height="14" fill={c3} opacity="0.5" />
              <polygon points={`${x - 28},${70 + i * 20} ${x + 28},${70 + i * 20} ${x},${50 + i * 20}`} fill={c3} opacity="0.6" />
              {[120, 160, 200, 240].map((y) => (
                <rect key={y} x={x - 4} y={y + i * 20} width="8" height="12" fill="oklch(0.1 0 0)" opacity="0.7" />
              ))}
            </g>
          ))}
        </g>
      )}
      {m === "desert" && (
        <g opacity="0.85">
          <circle cx="200" cy="100" r="40" fill={c3} opacity="0.5" />
          <path d="M 0 220 Q 100 180 200 210 Q 300 240 400 200 L 400 300 L 0 300 Z" fill={c1} opacity="0.5" />
          <path d="M 0 250 Q 100 220 200 240 Q 300 260 400 230 L 400 300 L 0 300 Z" fill={c2} opacity="0.6" />
        </g>
      )}
      {m === "wave" && (
        <g opacity="0.85">
          <path d="M 0 180 Q 100 130 200 180 Q 300 230 400 180 L 400 300 L 0 300 Z" fill={c1} opacity="0.5" />
          <path d="M 0 220 Q 100 180 200 220 Q 300 260 400 220 L 400 300 L 0 300 Z" fill={c2} opacity="0.7" />
          <path d="M 0 260 Q 100 230 200 260 Q 300 290 400 260 L 400 300 L 0 300 Z" fill="oklch(0.05 0 0)" opacity="0.8" />
        </g>
      )}
      {m === "city" && (
        <g opacity="0.85">
          {[60, 130, 200, 270, 340].map((x, i) => (
            <g key={i}>
              <rect x={x} y={150 + (i % 2) * 20} width="55" height={150 - (i % 2) * 20} fill={c3} opacity="0.3" />
              <rect x={x} y={140 + (i % 2) * 20} width="55" height="10" fill={c3} opacity="0.5" />
              {Array.from({ length: 4 }).map((_, r) => (
                <g key={r}>
                  <rect x={x + 10} y={160 + r * 25 + (i % 2) * 20} width="8" height="10" fill="oklch(0.1 0 0)" opacity="0.6" />
                  <rect x={x + 25} y={160 + r * 25 + (i % 2) * 20} width="8" height="10" fill="oklch(0.1 0 0)" opacity="0.6" />
                  <rect x={x + 40} y={160 + r * 25 + (i % 2) * 20} width="8" height="10" fill="oklch(0.1 0 0)" opacity="0.6" />
                </g>
              ))}
            </g>
          ))}
        </g>
      )}
      {m === "tree" && (
        <g opacity="0.85">
          <rect x="195" y="180" width="10" height="100" fill={c2} />
          <circle cx="200" cy="160" r="80" fill={c1} opacity="0.6" />
          <circle cx="160" cy="140" r="50" fill={c1} opacity="0.5" />
          <circle cx="240" cy="140" r="50" fill={c1} opacity="0.5" />
          <circle cx="200" cy="100" r="50" fill={c1} opacity="0.7" />
          <circle cx="200" cy="160" r="3" fill={c3} />
        </g>
      )}
      {m === "mountain" && (
        <g opacity="0.85">
          <polygon points="0,300 80,180 160,260 240,140 320,220 400,170 400,300" fill={c2} opacity="0.7" />
          <polygon points="80,180 110,210 140,180 160,260 100,260" fill="oklch(0.05 0 0)" opacity="0.4" />
          <polygon points="240,140 270,170 300,140 320,220 260,220" fill="oklch(0.05 0 0)" opacity="0.4" />
          <circle cx="320" cy="80" r="30" fill={c3} opacity="0.6" />
        </g>
      )}

      {/* Grain overlay */}
      <rect width="400" height="300" fill="oklch(0.05 0 0)" opacity="0.2" />
    </svg>
  );
}
