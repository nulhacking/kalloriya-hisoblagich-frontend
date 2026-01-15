import { useState, useEffect, useCallback } from "react";
import { getTodayLog, addMeal, deleteMeal } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { DailyLog, MealEntry, MealEntryResponse, DailyLogResponse } from "../types";

// Bugungi sana YYYY-MM-DD formatda
const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Bo'sh kunlik log
const createEmptyDailyLog = (): DailyLog => ({
  date: getTodayDate(),
  meals: [],
  totalCalories: 0,
  totalOqsil: 0,
  totalCarbs: 0,
  totalFat: 0,
});

// Backend response ni frontend formatga o'tkazish
const convertMealResponse = (meal: MealEntryResponse): MealEntry => ({
  id: meal.id,
  food: meal.food_name,
  calories: meal.calories,
  oqsil: meal.protein,
  carbs: meal.carbs,
  fat: meal.fat,
  weight_grams: meal.weight_grams,
  timestamp: new Date(meal.timestamp).getTime(),
  imagePreview: meal.image_preview,
});

const convertDailyLogResponse = (response: DailyLogResponse): DailyLog => ({
  date: response.date,
  meals: response.meals.map(convertMealResponse),
  totalCalories: response.total_calories,
  totalOqsil: response.total_protein,
  totalCarbs: response.total_carbs,
  totalFat: response.total_fat,
});

export function useDailyLog() {
  const { token } = useAuth();
  const [dailyLog, setDailyLog] = useState<DailyLog>(createEmptyDailyLog);
  const [dataLoading, setDataLoading] = useState(false);

  // Backend dan kunlik logni yuklash
  const loadTodayLog = useCallback(async () => {
    if (!token) return;

    setDataLoading(true);
    try {
      const response = await getTodayLog(token);
      setDailyLog(convertDailyLogResponse(response));
    } catch (err) {
      console.error("Kunlik logni yuklashda xatolik:", err);
      // Agar xatolik bo'lsa, bo'sh log ishlatamiz
      setDailyLog(createEmptyDailyLog());
    } finally {
      setDataLoading(false);
    }
  }, [token]);

  // Token o'zgarganda ma'lumotlarni yuklash
  useEffect(() => {
    if (token) {
      loadTodayLog();
    }
  }, [token, loadTodayLog]);

  // Ovqatni kunlik hisobga qo'shish
  const addMealToLog = useCallback(async (newMeal: MealEntryResponse) => {
    setDailyLog((prev) => ({
      ...prev,
      meals: [...prev.meals, convertMealResponse(newMeal)],
      totalCalories: prev.totalCalories + newMeal.calories,
      totalOqsil: prev.totalOqsil + newMeal.protein,
      totalCarbs: prev.totalCarbs + newMeal.carbs,
      totalFat: prev.totalFat + newMeal.fat,
    }));
  }, []);

  // Ovqatni o'chirish
  const removeMealFromLog = useCallback(async (mealId: string) => {
    if (!token) return;

    const mealToDelete = dailyLog.meals.find((m) => m.id === mealId);
    if (!mealToDelete) return;

    try {
      await deleteMeal(token, mealId);

      // Local state ni yangilash
      setDailyLog((prev) => ({
        ...prev,
        meals: prev.meals.filter((m) => m.id !== mealId),
        totalCalories: prev.totalCalories - mealToDelete.calories,
        totalOqsil: prev.totalOqsil - mealToDelete.oqsil,
        totalCarbs: prev.totalCarbs - mealToDelete.carbs,
        totalFat: prev.totalFat - mealToDelete.fat,
      }));
    } catch (err) {
      console.error("Ovqatni o'chirishda xatolik:", err);
      throw err;
    }
  }, [token, dailyLog.meals]);

  return {
    dailyLog,
    dataLoading,
    loadTodayLog,
    addMealToLog,
    removeMealFromLog,
  };
}
