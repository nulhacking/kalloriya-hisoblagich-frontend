import { useState } from "react";
import type { ExerciseSuggestion } from "../types";
import { useAddCustomActivity } from "../hooks/useActivities";
import { useToast } from "./Toast";

interface ExercisePlanCardProps {
  exercise: ExerciseSuggestion | null;
}

const ExercisePlanCard = ({ exercise }: ExercisePlanCardProps) => {
  const [done, setDone] = useState(false);
  const addCustom = useAddCustomActivity();
  const toast = useToast();

  if (!exercise) return null;

  const isRest = exercise.intensity === "rest";

  const handleDone = async () => {
    if (done || isRest) return;
    try {
      await addCustom.mutateAsync({
        name: exercise.name,
        calories_burned: exercise.kcal,
        duration_minutes: exercise.minutes,
      });
      setDone(true);
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
    <div className="bg-gradient-to-br from-food-orange-50 to-food-red-50 rounded-2xl p-4 border-2 border-food-orange-200">
      <h3 className="font-extrabold text-food-brown-800 flex items-center gap-2 mb-3">
        <span>🏋️</span> Bugungi mashq
      </h3>
      <div className="bg-white/95 rounded-2xl p-4 flex items-center gap-3">
        <div className="text-4xl">{exercise.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-food-brown-800">{exercise.name}</div>
          {!isRest && (
            <div className="text-xs text-food-brown-600 mt-0.5">
              ⏱ {exercise.minutes} daq • 🔥 ~{exercise.kcal} kkal
            </div>
          )}
          <div className="text-[11px] text-food-brown-500 mt-1">{exercise.note}</div>
        </div>
        {!isRest && (
          <button
            onClick={handleDone}
            disabled={done || addCustom.isPending}
            className={`px-3 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
              done
                ? "bg-food-green-100 text-food-green-700"
                : "bg-gradient-to-r from-food-orange-500 to-food-red-500 text-white shadow-md hover:from-food-orange-600 hover:to-food-red-600"
            }`}
          >
            {done ? "✓" : addCustom.isPending ? "..." : "Bajardim"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExercisePlanCard;
