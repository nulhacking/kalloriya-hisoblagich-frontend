import { useState, useEffect } from "react";
import { analyzeFood } from "./services/api";
import ImageUpload from "./components/ImageUpload";
import ResultsDisplay from "./components/ResultsDisplay";
import LoadingSpinner from "./components/LoadingSpinner";
import PrivacyPolicy from "./components/PrivacyPolicy";
import DailyLogComponent from "./components/DailyLog";
import Settings from "./components/Settings";
import BottomNavigation from "./components/BottomNavigation";
import type {
  AnalysisResults,
  TabType,
  DailyLog,
  MealEntry,
  UserSettings,
} from "./types";

// LocalStorage kalitlari
const STORAGE_KEYS = {
  DAILY_LOG: "kaloriya_daily_log",
  SETTINGS: "kaloriya_settings",
};

// Default sozlamalar
const DEFAULT_SETTINGS: UserSettings = {
  dailyCalorieGoal: 2000,
  dailyOqsilGoal: 80,
  dailyCarbsGoal: 250,
  dailyFatGoal: 65,
  name: "",
};

// Bugungi sana YYYY-MM-DD formatda
const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Bo'sh kunlik log
const createEmptyDailyLog = (): DailyLog => ({
  date: getTodayDate(),
  meals: [],
  totalCalories: 0,
  totalOqsil: 0,
  totalCarbs: 0,
  totalFat: 0,
});

// LocalStorage dan boshlang'ich qiymatlarni olish
const getInitialSettings = (): UserSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Sozlamalarni yuklashda xatolik:", e);
  }
  return DEFAULT_SETTINGS;
};

const getInitialDailyLog = (): DailyLog => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_LOG);
    if (saved) {
      const parsed: DailyLog = JSON.parse(saved);
      // Agar bugungi kun bo'lsa, qaytaramiz
      if (parsed.date === getTodayDate()) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Kunlik logni yuklashda xatolik:", e);
  }
  return createEmptyDailyLog();
};

