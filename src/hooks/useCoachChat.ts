import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToken } from "../stores";
import {
  clearCoachHistory,
  getCoachHistory,
  getCoachPersonas,
  selectCoachPersona,
  sendCoachMessage,
} from "../services/api";
import type {
  CoachChatResponse,
  CoachHistory,
  CoachPersonaList,
} from "../types";

/** 7 murabbiy + tarif holati. */
export const useCoachPersonas = (enabled = true) => {
  const token = useToken();
  return useQuery<CoachPersonaList>({
    queryKey: ["coach", "personas"],
    enabled: enabled && !!token,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!token) throw new Error("Token mavjud emas");
      return getCoachPersonas(token);
    },
  });
};

/** Tanlangan murabbiy bilan suhbat tarixi. */
export const useCoachHistory = (enabled = true) => {
  const token = useToken();
  return useQuery<CoachHistory>({
    queryKey: ["coach", "history"],
    enabled: enabled && !!token,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!token) throw new Error("Token mavjud emas");
      return getCoachHistory(token);
    },
  });
};

export const useSelectCoachPersona = () => {
  const token = useToken();
  const queryClient = useQueryClient();

  return useMutation<CoachPersonaList, Error, string>({
    mutationFn: async (personaId) => {
      if (!token) throw new Error("Token mavjud emas");
      return selectCoachPersona(token, personaId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["coach", "personas"], data);
      // Murabbiy o'zgardi — tarix ham o'sha murabbiyniki bo'lishi kerak.
      queryClient.invalidateQueries({ queryKey: ["coach", "history"] });
    },
  });
};

export const useSendCoachMessage = () => {
  const token = useToken();
  const queryClient = useQueryClient();

  return useMutation<CoachChatResponse, Error, string>({
    mutationFn: async (message) => {
      if (!token) throw new Error("Token mavjud emas");
      return sendCoachMessage(token, message);
    },
    onSuccess: (data) => {
      // Qolgan xabarlar sonini yangilaymiz — hisoblagich darhol to'g'ri ko'rinsin.
      queryClient.setQueryData<CoachPersonaList>(
        ["coach", "personas"],
        (prev) =>
          prev
            ? { ...prev, messages_left_today: data.messages_left_today }
            : prev,
      );
    },
  });
};

export const useClearCoachHistory = () => {
  const token = useToken();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!token) throw new Error("Token mavjud emas");
      return clearCoachHistory(token);
    },
    onSuccess: () => {
      queryClient.setQueryData<CoachHistory>(["coach", "history"], (prev) =>
        prev ? { ...prev, messages: [] } : prev,
      );
    },
  });
};
