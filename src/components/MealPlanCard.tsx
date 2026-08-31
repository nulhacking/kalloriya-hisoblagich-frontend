import type { MealSlot } from "../types";
import { useAddMeal } from "../hooks/useMeals";
import { useToast } from "./Toast";

interface MealPlanCardProps {
  plan: MealSlot[];
  /** Today's logged food names (lowercased, normalized) — for ✓ persistence */
  loggedNames: Set<string>;
}

/** Normalize a meal name for matching: lowercase, strip "(...)", trim. */
function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const MealPlanCard = ({ plan, loggedNames }: MealPlanCardProps) => {
  const addMeal = useAddMeal();
  const toast = useToast();

  const handleLog = async (
    name: string,
    kcal: number,
    protein: number,
    carbs: number,
    fat: number,
    alreadyDone: boolean,
  ) => {
    if (alreadyDone || addMeal.isPending) return;
    try {
      await addMeal.mutateAsync({
        food_name: name,
        weight_grams: 100,
        calories: kcal,
        protein,
        carbs,
        fat,
      });
      toast.success("Qo'shildi ✓");
      if (window.Telegram?.WebApp) {
        // @ts-expect-error — HapticFeedback may not be typed
        window.Telegram.WebApp.HapticFeedback?.impactOccurred?.("light");
      }
    } catch (err) {
      console.error(err);
      toast.error("Qo'shishda xatolik");
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-stone-900 flex items-center gap-2">
        Bugungi reja
      </h3>
      {plan.map((slot) => (
        <div
          key={slot.key}
          className="bg-white rounded-2xl p-4 border border-stone-200"
        >
          <div className="flex items-baseline justify-between mb-2">
            <div className="font-semibold text-stone-900 flex items-center gap-2">
              <span className="text-xl">{slot.icon}</span>
              <span>{slot.label}</span>
            </div>
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              ~{slot.target_kcal} kkal
            </div>
          </div>
          <div className="space-y-1.5">
            {slot.suggestions.map((s) => {
              const done = loggedNames.has(normalizeName(s.name));
              return (
                <button
                  key={s.name}
                  onClick={() => handleLog(s.name, s.kcal, s.protein, s.carbs, s.fat, done)}
                  disabled={done || addMeal.isPending}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all ${
                    done
                      ? "bg-emerald-50 border-stone-200 text-emerald-700"
                      : "bg-stone-50 border-stone-200 hover:bg-amber-50 hover:border-amber-200 text-stone-700"
                  }`}
                >
                  <span className="text-sm font-medium flex items-center gap-2 text-left">
                    {done ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-semibold flex-shrink-0">✓</span>
                    ) : (
                      <span className="text-stone-400">+</span>
                    )}
                    <span className={done ? "line-through opacity-70" : ""}>{s.name}</span>
                  </span>
                  <span className="text-xs font-semibold flex-shrink-0">{s.kcal} kkal</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MealPlanCard;