function App() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState<boolean>(false);

  // Tab va yangi state'lar - LocalStorage dan boshlang'ich qiymatlar bilan
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [dailyLog, setDailyLog] = useState<DailyLog>(getInitialDailyLog);
  const [settings, setSettings] = useState<UserSettings>(getInitialSettings);

  // Kunlik log o'zgarganda saqlash
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAILY_LOG, JSON.stringify(dailyLog));
  }, [dailyLog]);

  // Sozlamalar o'zgarganda saqlash
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Ovqatni kunlik hisobga qo'shish
  const handleAddMeal = (analysisResults: AnalysisResults) => {
    const newMeal: MealEntry = {
      id: Date.now().toString(),
      food: analysisResults.food,
      calories:
        analysisResults.total_nutrition?.calories ||
        analysisResults.nutrition_per_100g.calories ||
        0,
      oqsil:
        analysisResults.total_nutrition?.oqsil ||
        analysisResults.nutrition_per_100g.oqsil ||
        0,
      carbs:
        analysisResults.total_nutrition?.carbs ||
        analysisResults.nutrition_per_100g.carbs ||
        0,
      fat:
        analysisResults.total_nutrition?.fat ||
        analysisResults.nutrition_per_100g.fat ||
        0,
      weight_grams: analysisResults.estimated_weight_grams || 100,
      timestamp: Date.now(),
      imagePreview: imagePreview || undefined,
    };

    setDailyLog((prev) => {
      const updatedMeals = [...prev.meals, newMeal];
      return {
        ...prev,
        meals: updatedMeals,
        totalCalories: prev.totalCalories + newMeal.calories,
        totalOqsil: prev.totalOqsil + newMeal.oqsil,
        totalCarbs: prev.totalCarbs + newMeal.carbs,
        totalFat: prev.totalFat + newMeal.fat,
      };
    });
  };

  // Ovqatni o'chirish
  const handleDeleteMeal = (mealId: string) => {
    setDailyLog((prev) => {
      const mealToDelete = prev.meals.find((m) => m.id === mealId);
      if (!mealToDelete) return prev;

      return {
        ...prev,
        meals: prev.meals.filter((m) => m.id !== mealId),
        totalCalories: prev.totalCalories - mealToDelete.calories,
        totalOqsil: prev.totalOqsil - mealToDelete.oqsil,
        totalCarbs: prev.totalCarbs - mealToDelete.carbs,
        totalFat: prev.totalFat - mealToDelete.fat,
      };
    });
  };

  // Sozlamalarni saqlash
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  const handleImageSelect = (file: File) => {
    if (file) {
      setImage(file);
      setResults(null);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError("Iltimos, avval rasm tanlang");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await analyzeFood(image);
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Rasmni tahlil qilishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setResults(null);
    setError(null);
  };

  // Bosh sahifa renderini alohida funksiya sifatida
  const renderHomeTab = () => (
    <>
      {/* Header - Mobile optimized */}
      <header className="text-center mb-4 md:mb-8">
        <div className="inline-block">
          <div className="relative">
            {/* Logo/Icon */}
            <div className="text-5xl md:text-6xl mb-2 animate-bounce-soft">
              🍽️
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold gradient-text-food mb-1 md:mb-2">
              Kaloriya Hisoblagich
            </h1>
            <p className="text-sm md:text-base text-food-brown-600 font-medium">
              AI bilan ovqat kaloriyalarini aniqlang
            </p>
          </div>
        </div>
        {/* Tags */}
        <div className="flex justify-center gap-2 mt-3">
          <span className="px-2.5 py-1 bg-food-green-100 text-food-green-700 rounded-full text-xs font-bold border border-food-green-200">
            ⚡ Tezkor
          </span>
          <span className="px-2.5 py-1 bg-food-yellow-100 text-food-yellow-700 rounded-full text-xs font-bold border border-food-yellow-200">
            🎯 Aniq
          </span>
          <span className="px-2.5 py-1 bg-food-orange-100 text-food-orange-700 rounded-full text-xs font-bold border border-food-orange-200">
            🤖 AI
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-4 md:p-6 border-2 border-food-green-100">
        {/* Image Upload Section */}
        <ImageUpload
          onImageSelect={handleImageSelect}
          imagePreview={imagePreview}
          disabled={loading}
        />

        {/* Action Buttons */}
        {imagePreview && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAnalyze}
              disabled={!image || loading}
              className="flex-1 group relative overflow-hidden bg-gradient-to-r from-food-green-500 via-food-green-600 to-food-green-500 hover:from-food-green-600 hover:via-food-green-700 hover:to-food-green-600 disabled:from-gray-300 disabled:via-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 md:py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="text-sm md:text-base">Tahlil...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">🔍</span>
                  <span className="text-sm md:text-base">Tahlil qilish</span>
                </>
              )}
            </button>
            {(image || results) && (
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-4 md:px-6 py-3.5 md:py-4 bg-gradient-to-r from-food-red-100 to-food-red-200 hover:from-food-red-200 hover:to-food-red-300 disabled:from-gray-100 disabled:to-gray-200 disabled:cursor-not-allowed text-food-red-700 font-bold rounded-2xl transition-all duration-300 shadow-md active:scale-95 flex items-center gap-1"
              >
                <span className="text-lg">🔄</span>
                <span className="hidden md:inline text-sm">Tozalash</span>
              </button>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-gradient-to-r from-food-red-50 to-food-red-100 border-2 border-food-red-300 rounded-2xl animate-shake">
            <p className="text-food-red-700 font-bold text-sm flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="mt-4 animate-fade-in-up">
            <ResultsDisplay results={results} onAddMeal={handleAddMeal} />
          </div>
        )}
      </div>

      {/* Footer - Mobile optimized */}
      <footer className="text-center mt-4 md:mt-6 text-food-brown-600 text-xs md:text-sm">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 md:p-4 shadow-md border border-food-green-100">
          <p className="font-medium flex items-center justify-center gap-1">
            <span>📸</span> Ovqat rasmini yuklab kaloriyani bilib oling
          </p>
          <p className="text-food-brown-500 mt-1 text-xs">
            ⚠️ Natijalar taxminiy
          </p>
          <button
            onClick={() => setShowPrivacyPolicy(true)}
            className="mt-2 text-food-green-600 hover:text-food-green-700 font-medium underline underline-offset-2 flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <span>🔒</span> Maxfiylik siyosati
          </button>
        </div>
      </footer>
    </>
  );

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-food-green-50 via-food-yellow-50 to-food-orange-50 food-pattern relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-5 w-32 h-32 md:w-64 md:h-64 bg-food-green-300 rounded-full mix-blend-multiply filter blur-2xl md:blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 right-5 w-32 h-32 md:w-64 md:h-64 bg-food-yellow-300 rounded-full mix-blend-multiply filter blur-2xl md:blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/3 w-32 h-32 md:w-64 md:h-64 bg-food-orange-300 rounded-full mix-blend-multiply filter blur-2xl md:blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-3 py-4 md:px-4 max-w-lg md:max-w-2xl relative z-10 pb-24">
        {/* Tab Content */}
        {activeTab === "home" && renderHomeTab()}

        {activeTab === "daily" && (
          <DailyLogComponent
            dailyLog={dailyLog}
            settings={settings}
            onDeleteMeal={handleDeleteMeal}
          />
        )}

        {activeTab === "settings" && (
          <Settings settings={settings} onSaveSettings={handleSaveSettings} />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dailyCalories={dailyLog.totalCalories}
        dailyGoal={settings.dailyCalorieGoal}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicy
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </div>
  );
}

export default App;
