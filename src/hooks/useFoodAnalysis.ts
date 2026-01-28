import { useMutation } from "@tanstack/react-query";
import { analyzeFood } from "../services/api";
import { compressImage, needsCompression } from "../utils/imageUtils";

// Analyze food mutation with image compression
export const useAnalyzeFood = () => {
  return useMutation({
    mutationFn: async (imageFile: File) => {
      // Compress image if needed (>300KB)
      const fileToSend = needsCompression(imageFile)
        ? await compressImage(imageFile)
        : imageFile;

      return analyzeFood(fileToSend);
    },
  });
};
