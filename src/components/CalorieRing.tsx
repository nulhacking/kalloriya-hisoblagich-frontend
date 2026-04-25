interface CalorieRingProps {
  eaten: number;
  target: number;
  burned?: number;
}

// Stop color thresholds.
function statusColor(pct: number): string {
  if (pct < 0.5) return "#fbbf24";  // food-yellow-400 — not enough
  if (pct <= 1.0) return "#22c55e"; // green — in range
  return "#ef4444";                  // red — over
}

const CalorieRing = ({ eaten, target, burned = 0 }: CalorieRingProps) => {
  const net = Math.max(0, eaten - burned);
  const pct = target > 0 ? net / target : 0;
  const clamped = Math.min(pct, 1.0);

  const size = 180;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = circ * clamped;

  const color = statusColor(pct);
  const remaining = Math.max(0, Math.round(target - net));

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1e7d8"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition: "stroke-dasharray 600ms ease, stroke 300ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[11px] uppercase tracking-wider text-food-brown-500 font-bold">
          Yeyilgan
        </div>
        <div className="text-3xl font-extrabold text-food-brown-800 leading-none mt-0.5">
          {Math.round(net)}
        </div>
        <div className="text-xs text-food-brown-500 font-medium mt-1">
          / {target} kkal
        </div>
        <div
          className="mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {pct > 1 ? `+${Math.round(net - target)} oshdi` : `${remaining} qoldi`}
        </div>
      </div>
    </div>
  );
};

export default CalorieRing;
