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
}

// Backend DailyLog response
export interface DailyLogResponse {
  id: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meals: MealEntryResponse[];
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
}

// User model from backend
export interface User {
  id: string;
  email?: string;
  name?: string;
  user_type: 'anonymous' | 'registered';
  daily_calorie_goal: number;
  daily_protein_goal: number;
  daily_carbs_goal: number;
  daily_fat_goal: number;
}

// Auth response
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Tab turlari
export type TabType = 'home' | 'daily' | 'history' | 'stats' | 'settings' | 'auth';
