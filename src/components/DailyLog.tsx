import type { DailyLog as DailyLogType, UserSettings } from "../types";

interface DailyLogProps {
  dailyLog: DailyLogType;
  settings: UserSettings;
  onDeleteMeal: (mealId: string) => void;
}

const DailyLogComponent = ({
  dailyLog,
  settings,
  onDeleteMeal,
}: DailyLogProps) => {
  const { meals, totalCalories, totalOqsil, totalCarbs, totalFat } = dailyLog;

  const getProgressColor = (current: number, goal: number): string => {
    const percent = (current / goal) * 100;
    if (percent >= 100) return "bg-food-red-500";
    if (percent >= 80) return "bg-food-orange-500";
    return "bg-food-green-500";
  };

  const getProgressPercent = (current: number, goal: number): number => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Bugungi sana */}
      <div className="text-center mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-food-brown-800 flex items-center justify-center gap-2">
          <span>📅</span>
          Bugungi ovqatlanish
        </h2>
        <p className="text-food-brown-600 text-sm mt-1">
          {new Date().toLocaleDateString("uz-UZ", {
            weekday: "long",
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Umumiy statistika */}
      <div className="bg-gradient-to-br from-food-green-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-green-200">
        <h3 className="text-base font-bold text-food-brown-800 mb-3 flex items-center gap-2">
          <span>📊</span> Kunlik statistika
        </h3>

        {/* Kaloriya progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-bold text-food-brown-700 flex items-center gap-1">
              <span>🔥</span> Kaloriya
            </span>
            <span className="text-sm font-bold text-food-brown-600">
              {Math.round(totalCalories)} / {settings.dailyCalorieGoal} kkal
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(
                totalCalories,
                settings.dailyCalorieGoal
              )} transition-all duration-500 rounded-full`}
              style={{
                width: `${getProgressPercent(
                  totalCalories,
                  settings.dailyCalorieGoal
                )}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Boshqa nutrientlar */}
        <div className="grid grid-cols-3 gap-2">
          {/* Oqsil */}
          <div className="bg-white rounded-xl p-2 text-center border border-food-green-200">
            <div className="text-lg">🥩</div>
            <div className="text-base font-extrabold text-food-green-600">
              {Math.round(totalOqsil)}g
            </div>
            <div className="text-xs text-food-brown-500">
              / {settings.dailyOqsilGoal}g
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${getProgressColor(
                  totalOqsil,
                  settings.dailyOqsilGoal
                )} transition-all duration-500`}
                style={{
                  width: `${getProgressPercent(
                    totalOqsil,
                    settings.dailyOqsilGoal
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Uglevodlar */}
          <div className="bg-white rounded-xl p-2 text-center border border-food-yellow-200">
            <div className="text-lg">🍞</div>
            <div className="text-base font-extrabold text-food-yellow-600">
              {Math.round(totalCarbs)}g
            </div>
            <div className="text-xs text-food-brown-500">
              / {settings.dailyCarbsGoal}g
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${getProgressColor(
                  totalCarbs,
                  settings.dailyCarbsGoal
                )} transition-all duration-500`}
                style={{
                  width: `${getProgressPercent(
                    totalCarbs,
                    settings.dailyCarbsGoal
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Yog' */}
          <div className="bg-white rounded-xl p-2 text-center border border-food-orange-200">
            <div className="text-lg">🧈</div>
            <div className="text-base font-extrabold text-food-orange-600">
              {Math.round(totalFat)}g
            </div>
            <div className="text-xs text-food-brown-500">
              / {settings.dailyFatGoal}g
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${getProgressColor(
                  totalFat,
                  settings.dailyFatGoal
                )} transition-all duration-500`}
                style={{
                  width: `${getProgressPercent(
                    totalFat,
                    settings.dailyFatGoal
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Ovqatlar ro'yxati */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-food-green-100">
        <h3 className="text-base font-bold text-food-brown-800 mb-3 flex items-center gap-2">
          <span>🍽️</span> Bugungi ovqatlar ({meals.length})
        </h3>

        {meals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🍳</div>
            <p className="text-food-brown-600 font-medium">
              Hali ovqat qo'shilmagan
            </p>
            <p className="text-food-brown-400 text-sm mt-1">
              Bosh sahifadan ovqat tahlil qiling
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-gradient-to-r from-food-green-50 to-food-yellow-50 rounded-xl p-3 border border-food-green-200 relative"
              >
                <div className="flex items-start gap-3">
                  {/* Rasm yoki icon */}
                  {meal.imagePreview ? (
                    <img
                      src={meal.imagePreview}
                      alt={meal.food}
                      className="w-14 h-14 rounded-lg object-cover border-2 border-food-green-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-food-green-200 flex items-center justify-center text-2xl">
                      🍽️
                    </div>
                  )}

                  {/* Ma'lumotlar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-food-brown-800 capitalize truncate pr-2">
                        {meal.food}
                      </h4>
                      <span className="text-xs text-food-brown-500 whitespace-nowrap pr-8">
                        {formatTime(meal.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-food-brown-500 mt-0.5">
                      {meal.weight_grams}g
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 bg-food-red-100 text-food-red-700 rounded-full text-xs font-bold">
                        🔥 {Math.round(meal.calories)} kkal
                      </span>
                      <span className="px-2 py-0.5 bg-food-green-100 text-food-green-700 rounded-full text-xs font-medium">
                        {Math.round(meal.oqsil)}g oqsil
                      </span>
                    </div>
                  </div>

                  {/* O'chirish tugmasi */}
                  <button
                    onClick={() => onDeleteMeal(meal.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-food-red-100 hover:bg-food-red-200 text-food-red-600 flex items-center justify-center transition-colors"
                    title="O'chirish"
                  >
                    <span className="text-sm">✕</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Qolgan kaloriya */}
      {settings.dailyCalorieGoal - totalCalories > 0 ? (
        <div className="bg-gradient-to-r from-food-green-100 to-food-green-200 border-2 border-food-green-300 rounded-2xl p-4 text-center">
          <p className="text-food-green-800 font-bold flex items-center justify-center gap-2">
            <span className="text-xl">✨</span>
            <span>
              Yana{" "}
              <span className="text-food-green-600 text-lg">
                {Math.round(settings.dailyCalorieGoal - totalCalories)}
              </span>{" "}
              kkal yeyishingiz mumkin
            </span>
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-food-red-100 to-food-orange-100 border-2 border-food-red-300 rounded-2xl p-4 text-center">
          <p className="text-food-red-800 font-bold flex items-center justify-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>
              Kunlik limitingiz{" "}
              <span className="text-food-red-600 text-lg">
                {Math.round(totalCalories - settings.dailyCalorieGoal)}
              </span>{" "}
              kkal ga oshib ketdi
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyLogComponent;
