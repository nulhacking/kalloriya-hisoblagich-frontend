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

// Kunlik log
export interface DailyLog {
  date: string; // YYYY-MM-DD format
  meals: MealEntry[];
  totalCalories: number;
  totalOqsil: number;
  totalCarbs: number;
  totalFat: number;
}

// Foydalanuvchi sozlamalari
export interface UserSettings {
  dailyCalorieGoal: number;
  dailyOqsilGoal: number;
  dailyCarbsGoal: number;
  dailyFatGoal: number;
  name: string;
}

// Tab turlari
export type TabType = 'home' | 'daily' | 'settings';
