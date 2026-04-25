export interface NutritionData {
  oqsil?: number;
  carbs?: number;
  fat?: number;
  calories?: number;
}

export interface AnalysisResults {
  food: string;
  confidence: number;
  ingredients: string[];
  estimated_weight_grams?: number | null;
  nutrition_per_100g: NutritionData;
  total_nutrition?: NutritionData | null;
  note: string;
  /** R2 da saqlangan rasm URL (agar mavjud bo'lsa) */
  image_url?: string | null;
}

export interface HealthStatus {
  status: string;
}

// Kunlik ovqat yozuvi
export interface MealEntry {
  id: string;
  food: string;
  calories: number;
  oqsil: number;
  carbs: number;
  fat: number;
  weight_grams: number;
  timestamp: number;
  imagePreview?: string;
}

// Backend MealEntry response
export interface MealEntryResponse {
  id: string;
  food_name: string;
  weight_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_preview?: string;
  timestamp: string;
}

// Kunlik log
export interface DailyLog {
  date: string; // YYYY-MM-DD format
  meals: MealEntry[];
  totalCalories: number;
  totalOqsil: number;
  totalCarbs: number;
  totalFat: number;
  total_activity_calories: number;
  activities: ActivityEntry[];
}

// Backend DailyLog response
export interface DailyLogResponse {
  id: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_activity_calories: number;
  meals: MealEntryResponse[];
  activities: ActivityEntry[];
}

// Activity Entry
export interface ActivityEntry {
  id: string;
  activity_id: string;
  activity_name: string;
  activity_icon?: string;
  category?: string;
  duration_minutes: number;
  distance_km?: number;
  calories_burned: number;
  timestamp: string;
}

// Activity Catalog Item
export interface ActivityCatalogItem {
  id: string;
  name: string;
  name_short: string;
  category: string;
  icon: string;
  met: number;
  has_distance: boolean;
}

// Activity Category
export interface ActivityCategory {
  id: string;
  name: string;
  icon: string;
}

// Activity Catalog Response
export interface ActivityCatalogResponse {
  activities: ActivityCatalogItem[];
  categories: ActivityCategory[];
}

// DailyLog Summary (without meals)
export interface DailyLogSummary {
  id: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_count: number;
}

