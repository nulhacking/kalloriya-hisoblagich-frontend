import { useMutation } from "@tanstack/react-query";
import { analyzeFood } from "../services/api";

// Analyze food mutation
export const useAnalyzeFood = () => {
  return useMutation({
    mutationFn: (imageFile: File) => analyzeFood(imageFile),
  });
};
