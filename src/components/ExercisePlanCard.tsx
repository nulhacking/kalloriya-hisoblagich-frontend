import type { ExerciseSuggestion } from "../types";
import { useAddCustomActivity } from "../hooks/useActivities";
import { useToast } from "./Toast";

interface ExercisePlanCardProps {
  exercise: ExerciseSuggestion | null;
  /** Whether today's activities already include this exercise — for ✓ persistence */
  done: boolean;
}

const ExercisePlanCard = ({ exercise, done }: ExercisePlanCardProps) => {
  const addCustom = useAddCustomActivity();
  const toast = useToast();

  if (!exercise) return null;

  const isRest = exercise.intensity === "rest";

  const handleDone = async () => {
    if (done || isRest || addCustom.isPending) return;
    try {
      await addCustom.mutateAsync({
        name: exercise.name,
        calories_burned: exercise.kcal,
        duration_minutes: exercise.minutes,
      });
      toast.success("Mashq saqlandi 💪");
      if (window.Telegram?.WebApp) {
        // @ts-expect-error — HapticFeedback may not be typed
        window.Telegram.WebApp.HapticFeedback?.impactOccurred?.("medium");
      }
    } catch (err) {
      console.error(err);
      toast.error("Saqlashda xatolik");
    }
  };

  return (
    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
      <h3 className="font-semibold text-stone-900 flex items-center gap-2 mb-3">
        Bugungi mashq
      </h3>
      <div
        className={`bg-white rounded-2xl p-4 flex items-center gap-3 transition-all ${
          done ? "opacity-90" : ""
        }`}
      >
        <div className="text-4xl">{done ? "✅" : exercise.icon}</div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold ${done ? "text-emerald-700 line-through opacity-70" : "text-stone-900"}`}>
            {exercise.name}
          </div>
          {!isRest && (
            <div className="text-xs text-stone-600 mt-0.5">
              ⏱ {exercise.minutes} daq • 🔥 ~{exercise.kcal} kkal
            </div>
          )}
          <div className="text-[11px] text-stone-500 mt-1">{exercise.note}</div>
        </div>
        {!isRest && (
          <button
            onClick={handleDone}
            disabled={done || addCustom.isPending}
            className={`px-3 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
              done
                ? "bg-emerald-600 text-white"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {done ? "✓ Bajarildi" : addCustom.isPending ? "..." : "Bajardim"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExercisePlanCard;
