import { useMutation, useQuery } from "@tanstack/react-query";
import { useToken } from "../stores";
import {
  analyzeFood,
  getClickPayLink,
  getPaymePayLink,
  getSubscriptionStatus,
} from "../services/api";
import { compressImage, needsCompression } from "../utils/imageUtils";

// Analyze food mutation with image compression
export const useAnalyzeFood = () => {
  const token = useToken();

  return useMutation({
    mutationFn: async (imageFile: File) => {
      if (!token) throw new Error("Token mavjud emas");

      // Compress image if needed (>300KB)
      const fileToSend = needsCompression(imageFile)
        ? await compressImage(imageFile)
        : imageFile;

      return analyzeFood(token, fileToSend);
    },
  });
};

export const useSubscriptionStatus = () => {
  const token = useToken();

  return useQuery({
    queryKey: ["subscription", "status"],
    queryFn: () => {
      if (!token) throw new Error("Token mavjud emas");
      return getSubscriptionStatus(token);
    },
    enabled: !!token,
    staleTime: 30 * 1000,
  });
};

export const useCreateClickPayLink = () => {
  const token = useToken();

  return useMutation({
    mutationFn: (amount: number) => {
      if (!token) throw new Error("Token mavjud emas");
      return getClickPayLink(token, amount);
    },
  });
};

export const useCreatePaymePayLink = () => {
  const token = useToken();

  return useMutation({
    mutationFn: (amount: number) => {
      if (!token) throw new Error("Token mavjud emas");
      return getPaymePayLink(token, amount);
    },
  });
};
