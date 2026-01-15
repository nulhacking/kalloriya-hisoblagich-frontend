import { useMutation } from "@tanstack/react-query";
import { analyzeFood } from "../services/api";
import type { AnalysisResults } from "../types";

// Analyze food mutation
export const useAnalyzeFood = () => {
  return useMutation({
    mutationFn: (imageFile: File) => analyzeFood(imageFile),
  });
};
