import { useEffect } from "react";
import { useHistory, useDateRangeStats, useLogByDate } from "../hooks/useMeals";
import LoadingSpinner from "./LoadingSpinner";
import BottomSheet from "./BottomSheet";
import { HistoryListSkeleton, RangeStatsSkeleton } from "./Skeleton";
import {
  useUIStore,
  useHistoryViewMode,
  useHistoryDays,
  useHistoryDateRange,
  useSelectedDayLog,
} from "../stores";

const History = () => {
  // UI Store selectors
  const viewMode = useHistoryViewMode();
  const days = useHistoryDays();
  const { startDate, endDate } = useHistoryDateRange();
  const { selectedDate, selectedDayLog } = useSelectedDayLog();

  // UI Store actions
  const {
    setHistoryViewMode: setViewMode,
    setHistoryDays: setDays,
    setHistoryStartDate: setStartDate,
    setHistoryEndDate: setEndDate,
    setSelectedDate,
    setSelectedDayLog,
    clearSelectedDayLog,
    initHistoryDates,
  } = useUIStore();

  // Initialize dates on mount
  useEffect(() => {
    initHistoryDates();
  }, [initHistoryDates]);

  // React Query hooks
  const {
    data: history = [],
    isLoading: historyInitialLoading,
    isFetching: historyFetching,
    error: historyError,
  } = useHistory(viewMode === "list" ? days : 0);

  const {
    data: rangeStats,
    isLoading: rangeStatsInitialLoading,
    isFetching: rangeStatsFetching,
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

  // Show skeleton on initial load or when fetching (for better UX)
  const historyLoading = historyInitialLoading || historyFetching;
  const rangeStatsLoading = rangeStatsInitialLoading || rangeStatsFetching;

  // Update selected day log when data changes
  useEffect(() => {
    if (dateLogData) {
      setSelectedDayLog(dateLogData);
    }
  }, [dateLogData, setSelectedDayLog]);

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
              <HistoryListSkeleton />
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

            {rangeStatsLoading ? (
              <RangeStatsSkeleton />
            ) : rangeStats && (
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

      {/* Selected Day Details BottomSheet */}
      <BottomSheet
        open={!!(selectedDayLog && selectedDate)}
        onClose={clearSelectedDayLog}
        icon="📅"
        accent="green"
        heroHeader
        title={selectedDate ? formatDate(selectedDate) : ""}
        maxHeight="max-h-[88vh]"
      >
        {dateLogLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : selectedDayLog ? (
          <div className="space-y-4 pt-3">
            {/* Macros */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-gradient-to-br from-food-red-50 to-food-red-100 rounded-2xl p-3 text-center border border-food-red-200">
                <div className="text-lg">🔥</div>
                <div className="font-extrabold text-food-red-600 text-lg leading-tight">
                  {Math.round(selectedDayLog.total_calories)}
                </div>
                <div className="text-[10px] text-food-brown-500 uppercase tracking-wide font-bold">
                  kkal
                </div>
              </div>
              <div className="bg-gradient-to-br from-food-green-50 to-food-green-100 rounded-2xl p-3 text-center border border-food-green-200">
                <div className="text-lg">🥩</div>
                <div className="font-extrabold text-food-green-600 text-lg leading-tight">
                  {Math.round(selectedDayLog.total_protein)}g
                </div>
                <div className="text-[10px] text-food-brown-500 uppercase tracking-wide font-bold">
                  oqsil
                </div>
              </div>
              <div className="bg-gradient-to-br from-food-yellow-50 to-food-yellow-100 rounded-2xl p-3 text-center border border-food-yellow-200">
                <div className="text-lg">🍞</div>
                <div className="font-extrabold text-food-yellow-600 text-lg leading-tight">
                  {Math.round(selectedDayLog.total_carbs)}g
                </div>
                <div className="text-[10px] text-food-brown-500 uppercase tracking-wide font-bold">
                  uglevod
                </div>
              </div>
              <div className="bg-gradient-to-br from-food-orange-50 to-food-orange-100 rounded-2xl p-3 text-center border border-food-orange-200">
                <div className="text-lg">🧈</div>
                <div className="font-extrabold text-food-orange-600 text-lg leading-tight">
                  {Math.round(selectedDayLog.total_fat)}g
                </div>
                <div className="text-[10px] text-food-brown-500 uppercase tracking-wide font-bold">
                  yog'
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-extrabold text-food-brown-800 mb-3 flex items-center gap-2">
                <span>🍽️</span>
                <span>Ovqatlar</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-food-green-100 text-food-green-700">
                  {selectedDayLog.meals.length}
                </span>
              </h4>
              {selectedDayLog.meals.length === 0 ? (
                <div className="bg-food-brown-50 rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-2 opacity-60">🍳</div>
                  <p className="text-food-brown-500 text-sm font-medium">
                    Bu kunda ovqat qo'shilmagan
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayLog.meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="bg-gradient-to-r from-food-green-50 to-food-yellow-50 rounded-2xl p-3 border border-food-green-100"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-food-brown-800 capitalize truncate">
                            {meal.food_name}
                          </p>
                          <p className="text-xs text-food-brown-500 mt-0.5">
                            {meal.weight_grams}g •{" "}
                            {new Date(meal.timestamp).toLocaleTimeString("uz-UZ", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-extrabold text-food-red-600">
                            {Math.round(meal.calories)}
                          </p>
                          <p className="text-[10px] text-food-brown-500 font-bold uppercase">
                            kkal
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
};

export default History;
