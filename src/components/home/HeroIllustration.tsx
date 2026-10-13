const TILES = [
  { x: 28, y: 56, color: '#142B52', speaking: false },
  { x: 252, y: 56, color: '#1E6FF2', speaking: true },
  { x: 28, y: 174, color: '#4A8DFF', speaking: false },
  { x: 252, y: 174, color: '#0B1E3A', speaking: false },
];

/** Ilustrasi sederhana: jendela rapat dengan empat peserta (orisinal, bukan tiruan merek lain). */
export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label="Ilustrasi jendela rapat video dengan empat peserta"
      className="h-auto w-full max-w-lg"
    >
      <rect
        x="8"
        y="8"
        width="464"
        height="344"
        rx="24"
        strokeWidth="2"
        style={{ fill: 'rgb(var(--rt-surface))', stroke: 'rgb(var(--rt-line))' }}
      />
      <circle cx="36" cy="32" r="6" fill="#E5484D" />
      <circle cx="56" cy="32" r="6" fill="#E5A100" />
      <circle cx="76" cy="32" r="6" fill="#22A06B" />
      {TILES.map((t) => (
        <g key={`${t.x}-${t.y}`}>
          <rect
            x={t.x}
            y={t.y}
            width="200"
            height="110"
            rx="16"
            fill={t.color}
            stroke={t.speaking ? '#22A06B' : 'none'}
            strokeWidth="4"
          />
          <circle cx={t.x + 100} cy={t.y + 42} r="18" fill="#FFFFFF" fillOpacity="0.92" />
          <path
            d={`M${t.x + 56} ${t.y + 110}C${t.x + 56} ${t.y + 80} ${t.x + 80} ${t.y + 68} ${t.x + 100} ${t.y + 68}C${t.x + 120} ${t.y + 68} ${t.x + 144} ${t.y + 80} ${t.x + 144} ${t.y + 110}Z`}
            fill="#FFFFFF"
            fillOpacity="0.92"
          />
        </g>
      ))}
      <circle cx="190" cy="322" r="12" fill="#1E6FF2" />
      <circle cx="240" cy="322" r="12" fill="#1E6FF2" />
      <circle cx="290" cy="322" r="12" fill="#E5484D" />
    </svg>
  );
}
