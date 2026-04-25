interface MacroRingProps {
  label: string;
  emoji: string;
  current: number;
  target: number;
  color: string;  // hex like "#22c55e"
}

const MacroRing = ({ label, emoji, current, target, color }: MacroRingProps) => {
  const pct = target > 0 ? Math.min(1, current / target) : 0;
  const size = 64;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = circ * pct;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f1e7d8" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${dash} ${circ - dash}`}
            style={{ transition: "stroke-dasharray 500ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-base">
          {emoji}
        </div>
      </div>
      <div className="mt-1 text-[11px] font-bold text-food-brown-700">{label}</div>
      <div className="text-[11px] text-food-brown-500">
        {Math.round(current)}/{target}g
      </div>
    </div>
  );
};

export default MacroRing;
