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
