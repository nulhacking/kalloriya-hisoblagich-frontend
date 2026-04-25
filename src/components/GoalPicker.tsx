import { useEffect, useMemo, useState } from "react";
import { useUser } from "../stores";
import { useSetupGoal } from "../hooks/useGoal";
import { useToast } from "./Toast";
import type { GoalType } from "../types";

interface GoalOption {
  key: GoalType;
  icon: string;
  label: string;
  sub: string;
  activeClass: string;
  textClass: string;
}

// Full classnames so Tailwind JIT can pick them up.
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
    sub: "Hozirgi vaznni ushlab turish",
    activeClass:
      "bg-gradient-to-br from-food-yellow-100 to-food-yellow-50 border-food-yellow-500 shadow-md",
    textClass: "text-food-yellow-700",
  },
  {
    key: "gain",
    icon: "💪",
    label: "Semirish",
    sub: "Vazn oshirish / mushak",
    activeClass:
      "bg-gradient-to-br from-food-orange-100 to-food-orange-50 border-food-orange-500 shadow-md",
    textClass: "text-food-orange-700",
  },
];

const PACE_OPTIONS = [
  { value: 0.25, label: "Yumshoq", sub: "≈ 0.25 kg/hafta" },
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
  if (diff < 0.1) return "Siz allaqachon maqsad yaqinidasiz!";
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

const GoalPicker = () => {
  const user = useUser();
  const setupGoal = useSetupGoal();
  const toast = useToast();

  const [goal, setGoal] = useState<GoalType>((user?.goal_type as GoalType) || "maintain");
  const [targetKg, setTargetKg] = useState<number | "">(
    user?.target_weight_kg ?? (user?.weight_kg ? user.weight_kg - 5 : ""),
  );
  const [pace, setPace] = useState<number>(user?.weekly_pace_kg || 0.5);

  useEffect(() => {
    if (user?.goal_type) setGoal(user.goal_type as GoalType);
    if (user?.target_weight_kg) setTargetKg(user.target_weight_kg);
    if (user?.weekly_pace_kg) setPace(user.weekly_pace_kg);
  }, [user?.goal_type, user?.target_weight_kg, user?.weekly_pace_kg]);

  const effectivePace = goal === "maintain" ? 0 : pace;

  const preview = useMemo(
    () => estimateTarget(user?.tdee, user?.bmr, goal, effectivePace),
    [user?.tdee, user?.bmr, goal, effectivePace],
  );

  const eta = useMemo(
    () => (goal === "maintain" ? null : estimateEta(user?.weight_kg, Number(targetKg) || undefined, effectivePace)),
    [user?.weight_kg, targetKg, effectivePace, goal],
  );

  const ready = !!user?.tdee && !!user?.bmr && !!user?.weight_kg;

  const handleSave = async () => {
    if (!ready) {
      toast.error("Avval tana ma'lumotlarini to'ldirib saqlang");
      return;
    }
    try {
      await setupGoal.mutateAsync({
        goal_type: goal,
        target_weight_kg: goal === "maintain" ? user?.weight_kg : Number(targetKg) || null,
        weekly_pace_kg: goal === "maintain" ? 0 : pace,
        target_date: null,
      });
      toast.success("Maqsad saqlandi ✅");
      if (window.Telegram?.WebApp) {
        // @ts-expect-error — HapticFeedback may not be typed here
        window.Telegram.WebApp.HapticFeedback?.impactOccurred?.("light");
      }
    } catch (err) {
      console.error(err);
      toast.error("Saqlashda xatolik");
    }
  };

  return (
    <div className="bg-gradient-to-br from-food-green-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-green-200 space-y-4">
      <div>
        <h3 className="text-base font-bold text-food-brown-800 flex items-center gap-2">
          <span>🎯</span> Maqsadingiz
        </h3>
        <p className="text-xs text-food-brown-600 mt-1">
          Biz kunlik kaloriya va makro targetlarni avtomatik hisoblaymiz
        </p>
      </div>

      {/* Goal type */}
      <div className="grid grid-cols-3 gap-2">
        {GOAL_OPTIONS.map((opt) => {
          const active = goal === opt.key;
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
      {goal !== "maintain" && (
        <>
          <div>
            <label className="text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
              <span>🎯</span> Maqsadli vazn (kg)
            </label>
            <input
              type="number"
              value={targetKg}
              onChange={(e) => setTargetKg(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder={goal === "lose" ? "Masalan: 65" : "Masalan: 75"}
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
                const active = pace === p.value;
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
              📅 Taxminiy yetish sanasi: <span className="font-bold">{eta}</span>
            </div>
          )}
        </div>
      )}

      {!ready && (
        <div className="bg-food-yellow-50 border border-food-yellow-300 rounded-xl p-3 text-sm text-food-brown-700">
          ⚠️ Maqsadni faollashtirish uchun yuqoridagi <b>Tana ma'lumotlari</b> bo'limini to'ldirib saqlang.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!ready || setupGoal.isPending}
        className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-food-green-500 to-food-green-600 hover:from-food-green-600 hover:to-food-green-700 disabled:from-gray-400 disabled:to-gray-500 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        {setupGoal.isPending ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Saqlanmoqda...</span>
          </>
        ) : (
          <>
            <span>💾</span>
            <span>Maqsadni saqlash</span>
          </>
        )}
      </button>
    </div>
  );
};

export default GoalPicker;
