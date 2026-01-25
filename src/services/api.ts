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
  ActivityEntry,
  ActivityCatalogResponse,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  // "https://kalloriya-hisoblagich-backend-production.up.railway.app";
  "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout for faster failure
});

// Helper to get auth headers
const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

// Custom API Error class with status code
export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Handle API errors
const handleError = (error: unknown): never => {
  const axiosError = error as AxiosError<{ detail?: string }>;

  if (axiosError.response) {
    throw new ApiError(
      axiosError.response.data?.detail || "Server xatosi yuz berdi",
      axiosError.response.status
    );
  } else if (axiosError.request) {
    throw new ApiError(
      "Serverga ulanib bo'lmadi. Internet aloqangizni tekshiring"
    );
  } else {
    throw new ApiError(axiosError.message || "Kutilmagan xatolik yuz berdi");
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

// ==================== ADMIN API ====================

export interface FeedbackDetailItem extends FeedbackItem {
  user?: {
    id: string;
    name: string | null;
    telegram_username: string | null;
    user_type: string;
  } | null;
  responder?: {
    id: string;
    name: string | null;
    telegram_username: string | null;
    user_type: string;
  } | null;
}

export interface FeedbackListResponse {
  feedbacks: FeedbackDetailItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FeedbackStatsResponse {
  total: number;
  pending: number;
  in_review: number;
  responded: number;
  closed: number;
  average_rating: number | null;
}

export interface TelegramUser {
  id: string;
  name: string | null;
  email: string | null;
  user_type: string;
  telegram_id: string | null;
  telegram_username: string | null;
  telegram_first_name: string | null;
  created_at: string;
  is_active: boolean;
}

/**
 * Check if current user is admin
 */
export const checkAdminStatus = async (token: string): Promise<{ is_admin: boolean }> => {
  try {
    const response = await api.get<{ is_admin: boolean }>("/feedback/admin/check", {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    return { is_admin: false };
  }
};

/**
 * Get all feedbacks (Admin only)
 */
export const getAllFeedbacks = async (
  token: string,
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<FeedbackListResponse> => {
  try {
    let url = `/feedback?page=${page}&page_size=${pageSize}`;
    if (status) {
      url += `&status_filter=${status}`;
    }
    const response = await api.get<FeedbackListResponse>(url, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Get feedback stats (Admin only)
 */
export const getFeedbackStats = async (token: string): Promise<FeedbackStatsResponse> => {
  try {
    const response = await api.get<FeedbackStatsResponse>("/feedback/stats", {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Reply to feedback via Telegram (Admin only)
 */
export const replyFeedbackTelegram = async (
  token: string,
  feedbackId: string,
  adminResponse: string,
  status: string = "responded"
): Promise<{ success: boolean; telegram_sent: boolean; message: string }> => {
  try {
    const response = await api.post(
      `/feedback/${feedbackId}/reply-telegram`,
      { admin_response: adminResponse, status },
      { headers: getAuthHeaders(token) }
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Send message to user via Telegram (Admin only)
 */
export const sendMessageToUser = async (
  token: string,
  userId: string,
  message: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post(
      "/feedback/send-message",
      { user_id: userId, message },
      { headers: getAuthHeaders(token) }
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Get all users with Telegram ID (Admin only)
 */
export const getTelegramUsers = async (token: string): Promise<TelegramUser[]> => {
  try {
    const response = await api.get<TelegramUser[]>("/feedback/admin/users", {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// ==================== ACTIVITIES API ====================

/**
 * Get activity catalog
 */
export const getActivityCatalog = async (): Promise<ActivityCatalogResponse> => {
  try {
    const response = await api.get<ActivityCatalogResponse>("/activities/catalog");
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Add activity entry
 */
export const addActivity = async (
  token: string,
  activity: {
    activity_id: string;
    duration_minutes: number;
    distance_km?: number;
    date?: string;
  }
): Promise<ActivityEntry> => {
  try {
    const response = await api.post<ActivityEntry>("/activities", activity, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Delete activity entry
 */
export const deleteActivity = async (
  token: string,
  activityId: string
): Promise<void> => {
  try {
    await api.delete(`/activities/${activityId}`, {
      headers: getAuthHeaders(token),
    });
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Get today's activities
 */
export const getTodayActivities = async (token: string): Promise<ActivityEntry[]> => {
  try {
    const response = await api.get<ActivityEntry[]>("/activities/today", {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};