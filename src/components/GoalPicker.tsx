import { useEffect, useMemo, useState } from "react";
import { useUser } from "../stores";
import type { GoalType } from "../types";

interface GoalOption {
  key: GoalType;
  icon: string;
  label: string;
  sub: string;
  activeClass: string;
  textClass: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    key: "lose",
    icon: "🏃",
    label: "Ozish",
    sub: "Vazn kamaytirish",
    activeClass:
      "bg-gradient-to-br from-food-green-100 to-food-green-50 border-food-green-500 shadow-md",
    textClass: "text-food-green-700",
  },
  {
    key: "maintain",
    icon: "⚖️",
    label: "Saqlash",
    sub: "Hozirgi vaznni ushlash",
    activeClass:
      "bg-gradient-to-br from-food-yellow-100 to-food-yellow-50 border-food-yellow-500 shadow-md",
    textClass: "text-food-yellow-700",
  },
  {
    key: "gain",
    icon: "💪",
    label: "Semirish",
    sub: "Vazn / mushak yig'ish",
    activeClass:
      "bg-gradient-to-br from-food-orange-100 to-food-orange-50 border-food-orange-500 shadow-md",
    textClass: "text-food-orange-700",
  },
];

const PACE_OPTIONS = [
  { value: 0.25, label: "Sekin", sub: "≈ 0.25 kg/hafta" },
  { value: 0.5, label: "O'rtacha", sub: "≈ 0.5 kg/hafta" },
  { value: 0.75, label: "Tez", sub: "≈ 0.75 kg/hafta" },
];

const KCAL_PER_KG_FAT = 7700;

function estimateTarget(
  tdee: number | undefined,
  bmr: number | undefined,
  goal: GoalType,
  pace: number,
): { kcal: number; delta: number } | null {
  if (!tdee || !bmr) return null;
  let delta = 0;
  if (goal === "lose") delta = -Math.min(1000, Math.round((pace * KCAL_PER_KG_FAT) / 7));
  if (goal === "gain") delta = Math.min(500, Math.round((pace * KCAL_PER_KG_FAT) / 7));
  let kcal = Math.round(tdee + delta);
  const floor = Math.round(bmr + 200);
  if (kcal < floor) {
    kcal = floor;
    delta = kcal - Math.round(tdee);
  }
  return { kcal, delta };
}

