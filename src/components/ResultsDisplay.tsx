import type { AnalysisResults } from "../types";

interface ResultsDisplayProps {
  results: AnalysisResults;
}

const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  const {
    food,
    confidence,
    ingredients,
    estimated_weight_grams,
    nutrition_per_100g,
    total_nutrition,
    note,
  } = results;

  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.7) return "text-food-green-700 bg-food-green-100 border-food-green-300";
    if (conf >= 0.4) return "text-food-yellow-700 bg-food-yellow-100 border-food-yellow-300";
    return "text-food-red-700 bg-food-red-100 border-food-red-300";
  };

  const getConfidenceLabel = (conf: number): string => {
    if (conf >= 0.7) return "Yuqori";
    if (conf >= 0.4) return "O'rtacha";
    return "Past";
  };

  interface NutritionItem {
    label: string;
    value: number | undefined;
    unit: string;
    icon: string;
    color: string;
  }

  const nutritionItems: NutritionItem[] = [
    {
      label: "Kaloriya",
      value: nutrition_per_100g.calories,
      unit: "kkal",
      icon: "🔥",
      color: "from-food-red-400 to-food-orange-500",
    },
    {
      label: "Oqsil",
      value: nutrition_per_100g.oqsil,
      unit: "g",
      icon: "🥩",
      color: "from-food-red-500 to-food-red-600",
    },
    {
      label: "Uglevodlar",
      value: nutrition_per_100g.carbs,
      unit: "g",
      icon: "🍞",
      color: "from-food-yellow-400 to-food-orange-500",
    },
    {
      label: "Yog'",
      value: nutrition_per_100g.fat,
      unit: "g",
      icon: "🧈",
      color: "from-food-yellow-500 to-food-yellow-600",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Food Name and Confidence */}
      <div className="relative overflow-hidden bg-gradient-to-r from-food-green-500 via-food-green-600 to-food-green-500 rounded-2xl p-4 md:p-5 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-extrabold capitalize mb-2">
            {food === "noma'lum" || food === "unknown"
              ? "❓ Noma'lum ovqat"
              : `🍽️ ${food}`}
          </h2>
          {food !== "noma'lum" && food !== "unknown" && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-food-green-100 text-sm">
                AI ishonch: <span className="font-bold text-white">{Math.round(confidence * 100)}%</span>
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getConfidenceColor(confidence)}`}
              >
                {getConfidenceLabel(confidence)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ingredients */}
      {ingredients && ingredients.length > 0 && (
        <div className="bg-gradient-to-br from-food-green-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-green-200">
          <h3 className="text-base md:text-lg font-bold text-food-brown-800 mb-3 flex items-center gap-2">
            <span>🥗</span> Ingredientlar
          </h3>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-gradient-to-r from-food-green-500 to-food-green-600 text-white rounded-full text-xs font-bold capitalize shadow-sm"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Weight */}
      {estimated_weight_grams && estimated_weight_grams > 0 && (
        <div className="bg-gradient-to-r from-food-orange-100 to-food-yellow-100 border-2 border-food-orange-300 rounded-2xl p-4">
          <p className="text-food-brown-800 font-bold text-sm md:text-base flex items-center gap-2">
            <span className="text-xl">📏</span>
            Taxminiy og'irlik:{" "}
            <span className="text-food-orange-600 text-lg">
              {Math.round(estimated_weight_grams)}g
            </span>
          </p>
        </div>
      )}

      {/* Total Nutrition */}
      {total_nutrition && Object.keys(total_nutrition).length > 0 && (
        <div className="bg-gradient-to-br from-food-orange-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-orange-200">
          <h3 className="text-base md:text-lg font-bold text-food-brown-800 mb-3 flex items-center gap-2">
            <span>📊</span>
            Umumiy ({estimated_weight_grams ? Math.round(estimated_weight_grams) + "g" : "porsiya"})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Kaloriya", value: total_nutrition.calories, unit: "kkal", icon: "🔥" },
              { label: "Oqsil", value: total_nutrition.oqsil, unit: "g", icon: "🥩" },
              { label: "Uglevodlar", value: total_nutrition.carbs, unit: "g", icon: "🍞" },
              { label: "Yog'", value: total_nutrition.fat, unit: "g", icon: "🧈" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-xl p-3 text-center border-2 border-food-orange-200 shadow-sm"
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xl md:text-2xl font-extrabold text-food-green-600">
                  {item.value !== undefined ? item.value : "N/A"}
                </div>
                <div className="text-xs text-food-brown-600 font-bold uppercase">
                  {item.label}
                </div>
                {item.value !== undefined && (
                  <div className="text-xs text-food-brown-400">{item.unit}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition per 100g */}
      {Object.keys(nutrition_per_100g).length > 0 ? (
        <div className="bg-gradient-to-br from-food-green-50 to-food-green-100 rounded-2xl p-4 border-2 border-food-green-200">
          <h3 className="text-base md:text-lg font-bold text-food-brown-800 mb-3 flex items-center gap-2">
            <span>⚖️</span> 100g uchun
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {nutritionItems.map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-xl p-3 text-center border-2 border-food-green-200 shadow-sm"
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xl md:text-2xl font-extrabold text-food-green-600">
                  {item.value !== undefined ? item.value : "N/A"}
                </div>
                <div className="text-xs text-food-brown-600 font-bold uppercase">
                  {item.label}
                </div>
                {item.value !== undefined && (
                  <div className="text-xs text-food-brown-400">{item.unit}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-food-yellow-100 to-food-orange-100 border-2 border-food-yellow-300 rounded-2xl p-4">
          <p className="text-food-brown-700 font-bold text-sm flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            Kaloriya ma'lumotlari mavjud emas.
          </p>
        </div>
      )}

      {/* Note */}
      {note && (
        <div className="bg-gradient-to-r from-food-green-100 to-food-yellow-100 border-2 border-food-green-300 rounded-2xl p-4">
          <p className="text-food-brown-700 font-medium text-sm flex items-start gap-2">
            <span className="text-lg">ℹ️</span>
            <span>{note}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
