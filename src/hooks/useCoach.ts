import { useQuery } from "@tanstack/react-query";
import { useToken } from "../stores";
import { getCoachToday, getWeeklyReport } from "../services/api";
import type { CoachToday, WeeklyReport } from "../types";

export const useCoachToday = (enabled = true) => {
  const token = useToken();
  return useQuery<CoachToday>({
    queryKey: ["coach", "today"],
    enabled: enabled && !!token,
    staleTime: 60_000,
    queryFn: async () => {
      if (!token) throw new Error("Token mavjud emas");
      return getCoachToday(token);
    },
  });
};

export const useWeeklyReport = (enabled = false) => {
  const token = useToken();
  return useQuery<WeeklyReport>({
    queryKey: ["coach", "weekly"],
    enabled: enabled && !!token,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      if (!token) throw new Error("Token mavjud emas");
      return getWeeklyReport(token);
    },
  });
};
