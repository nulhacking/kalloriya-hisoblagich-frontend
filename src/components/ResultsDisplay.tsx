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
    if (conf >= 0.7) return "text-green-600 bg-green-50";
    if (conf >= 0.4) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
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
  }

  const nutritionItems: NutritionItem[] = [
    {
      label: "Kaloriya",
      value: nutrition_per_100g.calories,
      unit: "kkal",
      icon: "🔥",
    },
    {
      label: "Oqsil",
      value: nutrition_per_100g.oqsil,
      unit: "g",
      icon: "🥩",
    },
    {
      label: "Uglevodlar",
      value: nutrition_per_100g.carbs,
      unit: "g",
      icon: "🍞",
    },
    { label: "Yog'", value: nutrition_per_100g.fat, unit: "g", icon: "🧈" },
  ];

  return (
    <div className="mt-8 space-y-6">
      {/* Food Name and Confidence */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold capitalize mb-2">
              {food === "noma'lum" || food === "unknown"
                ? "❓ Noma'lum ovqat"
                : `🍽️ ${food}`}
            </h2>
            {food !== "noma'lum" && food !== "unknown" && (
              <p className="text-primary-100 text-sm">
                AI ishonch darajasi: {Math.round(confidence * 100)}%
              </p>
            )}
          </div>
          {food !== "noma'lum" && food !== "unknown" && (
            <div
              className={`px-4 py-2 rounded-full font-semibold ${getConfidenceColor(
                confidence
              )}`}
            >
              {getConfidenceLabel(confidence)} ishonch
            </div>
          )}
        </div>
      </div>

      {/* Ingredients */}
      {ingredients && ingredients.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Ingredientlar
          </h3>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium capitalize"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Weight */}
      {estimated_weight_grams && estimated_weight_grams > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-medium">
            📏 Taxminiy og'irlik:{" "}
            <span className="font-bold">
              {Math.round(estimated_weight_grams)} gramm
            </span>
          </p>
        </div>
      )}

      {/* Total Nutrition (for the full portion) */}
      {total_nutrition && Object.keys(total_nutrition).length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Umumiy kaloriya (taxminiy{" "}
            {estimated_weight_grams
              ? Math.round(estimated_weight_grams) + "g"
              : "porsiya"}{" "}
            uchun)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Kaloriya",
                value: total_nutrition.calories,
                unit: "kkal",
                icon: "🔥",
              },
              {
                label: "Oqsil",
                value: total_nutrition.oqsil,
                unit: "g",
                icon: "🥩",
              },
              {
                label: "Uglevodlar",
                value: total_nutrition.carbs,
                unit: "g",
                icon: "🍞",
              },
              {
                label: "Yog'",
                value: total_nutrition.fat,
                unit: "g",
                icon: "🧈",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-primary-50 rounded-lg p-4 text-center border-2 border-primary-200"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-2xl font-bold text-primary-800">
                  {item.value !== undefined ? item.value : "N/A"}
                </div>
                <div className="text-sm text-gray-700 mt-1 font-medium">
                  {item.label}
                </div>
                {item.value !== undefined && (
                  <div className="text-xs text-gray-600 mt-1">{item.unit}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition Information per 100g */}
      {Object.keys(nutrition_per_100g).length > 0 ? (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            100g uchun kaloriya
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nutritionItems.map((item) => (
              <div
                key={item.label}
                className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-2xl font-bold text-gray-800">
                  {item.value !== undefined ? item.value : "N/A"}
                </div>
                <div className="text-sm text-gray-600 mt-1">{item.label}</div>
                {item.value !== undefined && (
                  <div className="text-xs text-gray-500 mt-1">{item.unit}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            ⚠️ Bu ovqat uchun kaloriya ma'lumotlari mavjud emas.
          </p>
        </div>
      )}

      {/* Note */}
      {note && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">ℹ️ {note}</p>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
