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
  // Telegram
  telegram_id?: string;
  telegram_username?: string;
  telegram_photo_url?: string;
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
