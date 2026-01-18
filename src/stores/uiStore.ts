import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DailyLogResponse } from "../types";

// History view state
type HistoryViewMode = "list" | "range";

interface HistoryState {
  viewMode: HistoryViewMode;
  days: number;
  startDate: string;
  endDate: string;
  selectedDate: string;
  selectedDayLog: DailyLogResponse | null;
}

// UI Store interface
interface UIState {
  // History state
  history: HistoryState;

  // History actions
  setHistoryViewMode: (mode: HistoryViewMode) => void;
  setHistoryDays: (days: number) => void;
  setHistoryStartDate: (date: string) => void;
  setHistoryEndDate: (date: string) => void;
  setSelectedDate: (date: string) => void;
  setSelectedDayLog: (log: DailyLogResponse | null) => void;
  clearSelectedDayLog: () => void;
  initHistoryDates: () => void;
}

// Get default dates
const getDefaultDates = () => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  
  return {
    endDate: today.toISOString().split("T")[0],
    startDate: weekAgo.toISOString().split("T")[0],
  };
};

const defaultDates = getDefaultDates();

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // History initial state
      history: {
        viewMode: "list",
        days: 7,
        startDate: defaultDates.startDate,
        endDate: defaultDates.endDate,
        selectedDate: "",
        selectedDayLog: null,
      },

      // History actions
      setHistoryViewMode: (mode) =>
        set((state) => ({
          history: { ...state.history, viewMode: mode },
        })),

      setHistoryDays: (days) =>
        set((state) => ({
          history: { ...state.history, days },
        })),

      setHistoryStartDate: (startDate) =>
        set((state) => ({
          history: { ...state.history, startDate },
        })),

      setHistoryEndDate: (endDate) =>
        set((state) => ({
          history: { ...state.history, endDate },
        })),

      setSelectedDate: (selectedDate) =>
        set((state) => ({
          history: { ...state.history, selectedDate },
        })),

      setSelectedDayLog: (selectedDayLog) =>
        set((state) => ({
          history: { ...state.history, selectedDayLog },
        })),

      clearSelectedDayLog: () =>
        set((state) => ({
          history: {
            ...state.history,
            selectedDate: "",
            selectedDayLog: null,
          },
        })),

      initHistoryDates: () => {
        const dates = getDefaultDates();
        set((state) => ({
          history: {
            ...state.history,
            startDate: dates.startDate,
            endDate: dates.endDate,
          },
        }));
      },
    }),
    {
      name: "kaloriya-ui",
      storage: createJSONStorage(() => localStorage),
      // Only persist user preferences, not transient state
      partialize: (state) => ({
        history: {
          viewMode: state.history.viewMode,
          days: state.history.days,
        },
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useHistoryViewMode = () =>
  useUIStore((state) => state.history.viewMode);
export const useHistoryDays = () => useUIStore((state) => state.history.days);
export const useHistoryStartDate = () =>
  useUIStore((state) => state.history.startDate);
export const useHistoryEndDate = () =>
  useUIStore((state) => state.history.endDate);
export const useHistoryDateRange = () =>
  useUIStore(
    useShallow((state) => ({
      startDate: state.history.startDate,
      endDate: state.history.endDate,
    }))
  );
export const useSelectedDate = () =>
  useUIStore((state) => state.history.selectedDate);
export const useSelectedDayLogData = () =>
  useUIStore((state) => state.history.selectedDayLog);
export const useSelectedDayLog = () =>
  useUIStore(
    useShallow((state) => ({
      selectedDate: state.history.selectedDate,
      selectedDayLog: state.history.selectedDayLog,
    }))
  );