// Date Range Stats
export interface DateRangeStats {
  start_date: string;
  end_date: string;
  days: DailyLogSummary[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  avg_calories: number;
  avg_protein: number;
  avg_carbs: number;
  avg_fat: number;
  total_meals: number;
  days_count: number;
}

// Food Stats
export interface FoodStats {
  food_name: string;
  times_eaten: number;
  total_calories: number;
  total_weight: number;
  avg_calories_per_meal: number;
}

// Foydalanuvchi sozlamalari
export interface UserSettings {
  dailyCalorieGoal: number;
  dailyOqsilGoal: number;
  dailyCarbsGoal: number;
  dailyFatGoal: number;
  name: string;
  // Body metrics
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  gender?: 'male' | 'female';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export type GoalType = 'lose' | 'maintain' | 'gain';

// User model from backend
export interface User {
  id: string;
  email?: string;
  name?: string;
  user_type: 'anonymous' | 'registered' | 'telegram';
  daily_calorie_goal: number;
  daily_protein_goal: number;
  daily_carbs_goal: number;
  daily_fat_goal: number;
  // Body metrics
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  gender?: 'male' | 'female';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  bmr?: number;
  tdee?: number;
  // Goal
  goal_type?: GoalType;
  target_weight_kg?: number;
  target_date?: string;
  weekly_pace_kg?: number;
  // Reminders
  reminder_enabled?: boolean;
  reminder_morning?: string;
  reminder_evening?: string;
  timezone?: string;
  // Telegram
  telegram_id?: string;
  telegram_username?: string;
  telegram_photo_url?: string;
  // Subscription
  subscription_expires_at?: string;
  free_attempts_date?: string;
  free_attempts_used_today?: number;
}

// Goal-coach types
export interface TargetBreakdown {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  delta_kcal: number;
  bmr: number;
  tdee: number;
  goal_type: GoalType;
  weekly_pace_kg: number;
}

export interface GoalSummary {
  goal_type: GoalType;
  target_weight_kg?: number | null;
  target_date?: string | null;
  weekly_pace_kg?: number | null;
  current_weight_kg?: number | null;
  target: TargetBreakdown;
  eaten_calories: number;
  eaten_protein: number;
  eaten_carbs: number;
  eaten_fat: number;
  burned_calories: number;
  remaining_calories: number;
  projected_goal_date?: string | null;
}

export interface GoalSetupPayload {
  goal_type: GoalType;
  target_weight_kg?: number | null;
  target_date?: string | null;
  weekly_pace_kg?: number | null;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight_kg: number;
  note?: string | null;
  created_at: string;
}

export interface WeightHistoryPoint {
  date: string;
  weight_kg: number;
  ma7_kg?: number | null;
}

export interface WeightHistoryResponse {
  entries: WeightEntry[];
  history: WeightHistoryPoint[];
  current_kg?: number | null;
  start_kg?: number | null;
  change_kg?: number | null;
}

export interface WeightTrendResponse {
  history: WeightHistoryPoint[];
  target_weight_kg?: number | null;
  projected_goal_date?: string | null;
  slope_kg_per_week?: number | null;
}

// Coach
export interface MealSuggestion {
  name: string;
  kcal: number;
}

export interface MealSlot {
  key: 'breakfast' | 'lunch' | 'dinner' | 'snack' | string;
  icon: string;
  label: string;
  target_kcal: number;
  suggestions: MealSuggestion[];
}

export interface ExerciseSuggestion {
  name: string;
  icon: string;
  minutes: number;
  intensity: string;
  kcal: number;
  note: string;
}

export interface CoachToday {
  nudge: string;
  meal_plan: MealSlot[];
  exercise: ExerciseSuggestion | null;
  target_kcal: number;
  eaten_kcal: number;
  burned_kcal: number;
  remaining_kcal: number;
}

export interface WeeklyReport {
  days: number;
  avg_kcal: number;
  target_kcal: number;
  weight_change_kg: number | null;
  text: string;
}

export interface SubscriptionStatus {
  is_active: boolean;
  subscription_expires_at?: string | null;
  free_attempts_per_day: number;
  free_attempts_used_today: number;
  free_attempts_left_today: number;
  monthly_price: number;
  monthly_days: number;
  /** Pro + PAID_UNLIMITED: kunlik limit yo'q — UI "Cheksiz" ko'rsatadi. */
  unlimited_daily?: boolean;
  /** Mavjud bo'lsa frontend Payme GET-linkni o'zi quradi (backend chaqirilmaydi). */
  payme_merchant_id?: string | null;
  payme_account_key?: string | null;
  payme_account_value?: string | null;
  payme_checkout_base_url?: string | null;
  payme_callback_url?: string | null;
  payme_callback_timeout_ms?: string | null;
}

/** Payme checkout havolasi: pay_method="get" — window.open / openLink. */
export interface PaymePayLinkResponse {
  amount: number;
  days: number;
  /** GET URL (base64-encoded payload) yoki legacy POST action. */
  pay_url: string;
  pay_method: "get" | "post" | string;
  pay_form_fields: Record<string, string> | null;
  /** Telegram: bitta havola — brauzer / openLink */
  telegram_open_url?: string | null;
}

// Telegram WebApp types
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
    auth_date: number;
    hash: string;
  };
  ready: () => void;
  close: () => void;
  expand: () => void;
  /** Tashqi brauzerda havola (to'lov sahifalari) */
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Auth response
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Tab turlari
export type TabType = 'home' | 'daily' | 'history' | 'stats' | 'settings' | 'auth';
