import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToken } from "../stores";
import {
  getTodayLog,
  getLogByDate,
  getHistory,
  addMeal,
  deleteMeal,
  getFoodStats,
  getDateRangeStats,
} from "../services/api";

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
  const token = useToken();

  return useQuery({
    queryKey: mealKeys.today(),
    queryFn: () => {
      if (!token) throw new Error("Token mavjud emas");
      return getTodayLog(token);
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes - use longer cache
  });
};

// Get log by date
export const useLogByDate = (date: string) => {
  const token = useToken();

  return useQuery({
    queryKey: mealKeys.byDate(date),
    queryFn: () => {
      if (!token) throw new Error("Token mavjud emas");
      return getLogByDate(token, date);
    },
    enabled: !!token && !!date,
    staleTime: 10 * 60 * 1000, // 10 minutes for historical data
  });
};

// Get history
export const useHistory = (days: number = 7) => {
  const token = useToken();

  return useQuery({
    queryKey: mealKeys.history(days),
    queryFn: () => {
      if (!token) throw new Error("Token mavjud emas");
      return getHistory(token, days);
    },
    enabled: !!token && days > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// Get food stats
export const useFoodStats = (days: number = 30, limit: number = 10) => {
  const token = useToken();

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
  const token = useToken();

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

// Add meal mutation with optimistic update
export const useAddMeal = () => {
  const token = useToken();
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
    // Optimistic update - darhol UI'ni yangilash
    onMutate: async (newMeal) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: mealKeys.today() });

      // Snapshot the previous value
      const previousLog = queryClient.getQueryData(mealKeys.today());

      // Optimistically update to the new value
      queryClient.setQueryData(mealKeys.today(), (old: any) => {
        if (!old) return old;

        // Create temporary meal entry
        const tempMeal = {
          id: `temp-${Date.now()}`, // Temporary ID
          food_name: newMeal.food_name,
          weight_grams: newMeal.weight_grams,
          calories: newMeal.calories,
          protein: newMeal.protein,
          carbs: newMeal.carbs,
          fat: newMeal.fat,
          image_preview: newMeal.image_preview,
          timestamp: new Date().toISOString(),
        };

        return {
          ...old,
          meals: [...old.meals, tempMeal],
          total_calories: old.total_calories + newMeal.calories,
          total_protein: old.total_protein + newMeal.protein,
          total_carbs: old.total_carbs + newMeal.carbs,
          total_fat: old.total_fat + newMeal.fat,
        };
      });

      // Return context with the previous value
      return { previousLog };
    },
    // If mutation fails, use the context to roll back
    onError: (_err, _newMeal, context) => {
      if (context?.previousLog) {
        queryClient.setQueryData(mealKeys.today(), context.previousLog);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: mealKeys.all });
    },
  });
};

// Delete meal mutation with optimistic update
export const useDeleteMeal = () => {
  const token = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mealId: string) => {
      if (!token) throw new Error("Token mavjud emas");
      return deleteMeal(token, mealId);
    },
    // Optimistic update - darhol UI'dan o'chirish
    onMutate: async (mealId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: mealKeys.today() });

      // Snapshot the previous value
      const previousLog = queryClient.getQueryData(mealKeys.today());

      // Optimistically remove the meal
      queryClient.setQueryData(mealKeys.today(), (old: any) => {
        if (!old) return old;

        // Find the meal to remove
        const mealToRemove = old.meals.find((m: any) => m.id === mealId);
        if (!mealToRemove) return old;

        return {
          ...old,
          meals: old.meals.filter((m: any) => m.id !== mealId),
          total_calories: old.total_calories - mealToRemove.calories,
          total_protein: old.total_protein - mealToRemove.protein,
          total_carbs: old.total_carbs - mealToRemove.carbs,
          total_fat: old.total_fat - mealToRemove.fat,
        };
      });

      // Return context with the previous value
      return { previousLog };
    },
    // If mutation fails, use the context to roll back
    onError: (_err, _mealId, context) => {
      if (context?.previousLog) {
        queryClient.setQueryData(mealKeys.today(), context.previousLog);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: mealKeys.all });
    },
  });
};
