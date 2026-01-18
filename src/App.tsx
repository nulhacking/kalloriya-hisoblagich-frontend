import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore, useUser, useIsLoading } from "./stores";
import { useDailyLog } from "./hooks/useDailyLog";
import LoadingSpinner from "./components/LoadingSpinner";
import BottomNavigation from "./components/BottomNavigation";
import PWAUpdatePrompt from "./components/PWAUpdatePrompt";

// Lazy load pages for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const DailyLogPage = lazy(() => import("./pages/DailyLogPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <LoadingSpinner size="lg" />
  </div>
);

function App() {
  const authLoading = useIsLoading();
  const user = useUser();
  const initAuth = useAuthStore((state) => state.initAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const { dailyLog } = useDailyLog();

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      initAuth();
    }
  }, [initAuth, isInitialized]);

  // Auth loading screen
  if (authLoading) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-food-green-50 via-food-yellow-50 to-food-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-soft">🍽️</div>
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-food-brown-600 font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const dailyCalories = dailyLog.totalCalories;
  const dailyGoal = user?.daily_calorie_goal || 2000;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-food-green-50 via-food-yellow-50 to-food-orange-50 food-pattern relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-5 w-32 h-32 md:w-64 md:h-64 bg-food-green-300 rounded-full mix-blend-multiply filter blur-2xl md:blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 right-5 w-32 h-32 md:w-64 md:h-64 bg-food-yellow-300 rounded-full mix-blend-multiply filter blur-2xl md:blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/3 w-32 h-32 md:w-64 md:h-64 bg-food-orange-300 rounded-full mix-blend-multiply filter blur-2xl md:blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-3 py-4 md:px-4 max-w-lg md:max-w-2xl relative z-10 pb-24">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/daily" element={<DailyLogPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation dailyCalories={dailyCalories} dailyGoal={dailyGoal} />

      {/* PWA Update Prompt */}
      <PWAUpdatePrompt />
    </div>
  );
}

export default App;
