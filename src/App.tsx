import { Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore, useUser, useIsLoading } from "./stores";
import { useDailyLog } from "./hooks/useDailyLog";
import LoadingSpinner from "./components/LoadingSpinner";
import BottomNavigation from "./components/BottomNavigation";
import PWAUpdatePrompt from "./components/PWAUpdatePrompt";
import SubscriptionFab from "./components/SubscriptionFab";
import { ToastProvider } from "./components/Toast";
import { lazyWithRetry } from "./utils/lazyWithRetry";

const HomePage = lazyWithRetry(() => import("./pages/HomePage"));
const DailyLogPage = lazyWithRetry(() => import("./pages/DailyLogPage"));
const HistoryPage = lazyWithRetry(() => import("./pages/HistoryPage"));
const StatsPage = lazyWithRetry(() => import("./pages/StatsPage"));
const SettingsPage = lazyWithRetry(() => import("./pages/SettingsPage"));
const AuthPage = lazyWithRetry(() => import("./pages/AuthPage"));
const AdminPage = lazyWithRetry(() => import("./pages/AdminPage"));
const CoachPage = lazyWithRetry(() => import("./pages/CoachPage"));

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

  useEffect(() => {
    if (!isInitialized) {
      initAuth();
    }
  }, [initAuth, isInitialized]);

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-stone-500 text-sm">Yuklanmoqda…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <ToastProvider>
        <div className="min-h-[100dvh] bg-stone-50">
          <div className="container mx-auto px-3 py-4 md:px-4 max-w-lg md:max-w-2xl">
            <Suspense fallback={<PageLoader />}>
              <AuthPage />
            </Suspense>
          </div>
        </div>
      </ToastProvider>
    );
  }

  const dailyCalories = dailyLog.totalCalories;
  const dailyGoal = user?.daily_calorie_goal || 2000;

  return (
    <ToastProvider>
      <div className="min-h-[100dvh] bg-stone-50">
        <div className="container mx-auto px-3 py-4 md:px-4 max-w-lg md:max-w-2xl pb-24">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/coach" element={<CoachPage />} />
              <Route path="/daily" element={<DailyLogPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>

        <SubscriptionFab />
        <BottomNavigation dailyCalories={dailyCalories} dailyGoal={dailyGoal} />
        <PWAUpdatePrompt />
      </div>
    </ToastProvider>
  );
}

export default App;
