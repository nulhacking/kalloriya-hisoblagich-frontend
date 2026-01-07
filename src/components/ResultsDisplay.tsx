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
    <div className="mt-8 space-y-6 animate-fade-in-up">
      {/* Food Name and Confidence */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-blue-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/50 to-transparent opacity-50"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold capitalize mb-3 drop-shadow-lg">
              {food === "noma'lum" || food === "unknown"
                ? "❓ Noma'lum ovqat"
                : `🍽️ ${food}`}
            </h2>
            {food !== "noma'lum" && food !== "unknown" && (
              <p className="text-primary-100 text-base font-medium">
                AI ishonch darajasi: <span className="font-bold text-white">{Math.round(confidence * 100)}%</span>
              </p>
            )}
          </div>
          {food !== "noma'lum" && food !== "unknown" && (
            <div
              className={`px-5 py-3 rounded-full font-bold text-sm shadow-lg transform hover:scale-110 transition-transform ${getConfidenceColor(
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
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span className="text-3xl">🥗</span>
            Ingredientlar
          </h3>
          <div className="flex flex-wrap gap-3">
            {ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-full text-sm font-semibold capitalize shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Weight */}
      {estimated_weight_grams && estimated_weight_grams > 0 && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-5 shadow-lg">
          <p className="text-purple-900 font-bold text-lg flex items-center gap-2">
            <span className="text-2xl">📏</span>
            Taxminiy og'irlik:{" "}
            <span className="text-2xl text-purple-700">
              {Math.round(estimated_weight_grams)} gramm
            </span>
          </p>
        </div>
      )}

      {/* Total Nutrition (for the full portion) */}
      {total_nutrition && Object.keys(total_nutrition).length > 0 && (
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">📊</span>
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
                gradient: "from-red-400 to-orange-500",
              },
              {
                label: "Oqsil",
                value: total_nutrition.oqsil,
                unit: "g",
                icon: "🥩",
                gradient: "from-purple-400 to-pink-500",
              },
              {
                label: "Uglevodlar",
                value: total_nutrition.carbs,
                unit: "g",
                icon: "🍞",
                gradient: "from-yellow-400 to-orange-500",
              },
              {
                label: "Yog'",
                value: total_nutrition.fat,
                unit: "g",
                icon: "🧈",
                gradient: "from-blue-400 to-cyan-500",
              },
            ].map((item, index) => (
              <div
                key={item.label}
                className="group relative overflow-hidden bg-white rounded-xl p-5 text-center border-2 border-gray-200 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <div className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {item.value !== undefined ? item.value : "N/A"}
                </div>
                <div className="text-sm text-gray-700 mt-1 font-bold uppercase tracking-wide">
                  {item.label}
                </div>
                {item.value !== undefined && (
                  <div className="text-xs text-gray-500 mt-1 font-medium">
                    {item.unit}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition Information per 100g */}
      {Object.keys(nutrition_per_100g).length > 0 ? (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">⚖️</span>
            100g uchun kaloriya
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nutritionItems.map((item, index) => (
              <div
                key={item.label}
                className="group relative overflow-hidden bg-white rounded-xl p-5 text-center border-2 border-gray-200 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <div className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {item.value !== undefined ? item.value : "N/A"}
                </div>
                <div className="text-sm text-gray-700 mt-1 font-bold uppercase tracking-wide">
                  {item.label}
                </div>
                {item.value !== undefined && (
                  <div className="text-xs text-gray-500 mt-1 font-medium">
                    {item.unit}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-5 shadow-lg">
          <p className="text-yellow-900 font-semibold flex items-center gap-2 text-lg">
            <span className="text-2xl">⚠️</span>
            Bu ovqat uchun kaloriya ma'lumotlari mavjud emas.
          </p>
        </div>
      )}

      {/* Note */}
      {note && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-5 shadow-lg">
          <p className="text-blue-900 font-medium flex items-start gap-2">
            <span className="text-xl">ℹ️</span>
            <span>{note}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
