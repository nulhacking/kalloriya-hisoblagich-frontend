import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToken, useUser } from "../stores";
import ImageUpload from "../components/ImageUpload";
import ResultsDisplay from "../components/ResultsDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import PrivacyPolicy from "../components/PrivacyPolicy";
import CalorieRing from "../components/CalorieRing";
import MacroRing from "../components/MacroRing";
import StatusBanner from "../components/StatusBanner";
import WeightLogCard from "../components/WeightLogCard";
import type { AnalysisResults } from "../types";
import {
  useAnalyzeFood,
  useSubscriptionStatus,
} from "../hooks/useFoodAnalysis";
import { useAddMeal } from "../hooks/useMeals";
import { useGoalSummary } from "../hooks/useGoal";

const HomePage = () => {
  const token = useToken();
  const user = useUser();
  const analyzeMutation = useAnalyzeFood();
  const addMealMutation = useAddMeal();
  const subscriptionQuery = useSubscriptionStatus();
  const navigate = useNavigate();
  const goalSummary = useGoalSummary(!!user?.bmr && !!user?.tdee);

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

  const summary = goalSummary.data;
  const hasGoal = !!summary && !!user?.goal_type;
  const target = summary?.target;

  return (
    <>
      {/* Coach Dashboard Hero */}
      {hasGoal && summary && target && (
        <div className="space-y-3 mb-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className="flex items-center gap-4">
              <CalorieRing
                eaten={summary.eaten_calories}
                target={target.calories}
                burned={summary.burned_calories}
              />
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider">
                    Maqsad
                  </div>
                  <div className="text-base font-semibold text-stone-900 mt-0.5">
                    {summary.goal_type === "lose"
                      ? "Ozish"
                      : summary.goal_type === "gain"
                        ? "Semirish"
                        : "Saqlash"}
                  </div>
                  {summary.target_weight_kg && (
                    <div className="text-xs text-stone-500 mt-0.5">
                      {user?.weight_kg ?? "?"} →{" "}
                      <span className="font-semibold text-stone-700">
                        {summary.target_weight_kg}
                      </span>{" "}
                      kg
                    </div>
                  )}
                </div>
                <div className="flex gap-2 text-[11px]">
                  <div className="rounded-lg bg-stone-50 px-2 py-1.5 flex-1">
                    <div className="text-stone-400">Sarflandi</div>
                    <div className="font-semibold text-stone-800">
                      {Math.round(summary.burned_calories)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-stone-50 px-2 py-1.5 flex-1">
                    <div className="text-stone-400">Net</div>
                    <div className="font-semibold text-stone-800">
                      {Math.round(summary.eaten_calories - summary.burned_calories)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Macro mini-rings */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-stone-200">
              <MacroRing
                label="Oqsil"
                emoji="🥩"
                current={summary.eaten_protein}
                target={target.protein_g}
                color="#22c55e"
              />
              <MacroRing
                label="Uglevod"
                emoji="🍞"
                current={summary.eaten_carbs}
                target={target.carbs_g}
                color="#eab308"
              />
              <MacroRing
                label="Yog'"
                emoji="🧈"
                current={summary.eaten_fat}
                target={target.fat_g}
                color="#f97316"
              />
            </div>
          </div>

          <StatusBanner summary={summary} />
          <WeightLogCard />
        </div>
      )}

      {!hasGoal && user?.bmr && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 mb-4">
          <div className="font-semibold text-stone-900 text-sm">Maqsad qo'ying</div>
          <div className="text-xs text-stone-500 mt-1 leading-relaxed">
            Sozlamalar bo'limida ozish, saqlash yoki semirish maqsadini tanlang —
            kunlik kaloriya targetingiz avtomatik hisoblanadi.
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 md:p-6">
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
              className="block text-xs font-semibold text-stone-700 mb-1.5"
            >
              Ixtiyoriy: ovqat haqida qo'shimcha ma'lumot
              <span className="font-normal text-stone-400">
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
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none disabled:opacity-60 resize-none"
            />
            <p className="text-[11px] text-stone-400 mt-1">
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
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {analyzeMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Tahlil qilinmoqda…</span>
                </>
              ) : (
                <span>Tahlil qilish</span>
              )}
            </button>
            {(image || results) && (
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-colors active:scale-[0.99]"
              >
                Tozalash
              </button>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl border border-red-200 bg-red-50 animate-shake">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!canAnalyze && (
          <div className="mt-4 p-3.5 rounded-xl border border-stone-200 bg-stone-50">
            <p className="text-sm text-stone-700">
              {subscription?.is_active
                ? "Kunlik limit tugadi. Ertaga avtomatik yangilanadi."
                : `Kunlik ${subscription?.free_attempts_per_day ?? 3} ta bepul tahlil tugadi.`}
            </p>
            {!subscription?.is_active && (
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="mt-2 text-sm font-semibold text-emerald-700 underline underline-offset-2"
              >
                Tariflarni ko'rish
              </button>
            )}
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="mt-4 animate-fade-in-up">
            <ResultsDisplay
              results={results}
              onAddMeal={handleAddMeal}
              showCoachUpsell={!subscription?.has_coach_access}
              onOpenCoach={() => navigate("/coach")}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center mt-5 text-xs text-stone-400">
        <p>Natijalar taxminiy</p>
        <button
          onClick={() => setShowPrivacyPolicy(true)}
          className="mt-1.5 text-stone-500 underline underline-offset-2 hover:text-stone-700 transition-colors"
        >
          Maxfiylik siyosati
        </button>
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
