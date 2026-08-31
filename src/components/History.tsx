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
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-stone-900">
          Tarix
        </h2>
        <p className="text-stone-500 text-sm mt-0.5">
          O'tgan kunlardagi ovqatlanish ma'lumotlari
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white backdrop-blur rounded-2xl p-4 border border-stone-200">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
              viewMode === "list"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            📋 Ro'yxat
          </button>
          <button
            onClick={() => setViewMode("range")}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
              viewMode === "range"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            📊 Sana oraliq
          </button>
        </div>

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-stone-700">
                Oxirgi kunlar:
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none text-stone-900 font-semibold"
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
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-red-600 font-medium">
                  {error instanceof Error ? error.message : "Xatolik yuz berdi"}
                </p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-stone-600 font-medium">
                  Ma'lumotlar topilmadi
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((day) => (
                  <div
                    key={day.id}
                    onClick={() => handleLoadDateLog(day.date)}
                    className="bg-white rounded-xl p-4 border border-stone-200 hover:border-stone-200 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900">
                          {formatDate(day.date)}
                        </p>
                        <p className="text-xs text-stone-500 mt-1">
                          {day.meal_count} ta ovqat
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-700 text-lg">
                          {Math.round(day.total_calories)} kkal
                        </p>
                        <div className="flex gap-2 mt-1 text-xs text-stone-600">
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
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Boshlanish sanasi
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none text-stone-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Tugash sanasi
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none text-stone-900"
                />
              </div>
            </div>

            <button
              onClick={() => refetchRangeStats()}
              disabled={rangeStatsLoading || !startDate || !endDate}
              className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all"
            >
              {rangeStatsLoading ? "Yuklanmoqda..." : "📊 Statistika ko'rish"}
            </button>

            {error && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-red-600 font-medium">
                  {error instanceof Error ? error.message : "Xatolik yuz berdi"}
                </p>
              </div>
            )}

            {rangeStatsLoading ? (
              <RangeStatsSkeleton />
            ) : rangeStats && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                  {formatDate(rangeStats.start_date)} - {formatDate(rangeStats.end_date)}
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="font-semibold text-red-600 text-lg">
                      {Math.round(rangeStats.total_calories)}
                    </div>
                    <div className="text-xs text-stone-500">Jami kaloriya</div>
                    <div className="text-xs text-stone-400 mt-1">
                      O'rtacha: {Math.round(rangeStats.avg_calories)}/kun
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">🍽️</div>
                    <div className="font-semibold text-emerald-700 text-lg">
                      {rangeStats.total_meals}
                    </div>
                    <div className="text-xs text-stone-500">Jami ovqat</div>
                    <div className="text-xs text-stone-400 mt-1">
                      {rangeStats.days_count} kun
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-sm">🥩</div>
                    <div className="font-semibold text-emerald-700">
                      {Math.round(rangeStats.avg_protein)}g
                    </div>
                    <div className="text-xs text-stone-500">O'rtacha oqsil</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-sm">🍞</div>
                    <div className="font-semibold text-amber-700">
                      {Math.round(rangeStats.avg_carbs)}g
                    </div>
                    <div className="text-xs text-stone-500">O'rtacha uglevod</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-sm">🧈</div>
                    <div className="font-semibold text-amber-700">
                      {Math.round(rangeStats.avg_fat)}g
                    </div>
                    <div className="text-xs text-stone-500">O'rtacha yog'</div>
                  </div>
                </div>

                {/* Daily breakdown */}
                {rangeStats.days.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-stone-900 mb-2 text-sm">
                      Kunlik tafsilotlar:
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {rangeStats.days.map((day) => (
                        <div
                          key={day.id}
                          onClick={() => handleLoadDateLog(day.date)}
                          className="bg-white rounded-lg p-2 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
                        >
                          <span className="text-xs font-medium text-stone-700">
                            {formatDate(day.date)}
                          </span>
                          <span className="text-xs font-semibold text-emerald-700">
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
              <div className="bg-red-50 rounded-2xl p-3 text-center border border-red-200">
                <div className="text-lg">🔥</div>
                <div className="font-semibold text-red-600 text-lg leading-tight">
                  {Math.round(selectedDayLog.total_calories)}
                </div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wide font-semibold">
                  kkal
                </div>
              </div>
              <div className="bg-white rounded-2xl p-3 text-center border border-stone-200">
                <div className="text-lg">🥩</div>
                <div className="font-semibold text-emerald-700 text-lg leading-tight">
                  {Math.round(selectedDayLog.total_protein)}g
                </div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wide font-semibold">
                  oqsil
                </div>
              </div>
              <div className="bg-amber-50 rounded-2xl p-3 text-center border border-amber-200">
                <div className="text-lg">🍞</div>
                <div className="font-semibold text-amber-700 text-lg leading-tight">
                  {Math.round(selectedDayLog.total_carbs)}g
                </div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wide font-semibold">
                  uglevod
                </div>
              </div>
              <div className="bg-amber-50 rounded-2xl p-3 text-center border border-amber-200">
                <div className="text-lg">🧈</div>
                <div className="font-semibold text-amber-700 text-lg leading-tight">
                  {Math.round(selectedDayLog.total_fat)}g
                </div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wide font-semibold">
                  yog'
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <span>🍽️</span>
                <span>Ovqatlar</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {selectedDayLog.meals.length}
                </span>
              </h4>
              {selectedDayLog.meals.length === 0 ? (
                <div className="bg-stone-50 rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-2 opacity-60">🍳</div>
                  <p className="text-stone-500 text-sm font-medium">
                    Bu kunda ovqat qo'shilmagan
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayLog.meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="bg-white rounded-2xl p-3 border border-stone-200"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-stone-900 capitalize truncate">
                            {meal.food_name}
                          </p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {meal.weight_grams}g •{" "}
                            {new Date(meal.timestamp).toLocaleTimeString("uz-UZ", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-red-600">
                            {Math.round(meal.calories)}
                          </p>
                          <p className="text-[10px] text-stone-500 font-semibold uppercase">
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
