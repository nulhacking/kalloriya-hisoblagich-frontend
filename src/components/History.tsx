import { useState, useEffect } from "react";
import { useHistory, useDateRangeStats, useLogByDate } from "../hooks/useMeals";
import type { DailyLogResponse } from "../types";
import LoadingSpinner from "./LoadingSpinner";

const History = () => {
  const [viewMode, setViewMode] = useState<"list" | "range">("list");
  const [days, setDays] = useState(7);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDayLog, setSelectedDayLog] = useState<DailyLogResponse | null>(null);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(weekAgo.toISOString().split("T")[0]);
  }, []);

  // React Query hooks
  const {
    data: history = [],
    isLoading: historyLoading,
    error: historyError,
  } = useHistory(viewMode === "list" ? days : 0);

  const {
    data: rangeStats,
    isLoading: rangeStatsLoading,
    error: rangeStatsError,
    refetch: refetchRangeStats,
  } = useDateRangeStats(
    viewMode === "range" && startDate && endDate ? startDate : "",
    viewMode === "range" && startDate && endDate ? endDate : ""
  );

  const {
    data: dateLogData,
    isLoading: dateLogLoading,
  } = useLogByDate(selectedDate);

  // Update selected day log when data changes
  useEffect(() => {
    if (dateLogData) {
      setSelectedDayLog(dateLogData);
    }
  }, [dateLogData]);

  const loading = historyLoading || rangeStatsLoading || dateLogLoading;
  const error = historyError || rangeStatsError;

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("uz-UZ", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLoadDateLog = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-food-brown-800 flex items-center justify-center gap-2">
          <span>📅</span>
          Tarix
        </h2>
        <p className="text-food-brown-600 text-sm mt-1">
          O'tgan kunlardagi ovqatlanish ma'lumotlari
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-food-green-100">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 py-2 px-4 rounded-xl font-bold transition-all ${
              viewMode === "list"
                ? "bg-gradient-to-r from-food-green-500 to-food-green-600 text-white"
                : "bg-food-green-100 text-food-green-700 hover:bg-food-green-200"
            }`}
          >
            📋 Ro'yxat
          </button>
          <button
            onClick={() => setViewMode("range")}
            className={`flex-1 py-2 px-4 rounded-xl font-bold transition-all ${
              viewMode === "range"
                ? "bg-gradient-to-r from-food-green-500 to-food-green-600 text-white"
                : "bg-food-green-100 text-food-green-700 hover:bg-food-green-200"
            }`}
          >
            📊 Sana oraliq
          </button>
        </div>

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-food-brown-700">
                Oxirgi kunlar:
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

            {historyLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="bg-food-red-50 rounded-xl p-4 border border-food-red-200">
                <p className="text-food-red-700 font-medium">
                  {error instanceof Error ? error.message : "Xatolik yuz berdi"}
                </p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-food-brown-600 font-medium">
                  Ma'lumotlar topilmadi
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((day) => (
                  <div
                    key={day.id}
                    onClick={() => handleLoadDateLog(day.date)}
                    className="bg-gradient-to-r from-food-green-50 to-food-yellow-50 rounded-xl p-4 border border-food-green-200 hover:border-food-green-400 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-food-brown-800">
                          {formatDate(day.date)}
                        </p>
                        <p className="text-xs text-food-brown-500 mt-1">
                          {day.meal_count} ta ovqat
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-food-green-600 text-lg">
                          {Math.round(day.total_calories)} kkal
                        </p>
                        <div className="flex gap-2 mt-1 text-xs text-food-brown-600">
                          <span>🥩 {Math.round(day.total_protein)}g</span>
                          <span>🍞 {Math.round(day.total_carbs)}g</span>
                          <span>🧈 {Math.round(day.total_fat)}g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Range View */}
        {viewMode === "range" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
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

            <button
              onClick={() => refetchRangeStats()}
              disabled={rangeStatsLoading || !startDate || !endDate}
              className="w-full bg-gradient-to-r from-food-green-500 to-food-green-600 hover:from-food-green-600 hover:to-food-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 rounded-xl transition-all"
            >
              {rangeStatsLoading ? "Yuklanmoqda..." : "📊 Statistika ko'rish"}
            </button>

            {error && (
              <div className="bg-food-red-50 rounded-xl p-4 border border-food-red-200">
                <p className="text-food-red-700 font-medium">
                  {error instanceof Error ? error.message : "Xatolik yuz berdi"}
                </p>
              </div>
            )}

            {rangeStats && (
              <div className="bg-gradient-to-br from-food-orange-50 to-food-yellow-50 rounded-xl p-4 border-2 border-food-orange-200">
                <h3 className="font-bold text-food-brown-800 mb-3 flex items-center gap-2">
                  <span>📊</span>
                  {formatDate(rangeStats.start_date)} - {formatDate(rangeStats.end_date)}
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="font-extrabold text-food-red-600 text-lg">
                      {Math.round(rangeStats.total_calories)}
                    </div>
                    <div className="text-xs text-food-brown-500">Jami kaloriya</div>
                    <div className="text-xs text-food-brown-400 mt-1">
                      O'rtacha: {Math.round(rangeStats.avg_calories)}/kun
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">🍽️</div>
                    <div className="font-extrabold text-food-green-600 text-lg">
                      {rangeStats.total_meals}
                    </div>
                    <div className="text-xs text-food-brown-500">Jami ovqat</div>
                    <div className="text-xs text-food-brown-400 mt-1">
                      {rangeStats.days_count} kun
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-sm">🥩</div>
                    <div className="font-bold text-food-green-600">
                      {Math.round(rangeStats.avg_protein)}g
                    </div>
                    <div className="text-xs text-food-brown-500">O'rtacha oqsil</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-sm">🍞</div>
                    <div className="font-bold text-food-yellow-600">
                      {Math.round(rangeStats.avg_carbs)}g
                    </div>
                    <div className="text-xs text-food-brown-500">O'rtacha uglevod</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-sm">🧈</div>
                    <div className="font-bold text-food-orange-600">
                      {Math.round(rangeStats.avg_fat)}g
                    </div>
                    <div className="text-xs text-food-brown-500">O'rtacha yog'</div>
                  </div>
                </div>

                {/* Daily breakdown */}
                {rangeStats.days.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-bold text-food-brown-800 mb-2 text-sm">
                      Kunlik tafsilotlar:
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {rangeStats.days.map((day) => (
                        <div
                          key={day.id}
                          onClick={() => handleLoadDateLog(day.date)}
                          className="bg-white rounded-lg p-2 flex items-center justify-between cursor-pointer hover:bg-food-green-50 transition-colors"
                        >
                          <span className="text-xs font-medium text-food-brown-700">
                            {formatDate(day.date)}
                          </span>
                          <span className="text-xs font-bold text-food-green-600">
                            {Math.round(day.total_calories)} kkal
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Day Details Modal */}
      {selectedDayLog && selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-food-brown-800">
                {formatDate(selectedDate)}
              </h3>
              <button
                onClick={() => {
                  setSelectedDayLog(null);
                  setSelectedDate("");
                }}
                className="w-8 h-8 rounded-full bg-food-red-100 text-food-red-600 flex items-center justify-center hover:bg-food-red-200"
              >
                ✕
              </button>
            </div>

            {dateLogLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-food-red-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-food-brown-600">Kaloriya</div>
                    <div className="font-bold text-food-red-600">
                      {Math.round(selectedDayLog.total_calories)}
                    </div>
                  </div>
                  <div className="bg-food-green-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-food-brown-600">Oqsil</div>
                    <div className="font-bold text-food-green-600">
                      {Math.round(selectedDayLog.total_protein)}g
                    </div>
                  </div>
                  <div className="bg-food-yellow-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-food-brown-600">Uglevod</div>
                    <div className="font-bold text-food-yellow-600">
                      {Math.round(selectedDayLog.total_carbs)}g
                    </div>
                  </div>
                  <div className="bg-food-orange-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-food-brown-600">Yog'</div>
                    <div className="font-bold text-food-orange-600">
                      {Math.round(selectedDayLog.total_fat)}g
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-food-brown-800 mb-2">
                    Ovqatlar ({selectedDayLog.meals.length})
                  </h4>
                  {selectedDayLog.meals.length === 0 ? (
                    <p className="text-food-brown-500 text-sm">
                      Bu kunda ovqat qo'shilmagan
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDayLog.meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="bg-food-green-50 rounded-lg p-3 border border-food-green-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-food-brown-800">
                                {meal.food_name}
                              </p>
                              <p className="text-xs text-food-brown-500">
                                {meal.weight_grams}g
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-food-red-600">
                                {Math.round(meal.calories)} kkal
                              </p>
                              <p className="text-xs text-food-brown-500">
                                {new Date(meal.timestamp).toLocaleTimeString("uz-UZ", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
