import { useMutation } from "@tanstack/react-query";
import { analyzeFood } from "../services/api";
import { compressImage, needsCompression } from "../utils/imageUtils";

export interface AnalyzeFoodInput {
  imageFile: File;
  foodHint?: string;
}

// Analyze food mutation with image compression
export const useAnalyzeFood = () => {
  return useMutation({
    mutationFn: async (input: AnalyzeFoodInput | File) => {
      // Support both legacy (File) and new (object) format
      const imageFile = typeof input === "object" && "imageFile" in input
        ? input.imageFile
        : input;
      const foodHint = typeof input === "object" && "foodHint" in input
        ? input.foodHint
        : undefined;

      // Compress image if needed (>300KB)
      const fileToSend = needsCompression(imageFile)
        ? await compressImage(imageFile)
        : imageFile;

      return analyzeFood(fileToSend, foodHint);
    },
  });
};
