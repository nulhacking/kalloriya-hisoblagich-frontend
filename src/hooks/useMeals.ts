import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import {
  getTodayLog,
  getLogByDate,
  getHistory,
  addMeal,
  deleteMeal,
  getFoodStats,
  getDateRangeStats,
} from "../services/api";
import type {
  DailyLogResponse,
  DailyLogSummary,
  MealEntryResponse,
  FoodStats,
  DateRangeStats,
} from "../types";

// Query keys
export const mealKeys = {
  all: ["meals"] as const,
  today: () => [...mealKeys.all, "today"] as const,
  byDate: (date: string) => [...mealKeys.all, "date", date] as const,
  history: (days: number) => [...mealKeys.all, "history", days] as const,
  foodStats: (days: number, limit: number) =>
    [...mealKeys.all, "foodStats", days, limit] as const,
  rangeStats: (startDate: string, endDate: string) =>
    [...mealKeys.all, "rangeStats", startDate, endDate] as const,
};

// Get today's log
export const useTodayLog = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: mealKeys.today(),
    queryFn: () => {
      if (!token) throw new Error("Token mavjud emas");
      return getTodayLog(token);
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes for today's log
  });
};

// Get log by date
export const useLogByDate = (date: string) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: mealKeys.byDate(date),
    queryFn: () => {
      if (!token) throw new Error("Token mavjud emas");
      return getLogByDate(token, date);
    },
    enabled: !!token && !!date,
    staleTime: 5 * 60 * 1000, // 5 minutes for historical data
  });
};

// Get history
export const useHistory = (days: number = 7) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: mealKeys.history(days),
    queryFn: () => {
      if (!token) throw new Error("Token mavjud emas");
      return getHistory(token, days);
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};

// Get food stats
export const useFoodStats = (days: number = 30, limit: number = 10) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: mealKeys.foodStats(days, limit),
    queryFn: () => {
      if (!token) throw new Error("Token mavjud emas");
      return getFoodStats(token, days, limit);
    },
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes for stats
  });
};

// Get date range stats
export const useDateRangeStats = (startDate: string, endDate: string) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: mealKeys.rangeStats(startDate, endDate),
    queryFn: () => {
      if (!token) throw new Error("Token mavjud emas");
      return getDateRangeStats(token, startDate, endDate);
    },
    enabled: !!token && !!startDate && !!endDate,
    staleTime: 10 * 60 * 1000,
  });
};

// Add meal mutation
export const useAddMeal = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meal: {
      food_name: string;
      weight_grams: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      image_preview?: string;
      date?: string;
    }) => {
      if (!token) throw new Error("Token mavjud emas");
      return addMeal(token, meal);
    },
    onSuccess: () => {
      // Invalidate and refetch today's log
      queryClient.invalidateQueries({ queryKey: mealKeys.today() });
      // Invalidate history to show updated data
      queryClient.invalidateQueries({ queryKey: mealKeys.history() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: mealKeys.foodStats() });
      queryClient.invalidateQueries({ queryKey: mealKeys.rangeStats() });
    },
  });
};

// Delete meal mutation
export const useDeleteMeal = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mealId: string) => {
      if (!token) throw new Error("Token mavjud emas");
      return deleteMeal(token, mealId);
    },
    onSuccess: () => {
      // Invalidate and refetch today's log
      queryClient.invalidateQueries({ queryKey: mealKeys.today() });
      // Invalidate history
      queryClient.invalidateQueries({ queryKey: mealKeys.history() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: mealKeys.foodStats() });
      queryClient.invalidateQueries({ queryKey: mealKeys.rangeStats() });
    },
  });
};
