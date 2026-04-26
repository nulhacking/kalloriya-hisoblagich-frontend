import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore, useToken } from "../stores";
import { getGoalSummary, setupGoal } from "../services/api";
import type { GoalSetupPayload, GoalSummary, TargetBreakdown, User } from "../types";

export const GOAL_SUMMARY_QUERY_KEY = ["goal", "summary"] as const;

export const useGoalSummary = (enabled = true) => {
  const token = useToken();
  return useQuery<GoalSummary>({
    queryKey: GOAL_SUMMARY_QUERY_KEY,
    enabled: enabled && !!token,
    staleTime: 30_000,
    placeholderData: keepPreviousData,    // ko'rsatib turib qayta yuklaydi
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!token) throw new Error("Token mavjud emas");
      return getGoalSummary(token);
    },
  });
};

export const useSetupGoal = () => {
  const token = useToken();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  return useMutation<TargetBreakdown, Error, GoalSetupPayload>({
    mutationFn: async (payload) => {
      if (!token) throw new Error("Token mavjud emas");
      return setupGoal(token, payload);
    },
    onSuccess: (target, payload) => {
      if (user) {
        const next: User = {
          ...user,
          goal_type: payload.goal_type,
          target_weight_kg: payload.target_weight_kg ?? user.target_weight_kg,
          target_date: payload.target_date ?? user.target_date,
          weekly_pace_kg:
            payload.goal_type === "maintain"
              ? 0
              : payload.weekly_pace_kg ?? user.weekly_pace_kg,
          daily_calorie_goal: target.calories,
          daily_protein_goal: target.protein_g,
          daily_carbs_goal: target.carbs_g,
          daily_fat_goal: target.fat_g,
        };
        setUser(next);
      }

      // Optimistically update goal summary cache so HomePage rings re-render
      // instantly with the new target (no wait for refetch).
      qc.setQueryData(GOAL_SUMMARY_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          goal_type: payload.goal_type,
          target_weight_kg: payload.target_weight_kg ?? old.target_weight_kg,
          target_date: payload.target_date ?? old.target_date,
          weekly_pace_kg:
            payload.goal_type === "maintain"
              ? 0
              : payload.weekly_pace_kg ?? old.weekly_pace_kg,
          target: {
            ...(old.target || {}),
            calories: target.calories,
            protein_g: target.protein_g,
            carbs_g: target.carbs_g,
            fat_g: target.fat_g,
            delta_kcal: target.delta_kcal,
            goal_type: target.goal_type,
            weekly_pace_kg: target.weekly_pace_kg,
          },
          remaining_calories: Math.max(
            0,
            target.calories - (old.eaten_calories || 0) + (old.burned_calories || 0),
          ),
        };
      });

      // Also invalidate coach today (meal plan slot kcal targets recompute)
      qc.invalidateQueries({ queryKey: ["coach", "today"] });
      qc.invalidateQueries({ queryKey: GOAL_SUMMARY_QUERY_KEY });
    },
  });
};
