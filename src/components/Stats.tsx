import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useFoodStats, useDateRangeStats } from "../hooks/useMeals";
import {
  RangeStatsSkeleton,
  FoodStatsListSkeleton,
  DailyChartSkeleton,
} from "./Skeleton";

const Stats = () => {
  const { user } = useAuth();
  const [days, setDays] = useState(30);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(monthAgo.toISOString().split("T")[0]);
  }, []);

  // React Query hooks
  const {
    data: foodStats = [],
    isLoading: foodStatsInitialLoading,
    isFetching: foodStatsFetching,
    error: foodStatsError,
  } = useFoodStats(days, 10);

  const {
    data: rangeStats,
    isLoading: rangeStatsInitialLoading,
    isFetching: rangeStatsFetching,
    error: rangeStatsError,
  } = useDateRangeStats(startDate, endDate);

  // Show skeleton on initial load or when fetching (for better UX)
  const foodStatsLoading = foodStatsInitialLoading || foodStatsFetching;
  const rangeStatsLoading = rangeStatsInitialLoading || rangeStatsFetching;
  
  const error = foodStatsError || rangeStatsError;

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-food-brown-800 flex items-center justify-center gap-2">
          <span>📊</span>
          Statistika
        </h2>
        <p className="text-food-brown-600 text-sm mt-1">
          Ovqatlanish tahlili va statistikasi
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-food-green-100">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-bold text-food-brown-700 mb-2">
              Boshlanish sanasi
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-food-green-200 focus:border-food-green-500 outline-none text-food-brown-800"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-food-brown-700 mb-2">
              Tugash sanasi
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-food-green-200 focus:border-food-green-500 outline-none text-food-brown-800"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm font-bold text-food-brown-700">
            Ovqatlar statistikasi uchun:
          </label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border-2 border-food-green-200 focus:border-food-green-500 outline-none text-food-brown-800 font-bold"
          >
            <option value={7}>7 kun</option>
            <option value={14}>14 kun</option>
            <option value={30}>30 kun</option>
            <option value={60}>60 kun</option>
            <option value={90}>90 kun</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-food-red-50 rounded-xl p-4 border border-food-red-200">
          <p className="text-food-red-700 font-medium">
            {error instanceof Error ? error.message : "Xatolik yuz berdi"}
          </p>
        </div>
      )}

      {/* Overall Statistics */}
      {rangeStatsLoading ? (
        <RangeStatsSkeleton />
      ) : (
        <>
          {rangeStats && (
            <div className="bg-gradient-to-br from-food-orange-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-orange-200">
              <h3 className="font-bold text-food-brown-800 mb-3 flex items-center gap-2">
                <span>📈</span>
                Umumiy statistika ({formatDate(rangeStats.start_date)} -{" "}
                {formatDate(rangeStats.end_date)})
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white rounded-xl p-3">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="font-extrabold text-food-red-600 text-xl">
                    {Math.round(rangeStats.total_calories)}
                  </div>
                  <div className="text-xs text-food-brown-500">
                    Jami kaloriya
                  </div>
                  <div className="text-xs text-food-brown-400 mt-1">
                    O'rtacha: {Math.round(rangeStats.avg_calories)}/kun
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="text-2xl mb-1">🍽️</div>
                  <div className="font-extrabold text-food-green-600 text-xl">
                    {rangeStats.total_meals}
                  </div>
                  <div className="text-xs text-food-brown-500">Jami ovqat</div>
                  <div className="text-xs text-food-brown-400 mt-1">
                    {rangeStats.days_count} kun davomida
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-sm">🥩</div>
                  <div className="font-bold text-food-green-600">
                    {Math.round(rangeStats.avg_protein)}g
                  </div>
                  <div className="text-xs text-food-brown-500">
                    O'rtacha oqsil
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-sm">🍞</div>
                  <div className="font-bold text-food-yellow-600">
                    {Math.round(rangeStats.avg_carbs)}g
                  </div>
                  <div className="text-xs text-food-brown-500">
                    O'rtacha uglevod
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-sm">🧈</div>
                  <div className="font-bold text-food-orange-600">
                    {Math.round(rangeStats.avg_fat)}g
                  </div>
                  <div className="text-xs text-food-brown-500">
                    O'rtacha yog'
                  </div>
                </div>
              </div>

              {/* Goal comparison */}
              {user && (
                <div className="mt-3 pt-3 border-t border-food-orange-200">
                  <h4 className="text-sm font-bold text-food-brown-700 mb-2">
                    Maqsadga nisbatan:
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Kaloriya</span>
                        <span>
                          {Math.round(rangeStats.avg_calories)} /{" "}
                          {user.daily_calorie_goal}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            rangeStats.avg_calories > user.daily_calorie_goal
                              ? "bg-food-red-500"
                              : "bg-food-green-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (rangeStats.avg_calories /
                                user.daily_calorie_goal) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Top Foods */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-food-green-100">
            <h3 className="font-bold text-food-brown-800 mb-3 flex items-center gap-2">
              <span>🏆</span>
              Eng ko'p yedim ovqatlar (oxirgi {days} kun)
            </h3>

            {foodStatsLoading ? (
              <FoodStatsListSkeleton />
            ) : foodStats.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🍽️</div>
                <p className="text-food-brown-600 font-medium">
                  Ma'lumotlar topilmadi
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {foodStats.map((food, index) => (
                  <div
                    key={food.food_name}
                    className="bg-gradient-to-r from-food-green-50 to-food-yellow-50 rounded-xl p-3 border border-food-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-food-green-200 flex items-center justify-center font-bold text-food-green-700">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-food-brown-800 capitalize">
                            {food.food_name}
                          </p>
                          <p className="text-xs text-food-brown-500">
                            {food.times_eaten} marta yedim
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-food-red-600">
                          {Math.round(food.total_calories)} kkal
                        </p>
                        <p className="text-xs text-food-brown-500">
                          O'rtacha: {Math.round(food.avg_calories_per_meal)}
                          /marta
                        </p>
                        <p className="text-xs text-food-brown-400">
                          Jami: {Math.round(food.total_weight)}g
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Breakdown Chart */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-food-green-100">
            <h3 className="font-bold text-food-brown-800 mb-3 flex items-center gap-2">
              <span>📉</span>
              Kunlik kaloriya grafigi
            </h3>
            {rangeStatsLoading ? (
              <DailyChartSkeleton />
            ) : rangeStats && rangeStats.days.length > 0 ? (
              <div className="space-y-2">
                {rangeStats.days.map((day) => {
                  const maxCalories = Math.max(
                    ...rangeStats.days.map((d) => d.total_calories),
                    user?.daily_calorie_goal || 2000
                  );
                  const percent = (day.total_calories / maxCalories) * 100;
                  const goalPercent =
                    user && day.total_calories > 0
                      ? (day.total_calories / user.daily_calorie_goal) * 100
                      : 0;

                  return (
                    <div key={day.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-food-brown-700">
                          {new Date(day.date + "T00:00:00").toLocaleDateString(
                            "uz-UZ",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                        <span className="font-bold text-food-brown-800">
                          {Math.round(day.total_calories)} kkal
                        </span>
                      </div>
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full ${
                            goalPercent > 100
                              ? "bg-food-red-500"
                              : goalPercent > 80
                              ? "bg-food-orange-500"
                              : "bg-food-green-500"
                          } transition-all`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        ></div>
                        {user && (
                          <div
                            className="absolute top-0 h-full w-0.5 bg-food-blue-500"
                            style={{
                              left: `${
                                (user.daily_calorie_goal / maxCalories) * 100
                              }%`,
                            }}
                            title={`Maqsad: ${user.daily_calorie_goal} kkal`}
                          ></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-food-brown-600 font-medium">
                  Ma'lumotlar topilmadi
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Stats;
