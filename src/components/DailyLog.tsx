import { useState } from "react";
import type { DailyLog as DailyLogType, UserSettings } from "../types";
import { useUser, useAuthStore } from "../stores";
import ActivityPicker from "./ActivityPicker";
import BottomSheet from "./BottomSheet";
import { useToast } from "./Toast";
import { deleteActivity, addCustomActivity, addMeal } from "../services/api";

interface DailyLogProps {
  dailyLog: DailyLogType;
  settings: UserSettings;
  onDeleteMeal: (mealId: string) => void;
  onRefresh?: () => void;
}

const DailyLogComponent = ({
  dailyLog,
  settings,
  onDeleteMeal,
  onRefresh,
}: DailyLogProps) => {
  const user = useUser();
  const token = useAuthStore((state) => state.token);
  const toast = useToast();
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [showCustomBurnedModal, setShowCustomBurnedModal] = useState(false);
  const [showCustomConsumedModal, setShowCustomConsumedModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    meals,
    activities,
    totalCalories,
    totalOqsil,
    totalCarbs,
    totalFat,
    total_activity_calories,
  } = dailyLog;

  const totalBurned = (user?.tdee || 0) + (total_activity_calories || 0);
  const calorieBalance = totalBurned - totalCalories;

  // Eaten vs (Goal + Exercise)
  const adjustedGoal =
    settings.dailyCalorieGoal + (total_activity_calories || 0);

  const handleDeleteActivity = async (id: string) => {
    if (!token || !confirm("Bu harakatni o'chirmoqchimisiz?")) return;
    try {
      await deleteActivity(token, id);
      toast.success("Harakat o'chirildi");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Harakat o'chirishda xatolik:", error);
      toast.error("O'chirishda xatolik yuz berdi");
    }
  };

  const handleAddCustomBurned = async () => {
    if (!token || !customName.trim() || !customCalories) return;
    setIsSubmitting(true);
    try {
      await addCustomActivity(token, {
        name: customName.trim(),
        calories_burned: parseFloat(customCalories),
      });
      setCustomName("");
      setCustomCalories("");
      setShowCustomBurnedModal(false);
      toast.success("Harakat qo'shildi");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Maxsus harakat qo'shishda xatolik:", error);
      toast.error("Qo'shishda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCustomConsumed = async () => {
    if (!token || !customName.trim() || !customCalories) return;
    setIsSubmitting(true);
    try {
      await addMeal(token, {
        food_name: customName.trim(),
        weight_grams: 0,
        calories: parseFloat(customCalories),
        protein: 0,
        carbs: 0,
        fat: 0,
      });
      setCustomName("");
      setCustomCalories("");
      setShowCustomConsumedModal(false);
      toast.success("Ovqat qo'shildi");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Maxsus ovqat qo'shishda xatolik:", error);
      toast.error("Qo'shishda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeBurnedSheet = () => {
    setShowCustomBurnedModal(false);
    setCustomName("");
    setCustomCalories("");
  };

  const closeConsumedSheet = () => {
    setShowCustomConsumedModal(false);
    setCustomName("");
    setCustomCalories("");
  };

  const getProgressColor = (current: number, goal: number): string => {
    const percent = (current / goal) * 100;
    if (percent >= 100) return "bg-red-500";
    if (percent >= 80) return "bg-amber-500";
    return "bg-emerald-600";
  };

  const getProgressPercent = (current: number, goal: number): number => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatTime = (timestamp: string | number) => {
    return new Date(timestamp).toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Bugungi sana */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-stone-900">
          Bugungi ovqatlanish
        </h2>
        <p className="text-stone-500 text-sm mt-0.5">
          {new Date().toLocaleDateString("uz-UZ", {
            weekday: "long",
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Umumiy statistika */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200">
        <h3 className="text-base font-semibold text-stone-900 mb-3 flex items-center gap-2">
          Kunlik statistika
        </h3>

        {/* Kaloriya progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-stone-700 flex items-center gap-1">
              <span>🔥</span> Kaloriya
            </span>
            <span className="text-sm font-semibold text-stone-600">
              {Math.round(totalCalories)} / {adjustedGoal} kkal
            </span>
          </div>
          <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(
                totalCalories,
                adjustedGoal,
              )} transition-all duration-500 rounded-full`}
              style={{
                width: `${getProgressPercent(totalCalories, adjustedGoal)}%`,
              }}
            ></div>
          </div>
          {total_activity_calories > 0 && (
            <p className="text-xs text-emerald-700 mt-1 text-right">
              + {Math.round(total_activity_calories)} kkal mashq qo'shildi
            </p>
          )}
        </div>

        {/* Boshqa nutrientlar */}
        <div className="grid grid-cols-3 gap-2">
          {/* Oqsil */}
          <div className="bg-white rounded-xl p-2 text-center border border-stone-200">
            <div className="text-lg">🥩</div>
            <div className="text-base font-semibold text-emerald-700">
              {Math.round(totalOqsil)}g
            </div>
            <div className="text-xs text-stone-500">
              / {settings.dailyOqsilGoal}g
            </div>
            <div className="h-1.5 bg-stone-200 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${getProgressColor(
                  totalOqsil,
                  settings.dailyOqsilGoal,
                )} transition-all duration-500`}
                style={{
                  width: `${getProgressPercent(
                    totalOqsil,
                    settings.dailyOqsilGoal,
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Uglevodlar */}
          <div className="bg-white rounded-xl p-2 text-center border border-amber-200">
            <div className="text-lg">🍞</div>
            <div className="text-base font-semibold text-amber-700">
              {Math.round(totalCarbs)}g
            </div>
            <div className="text-xs text-stone-500">
              / {settings.dailyCarbsGoal}g
            </div>
            <div className="h-1.5 bg-stone-200 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${getProgressColor(
                  totalCarbs,
                  settings.dailyCarbsGoal,
                )} transition-all duration-500`}
                style={{
                  width: `${getProgressPercent(
                    totalCarbs,
                    settings.dailyCarbsGoal,
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Yog' */}
          <div className="bg-white rounded-xl p-2 text-center border border-amber-200">
            <div className="text-lg">🧈</div>
            <div className="text-base font-semibold text-amber-700">
              {Math.round(totalFat)}g
            </div>
            <div className="text-xs text-stone-500">
              / {settings.dailyFatGoal}g
            </div>
            <div className="h-1.5 bg-stone-200 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${getProgressColor(
                  totalFat,
                  settings.dailyFatGoal,
                )} transition-all duration-500`}
                style={{
                  width: `${getProgressPercent(
                    totalFat,
                    settings.dailyFatGoal,
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* TDEE va Mashqlar bilan kaloriya balansi */}
      {user?.tdee && (
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
          <h3 className="text-base font-semibold text-stone-900 mb-3 flex items-center gap-2">
            Kaloriya balansi
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-xl p-2">
              <div className="text-lg">🔥</div>
              <div className="font-semibold text-amber-700">
                {Math.round(totalBurned)}
              </div>
              <div className="text-xs text-stone-500">TDEE + Mashq</div>
            </div>
            <div className="bg-white rounded-xl p-2">
              <div className="text-lg">🍽️</div>
              <div className="font-semibold text-emerald-700">
                {Math.round(totalCalories)}
              </div>
              <div className="text-xs text-stone-500">Yegan</div>
            </div>
            <div className="bg-white rounded-xl p-2">
              <div className="text-lg">{calorieBalance > 0 ? "📉" : "📈"}</div>
              <div
                className={`font-semibold ${calorieBalance > 0 ? "text-emerald-700" : "text-red-600"}`}
              >
                {calorieBalance > 0 ? "-" : "+"}
                {Math.abs(Math.round(calorieBalance))}
              </div>
              <div className="text-xs text-stone-500">Balans</div>
            </div>
          </div>

          <p className="text-xs text-stone-600 mt-2 text-center">
            {calorieBalance > 0
              ? `💚 Bugun ${Math.round(calorieBalance)} kkal taqchillik (vazn yo'qotish)`
              : `⚠️ Bugun ${Math.round(-calorieBalance)} kkal ortiqcha (vazn olish)`}
          </p>
        </div>
      )}

      {/* Harakatlar ro'yxati */}
      <div className="bg-white backdrop-blur rounded-2xl p-4 border border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            Bugungi harakatlar
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCustomBurnedModal(true)}
              className="px-2 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
              title="Maxsus kaloriya qo'shish"
            >
              ✏️ Maxsus
            </button>
            <button
              onClick={() => setShowActivityPicker(true)}
              className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-sm font-semibold hover:bg-stone-100 transition-colors"
            >
              + Qo'shish
            </button>
          </div>
        </div>

        {!activities || activities.length === 0 ? (
          <div className="text-center py-6 bg-stone-50 rounded-xl dashed-border border-stone-200">
            <div className="text-3xl mb-2 opacity-50">👟</div>
            <p className="text-stone-500 text-sm">Hali mashq qo'shilmagan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 relative"
              >
                <div className="text-2xl">{activity.activity_icon || "🏃"}</div>
                <div className="flex-1">
                  <div className="font-semibold text-stone-900">
                    {activity.activity_name}
                  </div>
                  <div className="text-xs text-stone-600">
                    {activity.duration_minutes} daqiqa
                    {activity.distance_km
                      ? ` • ${activity.distance_km} km`
                      : ""}
                  </div>
                </div>
                <div className="text-right mr-8">
                  <div className="font-semibold text-amber-700">
                    -{Math.round(activity.calories_burned)}
                  </div>
                  <div className="text-[10px] text-stone-500">kkal</div>
                </div>
                <button
                  onClick={() => handleDeleteActivity(activity.id)}
                  className="absolute top-3 right-2 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                  title="O'chirish"
                >
                  <span className="text-xs">✕</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ovqatlar ro'yxati */}
      <div className="bg-white backdrop-blur rounded-2xl p-4 border border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            Bugungi ovqatlar ({meals.length})
          </h3>
          <button
            onClick={() => setShowCustomConsumedModal(true)}
            className="px-2 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
            title="Maxsus kaloriya qo'shish"
          >
            ✏️ Maxsus
          </button>
        </div>

        {meals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🍳</div>
            <p className="text-stone-600 font-medium">
              Hali ovqat qo'shilmagan
            </p>
            <p className="text-stone-400 text-sm mt-1">
              Bosh sahifadan ovqat tahlil qiling
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white rounded-xl p-3 border border-stone-200 relative"
              >
                <div className="flex items-start gap-3">
                  {/* Rasm yoki icon */}
                  {meal.imagePreview ? (
                    <img
                      src={meal.imagePreview}
                      alt={meal.food}
                      className="w-14 h-14 rounded-lg object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-emerald-100 flex items-center justify-center text-2xl">
                      🍽️
                    </div>
                  )}

                  {/* Ma'lumotlar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-stone-900 capitalize truncate pr-2">
                        {meal.food}
                      </h4>
                      <span className="text-xs text-stone-500 whitespace-nowrap pr-8">
                        {formatTime(meal.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {meal.weight_grams}g
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
                        🔥 {Math.round(meal.calories)} kkal
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        {Math.round(meal.oqsil)}g oqsil
                      </span>
                    </div>
                  </div>

                  {/* O'chirish tugmasi */}
                  <button
                    onClick={() => onDeleteMeal(meal.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-100 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
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
      {adjustedGoal - totalCalories > 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
          <p className="text-emerald-700 font-semibold flex items-center justify-center gap-2">
            <span className="text-xl">✨</span>
            <span>
              Yana{" "}
              <span className="text-emerald-700 text-lg">
                {Math.round(adjustedGoal - totalCalories)}
              </span>{" "}
              kkal yeyishingiz mumkin
            </span>
          </p>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-red-600 font-semibold flex items-center justify-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>
              Kunlik limitingiz{" "}
              <span className="text-red-600 text-lg">
                {Math.round(totalCalories - adjustedGoal)}
              </span>{" "}
              kkal ga oshib ketdi
            </span>
          </p>
        </div>
      )}

      {/* Activity Picker Modal */}
      {showActivityPicker && (
        <ActivityPicker
          onClose={() => setShowActivityPicker(false)}
          onActivityAdded={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Custom Burned Calories BottomSheet */}
      <BottomSheet
        open={showCustomBurnedModal}
        onClose={closeBurnedSheet}
        title="Maxsus sarflangan kaloriya"
        icon="🔥"
        accent="orange"
        heroHeader
        footer={
          <div className="flex gap-3">
            <button
              onClick={closeBurnedSheet}
              className="flex-1 py-3 bg-stone-50 text-stone-700 rounded-2xl font-semibold hover:bg-stone-100 transition-colors active:scale-95"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleAddCustomBurned}
              disabled={!customName.trim() || !customCalories || isSubmitting}
              className="flex-1 py-3 bg-amber-500 text-white rounded-2xl font-semibold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {isSubmitting ? "Qo'shilmoqda..." : "Qo'shish"}
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-stone-600">
            Katalogda yo'q mashq yoki harakatingizni qo'lda qo'shing.
          </p>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Harakat nomi
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Masalan: Uy mashqi"
              className="w-full px-4 py-3 border border-amber-200 bg-amber-50/40 rounded-2xl focus:border-stone-400 focus:bg-white outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Sarflangan kaloriya (kkal)
            </label>
            <input
              type="number"
              value={customCalories}
              onChange={(e) => setCustomCalories(e.target.value)}
              placeholder="Masalan: 200"
              min="1"
              max="5000"
              className="w-full px-4 py-3 border border-amber-200 bg-amber-50/40 rounded-2xl focus:border-stone-400 focus:bg-white outline-none transition-all font-semibold text-lg"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {[100, 200, 300, 500].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setCustomCalories(String(v))}
                  className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors"
                >
                  {v} kkal
                </button>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Custom Consumed Calories BottomSheet */}
      <BottomSheet
        open={showCustomConsumedModal}
        onClose={closeConsumedSheet}
        title="Maxsus iste'mol kaloriyasi"
        icon="🍽️"
        accent="green"
        heroHeader
        footer={
          <div className="flex gap-3">
            <button
              onClick={closeConsumedSheet}
              className="flex-1 py-3 bg-stone-50 text-stone-700 rounded-2xl font-semibold hover:bg-stone-100 transition-colors active:scale-95"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleAddCustomConsumed}
              disabled={!customName.trim() || !customCalories || isSubmitting}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-semibold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {isSubmitting ? "Qo'shilmoqda..." : "Qo'shish"}
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-stone-600">
            Rasmsiz, qo'lda ovqat yoki ichimlik kaloriyasini qo'shing.
          </p>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Ovqat nomi
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Masalan: Shirinlik"
              className="w-full px-4 py-3 border border-stone-200 bg-white rounded-2xl focus:border-stone-400 focus:bg-white outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Kaloriya (kkal)
            </label>
            <input
              type="number"
              value={customCalories}
              onChange={(e) => setCustomCalories(e.target.value)}
              placeholder="Masalan: 150"
              min="1"
              max="5000"
              className="w-full px-4 py-3 border border-stone-200 bg-white rounded-2xl focus:border-stone-400 focus:bg-white outline-none transition-all font-semibold text-lg"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {[100, 200, 300, 500].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setCustomCalories(String(v))}
                  className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  {v} kkal
                </button>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default DailyLogComponent;