function estimateEta(
  currentKg: number | undefined,
  targetKg: number | undefined,
  pace: number,
): string | null {
  if (!currentKg || !targetKg || pace <= 0) return null;
  const diff = Math.abs(targetKg - currentKg);
  if (diff < 0.1) return "Maqsadingizga yaqinsiz!";
  const weeks = diff / pace;
  const days = Math.round(weeks * 7);
  const eta = new Date();
  eta.setDate(eta.getDate() + days);
  return eta.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export interface GoalDraft {
  goal_type: GoalType;
  target_weight_kg: number | null;
  weekly_pace_kg: number;
}

interface GoalPickerProps {
  value: GoalDraft;
  onChange: (next: GoalDraft) => void;
  /** Live preview uchun current weight + bmr + tdee — UI faqat ko'rsatadi */
  currentWeightKg?: number;
}

const GoalPicker = ({ value, onChange, currentWeightKg }: GoalPickerProps) => {
  const user = useUser();

  // Local mirror for the input field (so user can clear and retype)
  const [targetInput, setTargetInput] = useState<string>(
    value.target_weight_kg != null ? String(value.target_weight_kg) : "",
  );

  useEffect(() => {
    setTargetInput(value.target_weight_kg != null ? String(value.target_weight_kg) : "");
  }, [value.target_weight_kg]);

  const setGoal = (g: GoalType) => {
    onChange({
      ...value,
      goal_type: g,
      weekly_pace_kg: g === "maintain" ? 0 : value.weekly_pace_kg || 0.5,
    });
  };

  const setPace = (p: number) => onChange({ ...value, weekly_pace_kg: p });

  const setTarget = (raw: string) => {
    setTargetInput(raw);
    const n = Number(raw);
    onChange({
      ...value,
      target_weight_kg: raw === "" || isNaN(n) ? null : n,
    });
  };

  const effectivePace = value.goal_type === "maintain" ? 0 : value.weekly_pace_kg;

  const preview = useMemo(
    () => estimateTarget(user?.tdee, user?.bmr, value.goal_type, effectivePace),
    [user?.tdee, user?.bmr, value.goal_type, effectivePace],
  );

  const eta = useMemo(
    () =>
      value.goal_type === "maintain"
        ? null
        : estimateEta(currentWeightKg ?? user?.weight_kg, value.target_weight_kg ?? undefined, effectivePace),
    [currentWeightKg, user?.weight_kg, value.target_weight_kg, effectivePace, value.goal_type],
  );

  return (
    <div className="bg-gradient-to-br from-food-green-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-green-200 space-y-4">
      <div>
        <h3 className="text-base font-bold text-food-brown-800 flex items-center gap-2">
          <span>🎯</span> Maqsad
        </h3>
        <p className="text-xs text-food-brown-600 mt-1">
          Kunlik kaloriya targetingiz avtomatik hisoblanadi
        </p>
      </div>

      {/* Goal type */}
      <div className="grid grid-cols-3 gap-2">
        {GOAL_OPTIONS.map((opt) => {
          const active = value.goal_type === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setGoal(opt.key)}
              className={`rounded-2xl p-3 text-center border-2 transition-all active:scale-95 ${
                active ? opt.activeClass : "bg-white border-food-brown-100 hover:border-food-brown-300"
              }`}
            >
              <div className="text-2xl">{opt.icon}</div>
              <div className={`font-bold text-sm mt-1 ${active ? opt.textClass : "text-food-brown-700"}`}>
                {opt.label}
              </div>
              <div className="text-[10px] text-food-brown-500 mt-0.5 leading-tight">{opt.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Target weight + pace */}
      {value.goal_type !== "maintain" && (
        <>
          <div>
            <label className="text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
              <span>🎯</span> Maqsadli vazn (kg)
            </label>
            <input
              type="number"
              value={targetInput}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={value.goal_type === "lose" ? "65" : "75"}
              min={20}
              max={500}
              step={0.1}
              className="w-full px-4 py-3 rounded-xl border-2 border-food-green-200 focus:border-food-green-500 focus:ring-2 focus:ring-food-green-200 outline-none transition-all text-food-brown-800 font-bold text-lg bg-white"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-food-brown-700 mb-1.5 block">
              Tezlik
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PACE_OPTIONS.map((p) => {
                const active = value.weekly_pace_kg === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPace(p.value)}
                    className={`rounded-xl py-2.5 text-center border-2 transition-all active:scale-95 ${
                      active
                        ? "bg-food-green-100 border-food-green-500 shadow-sm"
                        : "bg-white border-food-brown-100 hover:border-food-brown-300"
                    }`}
                  >
                    <div className={`font-bold text-sm ${active ? "text-food-green-700" : "text-food-brown-700"}`}>
                      {p.label}
                    </div>
                    <div className="text-[10px] text-food-brown-500">{p.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Live preview */}
      {preview && (
        <div className="bg-white rounded-2xl p-4 border border-food-green-200">
          <div className="text-xs text-food-brown-500 font-medium">Kunlik targetingiz</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-food-green-700">{preview.kcal}</span>
            <span className="text-sm font-bold text-food-brown-500">kkal</span>
            {preview.delta !== 0 && (
              <span
                className={`text-xs font-bold ml-auto px-2 py-1 rounded-full ${
                  preview.delta < 0
                    ? "bg-food-green-100 text-food-green-700"
                    : "bg-food-orange-100 text-food-orange-700"
                }`}
              >
                {preview.delta > 0 ? "+" : ""}
                {preview.delta} kkal
              </span>
            )}
          </div>
          {eta && (
            <div className="text-xs text-food-brown-600 mt-2">
              📅 Yetish sanasi: <span className="font-bold">{eta}</span>
            </div>
          )}
        </div>
      )}

      {!user?.tdee && (
        <div className="bg-food-yellow-50 border border-food-yellow-300 rounded-xl p-3 text-sm text-food-brown-700">
          ⚠️ Quyidagi <b>Sizning ma'lumotlaringiz</b> bo'limini to'ldiring — kunlik kaloriya hisoblanishi uchun.
        </div>
      )}
    </div>
  );
};

export default GoalPicker;
