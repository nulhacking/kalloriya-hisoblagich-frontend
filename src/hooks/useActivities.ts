import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToken } from "../stores";
import {
  getTodayActivities,
  addActivity,
  deleteActivity,
  addCustomActivity,
} from "../services/api";
import { GOAL_SUMMARY_QUERY_KEY } from "./useGoal";

// Daily log key (reuse from useMeals)
const TODAY_LOG_KEY = ["meals", "today"] as const;

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
    // Optimistic update — activities list + daily log + goal summary
    onMutate: async (newActivity) => {
      await queryClient.cancelQueries({ queryKey: activityKeys.today() });
      await queryClient.cancelQueries({ queryKey: TODAY_LOG_KEY });
      await queryClient.cancelQueries({ queryKey: GOAL_SUMMARY_QUERY_KEY });

      const previousActivities = queryClient.getQueryData(activityKeys.today());
      const previousLog = queryClient.getQueryData(TODAY_LOG_KEY);
      const previousGoalSummary = queryClient.getQueryData(GOAL_SUMMARY_QUERY_KEY);

      // 1) Activities list — use activity_name to match backend shape (so
      //    CoachPage's exerciseDone matching picks it up immediately)
      queryClient.setQueryData(activityKeys.today(), (old: any) => {
        const tempActivity = {
          id: `temp-${Date.now()}`,
          activity_id: "custom",
          activity_name: newActivity.name,
          activity_icon: "🏋️",
          category: "custom",
          duration_minutes: newActivity.duration_minutes || 0,
          calories_burned: newActivity.calories_burned,
          timestamp: new Date().toISOString(),
        };
        return Array.isArray(old) ? [...old, tempActivity] : [tempActivity];
      });

      // 2) Daily log activities (so CoachPage exerciseDone via useTodayLog matches)
      queryClient.setQueryData(TODAY_LOG_KEY, (old: any) => {
        if (!old) return old;
        const tempActivity = {
          id: `temp-${Date.now()}`,
          activity_id: "custom",
          activity_name: newActivity.name,
          activity_icon: "🏋️",
          duration_minutes: newActivity.duration_minutes || 0,
          calories_burned: newActivity.calories_burned,
          timestamp: new Date().toISOString(),
        };
        return {
          ...old,
          activities: [...(old.activities || []), tempActivity],
          total_activity_calories:
            (old.total_activity_calories || 0) + newActivity.calories_burned,
        };
      });

      // 3) Goal summary — burned_calories goes up, remaining_calories goes up
      queryClient.setQueryData(GOAL_SUMMARY_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          burned_calories: (old.burned_calories || 0) + newActivity.calories_burned,
          remaining_calories:
            (old.remaining_calories || 0) + newActivity.calories_burned,
        };
      });

      return { previousActivities, previousLog, previousGoalSummary };
    },
    onError: (_err, _newActivity, context) => {
      if (context?.previousActivities) {
        queryClient.setQueryData(activityKeys.today(), context.previousActivities);
      }
      if (context?.previousLog) {
        queryClient.setQueryData(TODAY_LOG_KEY, context.previousLog);
      }
      if (context?.previousGoalSummary) {
        queryClient.setQueryData(GOAL_SUMMARY_QUERY_KEY, context.previousGoalSummary);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: GOAL_SUMMARY_QUERY_KEY });
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
