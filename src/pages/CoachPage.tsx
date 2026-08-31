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
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center">
          <h2 className="text-base font-semibold text-stone-900">
            Avval maqsad qo'ying
          </h2>
          <p className="text-sm text-stone-500 mt-2 leading-relaxed">
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
        <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
          Reja ma'lumotlarini yuklashda xatolik. Internet aloqani tekshiring.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Nudge banner */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-700 leading-relaxed">{data.nudge}</p>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="rounded-lg bg-stone-50 p-2">
              <div className="text-[10px] text-stone-400">Target</div>
              <div className="font-semibold text-stone-900 text-sm mt-0.5">
                {data.target_kcal}
              </div>
            </div>
            <div className="rounded-lg bg-stone-50 p-2">
              <div className="text-[10px] text-stone-400">Yedingiz</div>
              <div className="font-semibold text-stone-900 text-sm mt-0.5">
                {Math.round(data.eaten_kcal)}
              </div>
            </div>
            <div className="rounded-lg bg-stone-50 p-2">
              <div className="text-[10px] text-stone-400">Qoldi</div>
              <div className="font-semibold text-stone-900 text-sm mt-0.5">
                {data.remaining_kcal}
              </div>
            </div>
          </div>
        </div>

        <ExercisePlanCard exercise={data.exercise} done={exerciseDone} />

        <MealPlanCard plan={data.meal_plan} loggedNames={loggedNames} />

        {/* Weekly report */}
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <button
            onClick={() => setWeeklyOpen((p) => !p)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-50 transition-colors"
          >
            <span className="font-semibold text-stone-900 text-sm">
              Haftalik hisobot
            </span>
            <span className="text-stone-400 text-xs">
              {weeklyOpen ? "▲" : "▼"}
            </span>
          </button>
          {weeklyOpen && (
            <div className="p-4 border-t border-stone-200">
              {weekly.isLoading ? (
                <div className="text-center py-4">
                  <LoadingSpinner size="md" />
                </div>
              ) : weekly.data ? (
                <pre className="whitespace-pre-wrap text-sm text-stone-700 leading-relaxed font-sans">
                  {weekly.data.text}
                </pre>
              ) : (
                <p className="text-sm text-stone-500">
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
      <div className="bg-stone-100 rounded-2xl p-1 flex gap-1">
        {TABS.map((item) => {
          const isActive = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500"
              }`}
            >
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
