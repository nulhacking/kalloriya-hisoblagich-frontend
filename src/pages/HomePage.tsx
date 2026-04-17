import { useState } from "react";
import { useIsTelegramMiniApp, useToken } from "../stores";
import ImageUpload from "../components/ImageUpload";
import ResultsDisplay from "../components/ResultsDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import PrivacyPolicy from "../components/PrivacyPolicy";
import type { AnalysisResults } from "../types";
import {
  useAnalyzeFood,
  useCreatePaymePayLink,
  useSubscriptionStatus,
} from "../hooks/useFoodAnalysis";
import { useAddMeal } from "../hooks/useMeals";

const HomePage = () => {
  const token = useToken();
  const isTelegramMiniApp = useIsTelegramMiniApp();
  const analyzeMutation = useAnalyzeFood();
  const addMealMutation = useAddMeal();
  const subscriptionQuery = useSubscriptionStatus();
  const paymePayMutation = useCreatePaymePayLink();

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    if (status && !status.is_active && status.free_attempts_left_today <= 0) {
      return;
    }

    analyzeMutation.mutate(image, {
      onSuccess: (data) => {
        setResults(data);
        subscriptionQuery.refetch();
      },
      onError: () => {
        subscriptionQuery.refetch();
      },
    });
  };

  const handleOpenPaymePayment = async () => {
    try {
      const amount = subscription?.monthly_price ?? 20000;

      const response = await paymePayMutation.mutateAsync(amount);
      const tgOpen = response.telegram_open_url?.trim();
      if (isTelegramMiniApp && tgOpen) {
        const webApp = window.Telegram?.WebApp;
        const open = webApp && "openLink" in webApp ? webApp.openLink : undefined;
        if (typeof open === "function") {
          open.call(webApp, tgOpen, { try_instant_view: false });
        } else {
          window.open(tgOpen, "_blank", "noopener,noreferrer");
        }
        return;
      }
      if (
        response.pay_method === "post" &&
        response.pay_form_fields &&
        Object.keys(response.pay_form_fields).length > 0
      ) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = response.pay_url;
        form.target = "_blank";
        form.acceptCharset = "UTF-8";
        for (const [name, value] of Object.entries(response.pay_form_fields)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        form.remove();
      } else {
        window.open(response.pay_url, "_blank");
      }
    } catch (err) {
      console.error("Payme link olishda xatolik:", err);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setResults(null);
    analyzeMutation.reset();
  };

  const handleAddMeal = async (analysisResults: AnalysisResults) => {
    if (!token) return;

    try {
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
        image_preview: imagePreview || undefined,
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
    subscription.is_active ||
    subscription.free_attempts_left_today > 0;
  const attemptsLabel = `${subscription?.free_attempts_left_today ?? 0}/${subscription?.free_attempts_per_day ?? 3}`;
  const defaultPrice = subscription?.monthly_price ?? 20000;

  return (
    <>
      {/* Header */}
      <header className="text-center mb-4 md:mb-8">
        <div className="inline-block">
          <div className="relative">
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
        {/* Subscription Card */}
        <div className="mb-4 rounded-2xl border-2 border-food-blue-200 bg-gradient-to-br from-food-blue-50 to-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-food-brown-800">
                Obuna holati
              </p>
              <p className="text-xs text-food-brown-600 mt-1">
                Bugungi urinishlar:{" "}
                <span className="font-bold">{attemptsLabel}</span>
              </p>
              {subscription?.subscription_expires_at && (
                <p className="text-xs text-food-green-700 mt-1">
                  Aktiv muddat:{" "}
                  {new Date(subscription.subscription_expires_at).toLocaleDateString(
                    "uz-UZ",
                  )}
                </p>
              )}
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                subscription?.is_active
                  ? "bg-food-green-100 text-food-green-700"
                  : "bg-food-orange-100 text-food-orange-700"
              }`}
            >
              {subscription?.is_active ? "AKTIV" : "FREE"}
            </span>
          </div>

          {!subscription?.is_active && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-food-brown-600">
                Bepul: kuniga 3 ta tahlil. Obuna:{" "}
                <span className="font-bold">{defaultPrice.toLocaleString("uz-UZ")} so'm</span>
                {" "}/ {subscription?.monthly_days ?? 30} kun — kuniga 20 ta AI tahlil.
              </p>
              <button
                type="button"
                onClick={handleOpenPaymePayment}
                disabled={paymePayMutation.isPending}
                className="w-full px-4 py-2.5 rounded-xl bg-[#00b277] hover:bg-[#009966] text-white text-sm font-bold disabled:opacity-60 transition-colors"
              >
                {paymePayMutation.isPending ? "..." : "💚 Payme orqali to'lash"}
              </button>
            </div>
          )}
        </div>

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
                ? "Kunlik limit tugadi (20 ta). Ertaga yana davom ettirishingiz mumkin."
                : "Kunlik 3 ta bepul urinish tugadi. Obunani faollashtiring — kuniga 20 ta."}
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
