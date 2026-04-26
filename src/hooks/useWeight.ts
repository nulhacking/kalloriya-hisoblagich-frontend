import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
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
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
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

  type LogWeightContext = {
    previousUser: ReturnType<typeof useAuthStore.getState>["user"];
    previousHistory: Array<[unknown, unknown]>;
    previousTrend: unknown;
    previousGoalSummary: unknown;
  };

  return useMutation<
    WeightEntry,
    Error,
    { weight_kg: number; date?: string; note?: string },
    LogWeightContext
  >({
    mutationFn: async (payload) => {
      if (!token) throw new Error("Token mavjud emas");
      return logWeight(token, payload);
    },
    // Optimistic — User.weight_kg + weight history caches + goal summary
    onMutate: async (payload) => {
      const today = new Date().toISOString().slice(0, 10);
      const date = payload.date || today;

      // Snapshot user for rollback
      const previousUser = user;

      // 1) Update User.weight_kg immediately (HomePage shows new weight)
      if (user && date >= today) {
        setUser({ ...user, weight_kg: payload.weight_kg });
      }

      // 2) Update weight history caches (chart updates without flicker)
      // We don't know the exact `days` key, so update all weight-history caches.
      const historyCaches = qc.getQueriesData<any>({ queryKey: ["weight", "history"] });
      const previousHistory: Array<[any, any]> = [];
      for (const [key, data] of historyCaches) {
        previousHistory.push([key, data]);
        if (!data) continue;
        const entries = data.entries || [];
        const idx = entries.findIndex((e: any) => e.date === date);
        const tempEntry = {
          id: `temp-${Date.now()}`,
          date,
          weight_kg: payload.weight_kg,
          note: payload.note ?? null,
          created_at: new Date().toISOString(),
        };
        const newEntries =
          idx >= 0
            ? entries.map((e: any, i: number) => (i === idx ? { ...e, weight_kg: payload.weight_kg } : e))
            : [...entries, tempEntry];

        // Recompute history points (just append/replace; MA7 will refresh on real refetch)
        const histArr = data.history || [];
        const hidx = histArr.findIndex((p: any) => p.date === date);
        const newHist =
          hidx >= 0
            ? histArr.map((p: any, i: number) => (i === hidx ? { ...p, weight_kg: payload.weight_kg } : p))
            : [...histArr, { date, weight_kg: payload.weight_kg, ma7_kg: payload.weight_kg }];

        qc.setQueryData(key, {
          ...data,
          entries: newEntries,
          history: newHist,
          current_kg: payload.weight_kg,
        });
      }

      // 3) Update trend cache
      const previousTrend = qc.getQueryData<any>(WEIGHT_TREND_KEY);
      qc.setQueryData(WEIGHT_TREND_KEY, (old: any) => {
        if (!old) return old;
        const histArr = old.history || [];
        const hidx = histArr.findIndex((p: any) => p.date === date);
        const newHist =
          hidx >= 0
            ? histArr.map((p: any, i: number) => (i === hidx ? { ...p, weight_kg: payload.weight_kg } : p))
            : [...histArr, { date, weight_kg: payload.weight_kg, ma7_kg: payload.weight_kg }];
        return { ...old, history: newHist };
      });

      // 4) Goal summary — current weight changes
      const previousGoalSummary = qc.getQueryData<any>(GOAL_SUMMARY_QUERY_KEY);
      qc.setQueryData(GOAL_SUMMARY_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return { ...old, current_weight_kg: payload.weight_kg };
      });

      return { previousUser, previousHistory, previousTrend, previousGoalSummary };
    },
    onError: (_err, _payload, context) => {
      if (context?.previousUser) setUser(context.previousUser);
      if (context?.previousHistory) {
        for (const [key, data] of context.previousHistory) {
          qc.setQueryData(key as readonly unknown[], data);
        }
      }
      if (context?.previousTrend !== undefined) {
        qc.setQueryData(WEIGHT_TREND_KEY, context.previousTrend);
      }
      if (context?.previousGoalSummary !== undefined) {
        qc.setQueryData(GOAL_SUMMARY_QUERY_KEY, context.previousGoalSummary);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["weight"] });
      qc.invalidateQueries({ queryKey: GOAL_SUMMARY_QUERY_KEY });
    },
  });
};
