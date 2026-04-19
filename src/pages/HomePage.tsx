import { useState } from "react";
import { useToken } from "../stores";
import ImageUpload from "../components/ImageUpload";
import ResultsDisplay from "../components/ResultsDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import PrivacyPolicy from "../components/PrivacyPolicy";
import type { AnalysisResults } from "../types";
import {
  useAnalyzeFood,
  useSubscriptionStatus,
} from "../hooks/useFoodAnalysis";
import { useAddMeal } from "../hooks/useMeals";

const HomePage = () => {
  const token = useToken();
  const analyzeMutation = useAnalyzeFood();
  const addMealMutation = useAddMeal();
  const subscriptionQuery = useSubscriptionStatus();

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userNote, setUserNote] = useState("");
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState<boolean>(false);

  const handleImageSelect = (file: File) => {
    if (file) {
      setImage(file);
      setResults(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!image) return;

    const status = subscriptionQuery.data;
    if (
      status &&
      !status.unlimited_daily &&
      status.free_attempts_left_today <= 0
    ) {
      return;
    }

    const note = userNote.trim();
    analyzeMutation.mutate(
      { imageFile: image, userNote: note || undefined },
      {
        onSuccess: (data) => {
          setResults(data);
          subscriptionQuery.refetch();
        },
        onError: () => {
          subscriptionQuery.refetch();
        },
      },
    );
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setUserNote("");
    setResults(null);
    analyzeMutation.reset();
  };

  const handleAddMeal = async (analysisResults: AnalysisResults) => {
    if (!token) return;

    try {
      // R2 image_url mavjud bo'lsa uni ishlatamiz, aks holda base64 preview
      const imagePreviewValue =
        analysisResults.image_url || imagePreview || undefined;

      const mealData = {
        food_name: analysisResults.food,
        weight_grams: analysisResults.estimated_weight_grams || 100,
        calories:
          analysisResults.total_nutrition?.calories ||
          analysisResults.nutrition_per_100g.calories ||
          0,
        protein:
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
        image_preview: imagePreviewValue,
      };

      await addMealMutation.mutateAsync(mealData);

      handleReset();
    } catch (err) {
      console.error("Ovqatni qo'shishda xatolik:", err);
    }
  };

  const loading = analyzeMutation.isPending || addMealMutation.isPending;
  const error = analyzeMutation.error
    ? analyzeMutation.error instanceof Error
      ? analyzeMutation.error.message
      : "Rasmni tahlil qilishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
    : null;
  const subscription = subscriptionQuery.data;
  const canAnalyze =
    !subscription ||
    subscription.unlimited_daily ||
    subscription.free_attempts_left_today > 0;

  return (
    <>
      {/* Main Content */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-4 md:p-6 border-2 border-food-green-100">
        {/* Image Upload Section */}
        <ImageUpload
          onImageSelect={handleImageSelect}
          imagePreview={imagePreview}
          disabled={loading}
        />

        {imagePreview && (
          <div className="mt-4">
            <label
              htmlFor="food-user-note"
              className="block text-xs font-bold text-food-brown-700 mb-1.5"
            >
              Ixtiyoriy: ovqat haqida qo'shimcha ma'lumot
              <span className="font-normal text-food-brown-500">
                {" "}
                (aniqlikni oshirish uchun)
              </span>
            </label>
            <textarea
              id="food-user-note"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              disabled={loading}
              maxLength={500}
              rows={3}
              placeholder="Masalan: lag'mon, go'sht ko'p; yoki stol ustidagi non va pishloq..."
              className="w-full rounded-2xl border-2 border-food-green-100 bg-food-brown-50/40 px-3 py-2.5 text-sm text-food-brown-900 placeholder:text-food-brown-400 focus:border-food-green-400 focus:outline-none focus:ring-2 focus:ring-food-green-200 disabled:opacity-60 resize-none"
            />
            <p className="text-[11px] text-food-brown-500 mt-1">
              {userNote.length}/500
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {imagePreview && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAnalyze}
              disabled={!image || loading || !canAnalyze}
              className="flex-1 group relative overflow-hidden bg-gradient-to-r from-food-green-500 via-food-green-600 to-food-green-500 hover:from-food-green-600 hover:via-food-green-700 hover:to-food-green-600 disabled:from-gray-300 disabled:via-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 md:py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              {analyzeMutation.isPending ? (
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

        {!canAnalyze && (
          <div className="mt-4 p-4 bg-gradient-to-r from-food-orange-50 to-food-red-50 border-2 border-food-orange-300 rounded-2xl">
            <p className="text-food-red-700 font-bold text-sm flex items-center gap-2">
              <span className="text-xl">🔒</span>
              {subscription?.is_active
                ? "Kunlik limit tugadi. Ertaga yana davom ettirishingiz mumkin."
                : "Kunlik 3 ta bepul urinish tugadi. O'ngdagi ⚡ tugmasini bosing — ko'p tahlil."}
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

      {/* Footer */}
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

      {/* Privacy Policy Modal */}
      <PrivacyPolicy
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </>
  );
};

export default HomePage;
