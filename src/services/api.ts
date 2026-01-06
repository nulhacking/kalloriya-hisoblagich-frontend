import axios, { AxiosError } from "axios";
import type { AnalysisResults, HealthStatus } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://kalloriya-hisoblagich-backend-production.up.railway.app";

/**
 * Analyze a food image and get nutrition information
 * @param imageFile - The image file to analyze
 * @returns Nutrition analysis results
 */
export const analyzeFood = async (
  imageFile: File
): Promise<AnalysisResults> => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await axios.post<AnalysisResults>(
      `${API_BASE_URL}/analyze-food`,
      formData,
      {
        // Don't set Content-Type manually - axios will set it automatically with boundary
        // for FormData
        timeout: 30000, // 30 seconds timeout
      }
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;

    if (axiosError.response) {
      // Server responded with error status
      throw new Error(
        axiosError.response.data?.detail || "Rasmni tahlil qilishda xatolik"
      );
    } else if (axiosError.request) {
      // Request was made but no response received
      throw new Error(
        "Serverga ulanib bo'lmadi. Backend " +
          API_BASE_URL +
          " da ishlayotganligini tekshiring"
      );
    } else {
      // Error setting up request
      throw new Error(axiosError.message || "Kutilmagan xatolik yuz berdi");
    }
  }
};

/**
 * Health check endpoint
 * @returns Health status
 */
export const checkHealth = async (): Promise<HealthStatus> => {
  try {
    const response = await axios.get<HealthStatus>(`${API_BASE_URL}/health`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    throw new Error("Backend server mavjud emas");
  }
};
