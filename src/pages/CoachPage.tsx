import { useMemo, useState } from "react";
import { useUser } from "../stores";
import { useCoachToday, useWeeklyReport } from "../hooks/useCoach";
import { useTodayLog } from "../hooks/useMeals";
import MealPlanCard from "../components/MealPlanCard";
import ExercisePlanCard from "../components/ExercisePlanCard";
import LoadingSpinner from "../components/LoadingSpinner";
import CoachAssistant from "../components/CoachAssistant";

type CoachTab = "murabbiy" | "reja";

const TABS: { key: CoachTab; icon: string; label: string }[] = [
  { key: "murabbiy", icon: "🎭", label: "AI murabbiy" },
  { key: "reja", icon: "🧭", label: "Bugungi reja" },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const CoachPage = () => {
  const user = useUser();
  const [tab, setTab] = useState<CoachTab>("murabbiy");
  const ready = !!user?.bmr && !!user?.tdee;

  // Reja so'rovi faqat o'z bo'limi ochilganda ketadi — AI murabbiy bo'limida keraksiz.
  const planEnabled = ready && tab === "reja";
  const { data, isLoading, error } = useCoachToday(planEnabled);
  const todayLog = useTodayLog();
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const weekly = useWeeklyReport(weeklyOpen && planEnabled);

  // Today's logged meal names + done activity names — for ✓ persistence
  const loggedNames = useMemo(() => {
    const set = new Set<string>();
    todayLog.data?.meals?.forEach((m) => set.add(normalize(m.food_name)));
    return set;
  }, [todayLog.data?.meals]);

  const exerciseDone = useMemo(() => {
    if (!data?.exercise) return false;
    const target = normalize(data.exercise.name);
    return !!todayLog.data?.activities?.some(
      (a) => normalize(a.activity_name) === target,
    );
  }, [data?.exercise, todayLog.data?.activities]);

  /** Bugungi reja bo'limi — tana ma'lumotlarisiz hisoblab bo'lmaydi. */
  const renderPlan = () => {
    if (!ready) {
      return (
        <div className="bg-white/95 rounded-2xl p-6 border-2 border-food-green-100 text-center">
          <div className="text-5xl mb-3">🎯</div>
          <h2 className="text-lg font-extrabold text-food-brown-800">
            Avval maqsad qo'ying
          </h2>
          <p className="text-sm text-food-brown-600 mt-2">
            Reja tuzish uchun Sozlamalar bo'limida tana ma'lumotlaringizni va
            maqsadingizni kiriting.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error || !data) {
      return (
        <div className="bg-food-red-50 border-2 border-food-red-200 rounded-2xl p-4 text-food-red-700 font-bold text-sm">
          ⚠️ Reja ma'lumotlarini yuklashda xatolik. Internet aloqani tekshiring.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Nudge banner */}
        <div className="bg-gradient-to-r from-food-green-100 via-food-yellow-100 to-food-orange-100 rounded-2xl p-4 border-2 border-white shadow-sm">
          <p className="text-food-brown-800 font-medium leading-relaxed">
            {data.nudge}
          </p>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="bg-white/70 rounded-lg p-2">
              <div className="text-[10px] text-food-brown-500">Target</div>
              <div className="font-bold text-food-brown-800 text-sm">
                {data.target_kcal}
              </div>
            </div>
            <div className="bg-white/70 rounded-lg p-2">
              <div className="text-[10px] text-food-brown-500">Yedingiz</div>
              <div className="font-bold text-food-green-700 text-sm">
                {Math.round(data.eaten_kcal)}
              </div>
            </div>
            <div className="bg-white/70 rounded-lg p-2">
              <div className="text-[10px] text-food-brown-500">Qoldi</div>
              <div className="font-bold text-food-orange-700 text-sm">
                {data.remaining_kcal}
              </div>
            </div>
          </div>
        </div>

        <ExercisePlanCard exercise={data.exercise} done={exerciseDone} />

        <MealPlanCard plan={data.meal_plan} loggedNames={loggedNames} />

        {/* Weekly report */}
        <div className="bg-white/95 rounded-2xl border-2 border-food-blue-100 overflow-hidden">
          <button
            onClick={() => setWeeklyOpen((p) => !p)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-food-blue-50 transition-colors"
          >
            <span className="font-bold text-food-brown-800 flex items-center gap-2">
              <span>📊</span> Haftalik hisobot
            </span>
            <span className="text-food-brown-500">{weeklyOpen ? "▲" : "▼"}</span>
          </button>
          {weeklyOpen && (
            <div className="p-4 border-t border-food-blue-100">
              {weekly.isLoading ? (
                <div className="text-center py-4">
                  <LoadingSpinner size="md" />
                </div>
              ) : weekly.data ? (
                <pre className="whitespace-pre-wrap text-sm text-food-brown-700 font-medium leading-relaxed">
                  {weekly.data.text}
                </pre>
              ) : (
                <p className="text-sm text-food-brown-600">
                  Hisobot mavjud emas.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Bo'limlar: AI murabbiy | Bugungi reja */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-1 flex gap-1 border-2 border-white shadow-sm">
        {TABS.map((item) => {
          const isActive = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-food-green-500 to-food-green-600 text-white shadow-sm"
                  : "text-food-brown-500"
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "murabbiy" ? <CoachAssistant /> : renderPlan()}
    </div>
  );
};

export default CoachPage;
