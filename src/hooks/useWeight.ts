import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore, useToken } from "../stores";
import {
  getWeightHistory,
  getWeightTrend,
  logWeight,
} from "../services/api";
import { GOAL_SUMMARY_QUERY_KEY } from "./useGoal";
import type {
  WeightEntry,
  WeightHistoryResponse,
  WeightTrendResponse,
} from "../types";

export const WEIGHT_HISTORY_KEY = (days: number) => ["weight", "history", days] as const;
export const WEIGHT_TREND_KEY = ["weight", "trend"] as const;

export const useWeightHistory = (days = 90, enabled = true) => {
  const token = useToken();
  return useQuery<WeightHistoryResponse>({
    queryKey: WEIGHT_HISTORY_KEY(days),
    enabled: enabled && !!token,
    staleTime: 60_000,
    queryFn: async () => {
      if (!token) throw new Error("Token mavjud emas");
      return getWeightHistory(token, days);
    },
  });
};

export const useWeightTrend = (enabled = true) => {
  const token = useToken();
  return useQuery<WeightTrendResponse>({
    queryKey: WEIGHT_TREND_KEY,
    enabled: enabled && !!token,
    staleTime: 60_000,
    queryFn: async () => {
      if (!token) throw new Error("Token mavjud emas");
      return getWeightTrend(token);
    },
  });
};

export const useLogWeight = () => {
  const token = useToken();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  return useMutation<
    WeightEntry,
    Error,
    { weight_kg: number; date?: string; note?: string }
  >({
    mutationFn: async (payload) => {
      if (!token) throw new Error("Token mavjud emas");
      return logWeight(token, payload);
    },
    onSuccess: (entry) => {
      // Today's entry ⇒ reflect immediately on User
      const today = new Date().toISOString().slice(0, 10);
      if (user && entry.date >= today) {
        setUser({ ...user, weight_kg: entry.weight_kg });
      }
      qc.invalidateQueries({ queryKey: ["weight"] });
      qc.invalidateQueries({ queryKey: GOAL_SUMMARY_QUERY_KEY });
    },
  });
};
