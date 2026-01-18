import { useMemo } from "react";
import { useTodayLog, useAddMeal, useDeleteMeal } from "./useMeals";
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
  const { data: todayLogData, isLoading: initialLoading, isFetching, error } = useTodayLog();
  const addMealMutation = useAddMeal();
  const deleteMealMutation = useDeleteMeal();
  
  // Show loading on initial load or when fetching
  const dataLoading = initialLoading || isFetching;

  // Convert backend response to frontend format
  const dailyLog = useMemo(() => {
    if (todayLogData) {
      return convertDailyLogResponse(todayLogData);
    }
    return createEmptyDailyLog();
  }, [todayLogData]);

  // Add meal to log - accepts either MealEntryResponse or meal data object
  const addMealToLog = async (
    mealData:
      | MealEntryResponse
      | {
          food_name: string;
          weight_grams: number;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          image_preview?: string;
        }
  ) => {
    // The mutation will automatically invalidate and refetch the query
    if ("food_name" in mealData && "calories" in mealData) {
      // It's already a meal data object
      await addMealMutation.mutateAsync(mealData);
    } else {
      // It's a MealEntryResponse, convert it
      await addMealMutation.mutateAsync({
        food_name: mealData.food_name,
        weight_grams: mealData.weight_grams,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        image_preview: mealData.image_preview,
      });
    }
  };

  // Remove meal from log
  const removeMealFromLog = async (mealId: string) => {
    await deleteMealMutation.mutateAsync(mealId);
  };

  return {
    dailyLog,
    dataLoading,
    error,
    addMealToLog,
    removeMealFromLog,
  };
}
