import { useMemo } from "react";
import { useWeightTrend } from "../hooks/useWeight";
import { useUser } from "../stores";

const CHART_W = 320;
const CHART_H = 160;
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 24;

function formatShortDate(d: string): string {
  return d.slice(5).replace("-", "/");
}

const WeightTrendChart = () => {
  const user = useUser();
  const { data, isLoading } = useWeightTrend();

  const view = useMemo(() => {
    const history = data?.history ?? [];
    if (history.length < 2) return null;
    const points = history.map((h) => ({
      date: h.date,
      kg: h.weight_kg,
      ma: h.ma7_kg ?? h.weight_kg,
    }));
    const target = data?.target_weight_kg ?? user?.target_weight_kg ?? null;

    const allValues = points.flatMap((p) => [p.kg, p.ma]);
    if (target) allValues.push(target);
    const min = Math.min(...allValues) - 0.5;
    const max = Math.max(...allValues) + 0.5;
    const range = max - min || 1;

    const innerW = CHART_W - PAD_L - PAD_R;
    const innerH = CHART_H - PAD_T - PAD_B;

    const scaleX = (i: number) =>
      points.length === 1
        ? PAD_L + innerW / 2
        : PAD_L + (i * innerW) / (points.length - 1);
    const scaleY = (v: number) => PAD_T + innerH - ((v - min) / range) * innerH;

    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(p.kg)}`)
      .join(" ");
    const maPath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(p.ma)}`)
      .join(" ");
    const targetY = target ? scaleY(target) : null;

    return { points, linePath, maPath, targetY, target, scaleX, scaleY, min, max };
  }, [data, user?.target_weight_kg]);

  if (isLoading) {
    return (
      <div className="bg-white/95 rounded-2xl p-4 border-2 border-food-blue-100 h-48 animate-pulse" />
    );
  }

  if (!view) {
    return (
      <div className="bg-white/95 rounded-2xl p-4 border-2 border-food-blue-100">
        <div className="font-extrabold text-food-brown-800 flex items-center gap-2">
          <span>⚖️</span> Vazn tarixi
        </div>
        <p className="text-sm text-food-brown-600 mt-2">
          Vazn grafigi ko'rinishi uchun kamida 2 ta yozuv kiriting.
        </p>
      </div>
    );
  }

  const labels = (() => {
    const ps = view.points;
    if (ps.length <= 5) return ps.map((p, i) => ({ idx: i, label: formatShortDate(p.date) }));
    const idxs = [0, Math.floor(ps.length / 4), Math.floor(ps.length / 2), Math.floor((3 * ps.length) / 4), ps.length - 1];
    return idxs.map((i) => ({ idx: i, label: formatShortDate(ps[i].date) }));
  })();

  return (
    <div className="bg-white/95 rounded-2xl p-4 border-2 border-food-blue-100">
      <div className="flex items-center justify-between mb-2">
        <div className="font-extrabold text-food-brown-800 flex items-center gap-2">
          <span>⚖️</span> Vazn tarixi
        </div>
        {data?.slope_kg_per_week != null && (
          <div
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              data.slope_kg_per_week < 0
                ? "bg-food-green-100 text-food-green-700"
                : data.slope_kg_per_week > 0
                  ? "bg-food-orange-100 text-food-orange-700"
                  : "bg-food-brown-100 text-food-brown-700"
            }`}
          >
            {data.slope_kg_per_week > 0 ? "+" : ""}
            {data.slope_kg_per_week.toFixed(2)} kg/hafta
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Y axis labels (top + bottom only) */}
        <text x={4} y={PAD_T + 4} className="text-[10px] fill-food-brown-500">
          {view.max.toFixed(1)}
        </text>
        <text x={4} y={CHART_H - PAD_B + 12} className="text-[10px] fill-food-brown-500">
          {view.min.toFixed(1)}
        </text>

        {/* Gridlines */}
        {[0.25, 0.5, 0.75].map((p) => {
          const y = PAD_T + (CHART_H - PAD_T - PAD_B) * p;
          return (
            <line
              key={p}
              x1={PAD_L}
              x2={CHART_W - PAD_R}
              y1={y}
              y2={y}
              stroke="#f1e7d8"
              strokeWidth={1}
            />
          );
        })}

        {/* Target line */}
        {view.targetY != null && (
          <>
            <line
              x1={PAD_L}
              x2={CHART_W - PAD_R}
              y1={view.targetY}
              y2={view.targetY}
              stroke="#22c55e"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <text
              x={CHART_W - PAD_R}
              y={view.targetY - 4}
              textAnchor="end"
              className="text-[10px] fill-food-green-700 font-bold"
            >
              🎯 {view.target}kg
            </text>
          </>
        )}

        {/* MA7 line (lighter) */}
        <path d={view.maPath} stroke="#93c5fd" strokeWidth={2} fill="none" />

        {/* Actual weight line */}
        <path d={view.linePath} stroke="#3b82f6" strokeWidth={2.5} fill="none" />

        {/* Points */}
        {view.points.map((p, i) => (
          <circle
            key={p.date}
            cx={view.scaleX(i)}
            cy={view.scaleY(p.kg)}
            r={3}
            fill="#3b82f6"
          />
        ))}

        {/* X labels */}
        {labels.map(({ idx, label }) => (
          <text
            key={idx}
            x={view.scaleX(idx)}
            y={CHART_H - 6}
            textAnchor="middle"
            className="text-[10px] fill-food-brown-500"
          >
            {label}
          </text>
        ))}
      </svg>

      <div className="grid grid-cols-3 gap-2 mt-2 text-center">
        <div className="bg-food-blue-50 rounded-lg p-2">
          <div className="text-[10px] text-food-brown-500">Boshida</div>
          <div className="font-bold text-food-blue-700 text-sm">
            {view.points[0].kg.toFixed(1)} kg
          </div>
        </div>
        <div className="bg-food-green-50 rounded-lg p-2">
          <div className="text-[10px] text-food-brown-500">Hozir</div>
          <div className="font-bold text-food-green-700 text-sm">
            {view.points[view.points.length - 1].kg.toFixed(1)} kg
          </div>
        </div>
        <div className="bg-food-yellow-50 rounded-lg p-2">
          <div className="text-[10px] text-food-brown-500">O'zgarish</div>
          <div className="font-bold text-food-yellow-700 text-sm">
            {(() => {
              const diff =
                view.points[view.points.length - 1].kg - view.points[0].kg;
              return `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg`;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightTrendChart;
