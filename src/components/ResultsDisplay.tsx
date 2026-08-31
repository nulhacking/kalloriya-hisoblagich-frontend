import { useState } from "react";
import type { AnalysisResults } from "../types";
import MealAdviceCard from "./MealAdviceCard";
import { useToast } from "./Toast";

interface ResultsDisplayProps {
  results: AnalysisResults;
  onAddMeal?: (results: AnalysisResults) => void;
  /** Pro Plus emas — maslahat kartochkasida murabbiy taklifi ko'rsatiladi. */
  showCoachUpsell?: boolean;
  onOpenCoach?: () => void;
}

/** Bitta oziqa ustuni — raqam katta, yorliq kichik. */
const NutritionCell = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | undefined;
  unit: string;
}) => (
  <div className="px-3 py-2.5">
    <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
      {label}
    </div>
    <div className="mt-0.5 flex items-baseline gap-1">
      <span className="text-lg font-semibold text-stone-900 tabular">
        {value !== undefined ? Math.round(value) : "—"}
      </span>
      {value !== undefined && (
        <span className="text-xs text-stone-400">{unit}</span>
      )}
    </div>
  </div>
);

const ResultsDisplay = ({
  results,
  onAddMeal,
  showCoachUpsell = false,
  onOpenCoach,
}: ResultsDisplayProps) => {
  const [added, setAdded] = useState(false);
  const toast = useToast();

  const {
    food,
    confidence,
    ingredients,
    estimated_weight_grams,
    nutrition_per_100g,
    total_nutrition,
    note,
    advice,
  } = results;

  const handleAddMeal = () => {
    if (onAddMeal && !added) {
      onAddMeal(results);
      setAdded(true);
      toast.success("Kunlik hisobga qo'shildi");
    }
  };

  // Ishonch darajasi — bitta neytral nishoncha, past bo'lsagina ogohlantiradi.
  const confidenceTone =
    confidence >= 0.7
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : confidence >= 0.4
        ? "bg-stone-100 text-stone-600 border-stone-200"
        : "bg-amber-50 text-amber-700 border-amber-200";
  const confidenceLabel =
    confidence >= 0.7 ? "Yuqori" : confidence >= 0.4 ? "O'rtacha" : "Past";

  const isUnknown = food === "noma'lum" || food === "unknown";
  const portionLabel = estimated_weight_grams
    ? `${Math.round(estimated_weight_grams)} g`
    : "porsiya";

  const hasTotals = total_nutrition && Object.keys(total_nutrition).length > 0;
  const hasPer100 = Object.keys(nutrition_per_100g).length > 0;

  return (
    <div className="space-y-3">
      {/* Sarlavha — nima topildi va qanchalik ishonchli */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Tahlil natijasi
            </div>
            <h2 className="text-lg font-semibold text-stone-900 capitalize leading-tight mt-0.5 truncate">
              {isUnknown ? "Noma'lum ovqat" : food}
            </h2>
            {estimated_weight_grams && estimated_weight_grams > 0 && (
              <p className="text-xs text-stone-500 mt-1">
                Taxminiy og'irlik:{" "}
                <span className="tabular">{portionLabel}</span>
              </p>
            )}
          </div>
          {!isUnknown && (
            <span
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${confidenceTone}`}
            >
              {confidenceLabel} · {Math.round(confidence * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* "Yeysizmi?" + yegandan keyingi reja — eng muhim javob, raqamlardan oldin. */}
      {advice && (
        <MealAdviceCard
          advice={advice}
          showCoachUpsell={showCoachUpsell}
          onOpenCoach={onOpenCoach}
        />
      )}

      {/* Raqamlar — porsiya va 100 g bitta kartada, ikkita bo'limda */}
      {(hasTotals || hasPer100) && (
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
          {hasTotals && total_nutrition && (
            <div>
              <div className="px-4 pt-3.5 pb-1 text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                Umumiy · {portionLabel}
              </div>
              <div className="grid grid-cols-2 divide-x divide-stone-100 border-b border-stone-100">
                <div className="divide-y divide-stone-100">
                  <NutritionCell
                    label="Kaloriya"
                    value={total_nutrition.calories}
                    unit="kkal"
                  />
                  <NutritionCell
                    label="Uglevod"
                    value={total_nutrition.carbs}
                    unit="g"
                  />
                </div>
                <div className="divide-y divide-stone-100">
                  <NutritionCell
                    label="Oqsil"
                    value={total_nutrition.oqsil}
                    unit="g"
                  />
                  <NutritionCell
                    label="Yog'"
                    value={total_nutrition.fat}
                    unit="g"
                  />
                </div>
              </div>
            </div>
          )}

          {hasPer100 && (
            <div>
              <div className="px-4 pt-3.5 pb-1 text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                100 g uchun
              </div>
              <div className="grid grid-cols-2 divide-x divide-stone-100">
                <div className="divide-y divide-stone-100">
                  <NutritionCell
                    label="Kaloriya"
                    value={nutrition_per_100g.calories}
                    unit="kkal"
                  />
                  <NutritionCell
                    label="Uglevod"
                    value={nutrition_per_100g.carbs}
                    unit="g"
                  />
                </div>
                <div className="divide-y divide-stone-100">
                  <NutritionCell
                    label="Oqsil"
                    value={nutrition_per_100g.oqsil}
                    unit="g"
                  />
                  <NutritionCell
                    label="Yog'"
                    value={nutrition_per_100g.fat}
                    unit="g"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!hasPer100 && !hasTotals && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-600">
            Kaloriya ma'lumotlari aniqlanmadi.
          </p>
        </div>
      )}

      {/* Ingredientlar */}
      {ingredients && ingredients.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-2">
            Ingredientlar
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="px-2.5 py-1 rounded-full border border-stone-200 bg-stone-50 text-xs text-stone-700 capitalize"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      )}

      {note && (
        <p className="text-xs text-stone-500 leading-relaxed px-1">{note}</p>
      )}

      {onAddMeal && (
        <button
          onClick={handleAddMeal}
          disabled={added}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors active:scale-[0.99] ${
            added
              ? "bg-stone-100 text-stone-500 cursor-default"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {added ? "Kunlik hisobga qo'shildi" : "Tanovul qildim"}
        </button>
      )}
    </div>
  );
};

export default ResultsDisplay;
