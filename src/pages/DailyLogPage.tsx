import { useUser } from "../stores";
import { useDailyLog } from "../hooks/useDailyLog";
import DailyLogComponent from "../components/DailyLog";
import { DailyLogPageSkeleton } from "../components/Skeleton";
import type { UserSettings } from "../types";

const DailyLogPage = () => {
  const user = useUser();
  const { dailyLog, dataLoading, removeMealFromLog, refetchLog } = useDailyLog();

  const settings: UserSettings = {
    dailyCalorieGoal: user?.daily_calorie_goal || 2000,
    dailyOqsilGoal: user?.daily_protein_goal || 80,
    dailyCarbsGoal: user?.daily_carbs_goal || 250,
    dailyFatGoal: user?.daily_fat_goal || 65,
    name: user?.name || "",
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await removeMealFromLog(mealId);
    } catch (err) {
      console.error("Ovqatni o'chirishda xatolik:", err);
    }
  };

  if (dataLoading) {
    return <DailyLogPageSkeleton />;
  }

  return (
    <DailyLogComponent
      dailyLog={dailyLog}
      settings={settings}
      onDeleteMeal={handleDeleteMeal}
      onRefresh={refetchLog}
    />
  );
};

export default DailyLogPage;
