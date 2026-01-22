import axios, { AxiosError } from "axios";
import type {
  AnalysisResults,
  HealthStatus,
  AuthResponse,
  User,
  DailyLogResponse,
  MealEntryResponse,
  DailyLogSummary,
  DateRangeStats,
  FoodStats,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  // "https://kalloriya-hisoblagich-backend-production.up.railway.app";
  "http://localhost:8000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Helper to get auth headers
const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

// Handle API errors
const handleError = (error: unknown): never => {
  const axiosError = error as AxiosError<{ detail?: string }>;

  if (axiosError.response) {
    throw new Error(
      axiosError.response.data?.detail || "Server xatosi yuz berdi"
    );
  } else if (axiosError.request) {
    throw new Error(
      "Serverga ulanib bo'lmadi. Internet aloqangizni tekshiring"
    );
  } else {
    throw new Error(axiosError.message || "Kutilmagan xatolik yuz berdi");
  }
};

// ==================== AUTH API ====================

/**
 * Create anonymous user
 */
export const createAnonymousUser = async (): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/anonymous", {});
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Register new user
 */
export const registerUser = async (
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/register", {
      email,
      password,
      name,
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Login user
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Convert anonymous user to registered
 */
export const convertToRegistered = async (
  token: string,
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(
      "/auth/convert",
      { email, password, name },
      { headers: getAuthHeaders(token) }
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (token: string): Promise<User> => {
  try {
    const response = await api.get<User>("/auth/me", {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Update user settings
 */
export const updateUserSettings = async (
  token: string,
  settings: Record<string, unknown>
): Promise<User> => {
  try {
    const response = await api.put<User>("/auth/me", settings, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Refresh token
 */
export const refreshToken = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(
      "/auth/refresh",
      {},
      { headers: getAuthHeaders(token) }
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Telegram authentication
 */
export const telegramAuth = async (initData: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/telegram", {
      init_data: initData,
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Link Telegram account to existing user
 */
export const linkTelegramAccount = async (
  token: string,
  initData: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(
      "/auth/telegram/link",
      { init_data: initData },
      { headers: getAuthHeaders(token) }
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// ==================== MEALS API ====================

/**
 * Add meal entry
 */
export const addMeal = async (
  token: string,
  meal: {
    food_name: string;
    weight_grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    image_preview?: string;
    date?: string;
  }
): Promise<MealEntryResponse> => {
  try {
    const response = await api.post<MealEntryResponse>("/meals", meal, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Delete meal entry
 */
export const deleteMeal = async (
  token: string,
  mealId: string
): Promise<void> => {
  try {
    await api.delete(`/meals/${mealId}`, {
      headers: getAuthHeaders(token),
    });
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Get today's daily log
 */
export const getTodayLog = async (token: string): Promise<DailyLogResponse> => {
  try {
    const response = await api.get<DailyLogResponse>("/meals/today", {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Get daily log by date
 */
export const getLogByDate = async (
  token: string,
  date: string
): Promise<DailyLogResponse> => {
  try {
    const response = await api.get<DailyLogResponse>(`/meals/date/${date}`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Get history
 */
export const getHistory = async (
  token: string,
  days: number = 7
): Promise<DailyLogSummary[]> => {
  try {
    const response = await api.get<DailyLogSummary[]>(
      `/meals/history?days=${days}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Get date range statistics
 */
export const getDateRangeStats = async (
  token: string,
  startDate: string,
  endDate: string
): Promise<DateRangeStats> => {
  try {
    const response = await api.get<DateRangeStats>(
      `/meals/stats/range?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Get food statistics (most eaten foods)
 */
export const getFoodStats = async (
  token: string,
  days: number = 30,
  limit: number = 10
): Promise<FoodStats[]> => {
  try {
    const response = await api.get<FoodStats[]>(
      `/meals/stats/foods?days=${days}&limit=${limit}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// ==================== FOOD ANALYSIS API ====================

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
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    return handleError(error);
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

// ==================== FEEDBACK API ====================

export interface FeedbackItem {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  rating: number | null;
  category: string;
  admin_response: string | null;
  responded_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackCreateData {
  subject: string;
  message: string;
  category?: string;
  rating?: number;
}

/**
 * Submit feedback
 */
export const submitFeedback = async (
  token: string,
  data: FeedbackCreateData
): Promise<FeedbackItem> => {
  try {
    const response = await api.post<FeedbackItem>("/feedback", data, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Get user's feedbacks
 */
export const getMyFeedbacks = async (token: string): Promise<FeedbackItem[]> => {
  try {
    const response = await api.get<FeedbackItem[]>("/feedback/my", {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};