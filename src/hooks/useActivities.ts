import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToken } from "../stores";
import {
  getTodayActivities,
  addActivity,
  deleteActivity,
  addCustomActivity,
} from "../services/api";

// Query keys
export const activityKeys = {
  all: ["activities"] as const,
  today: () => [...activityKeys.all, "today"] as const,
};

// Get today's activities
export const useTodayActivities = () => {
  const token = useToken();

  return useQuery({
    queryKey: activityKeys.today(),
    queryFn: () => {
      if (!token) throw new Error("Token mavjud emas");
      return getTodayActivities(token);
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Add activity mutation with optimistic update
export const useAddActivity = () => {
  const token = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activity: {
      activity_id: string;
      duration_minutes: number;
      distance_km?: number;
      date?: string;
    }) => {
      if (!token) throw new Error("Token mavjud emas");
      return addActivity(token, activity);
    },
    // Optimistic update
    onMutate: async (newActivity) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: activityKeys.today() });

      // Snapshot the previous value
      const previousActivities = queryClient.getQueryData(activityKeys.today());

      // Optimistically update - add temporary activity
      queryClient.setQueryData(activityKeys.today(), (old: any) => {
        if (!old) return [];

        const tempActivity = {
          id: `temp-${Date.now()}`,
          activity_id: newActivity.activity_id,
          duration_minutes: newActivity.duration_minutes,
          distance_km: newActivity.distance_km,
          calories_burned: 0, // Will be calculated on backend
          timestamp: new Date().toISOString(),
          date: newActivity.date || new Date().toISOString().split("T")[0],
        };

        return [...old, tempActivity];
      });

      // Return context with the previous value
      return { previousActivities };
    },
    // If mutation fails, roll back
    onError: (_err, _newActivity, context) => {
      if (context?.previousActivities) {
        queryClient.setQueryData(activityKeys.today(), context.previousActivities);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      // Invalidate both activities and meals (since activities affect daily log)
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
};

// Add custom activity mutation with optimistic update
export const useAddCustomActivity = () => {
  const token = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activity: {
      name: string;
      calories_burned: number;
      duration_minutes?: number;
      date?: string;
    }) => {
      if (!token) throw new Error("Token mavjud emas");
      return addCustomActivity(token, activity);
    },
    // Optimistic update
    onMutate: async (newActivity) => {
      await queryClient.cancelQueries({ queryKey: activityKeys.today() });

      const previousActivities = queryClient.getQueryData(activityKeys.today());

      queryClient.setQueryData(activityKeys.today(), (old: any) => {
        if (!old) return [];

        const tempActivity = {
          id: `temp-${Date.now()}`,
          name: newActivity.name,
          calories_burned: newActivity.calories_burned,
          duration_minutes: newActivity.duration_minutes,
          timestamp: new Date().toISOString(),
          date: newActivity.date || new Date().toISOString().split("T")[0],
          is_custom: true,
        };

        return [...old, tempActivity];
      });

      return { previousActivities };
    },
    onError: (_err, _newActivity, context) => {
      if (context?.previousActivities) {
        queryClient.setQueryData(activityKeys.today(), context.previousActivities);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
};

// Delete activity mutation with optimistic update
export const useDeleteActivity = () => {
  const token = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => {
      if (!token) throw new Error("Token mavjud emas");
      return deleteActivity(token, activityId);
    },
    // Optimistic update - immediately remove from UI
    onMutate: async (activityId) => {
      await queryClient.cancelQueries({ queryKey: activityKeys.today() });

      const previousActivities = queryClient.getQueryData(activityKeys.today());

      // Optimistically remove the activity
      queryClient.setQueryData(activityKeys.today(), (old: any) => {
        if (!old) return [];
        return old.filter((a: any) => a.id !== activityId);
      });

      return { previousActivities };
    },
    // If mutation fails, roll back
    onError: (_err, _activityId, context) => {
      if (context?.previousActivities) {
        queryClient.setQueryData(activityKeys.today(), context.previousActivities);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
};
