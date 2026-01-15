import { useAuth } from "../contexts/AuthContext";
import { useDailyLog } from "../hooks/useDailyLog";
import DailyLogComponent from "../components/DailyLog";
import type { UserSettings } from "../types";

const DailyLogPage = () => {
  const { user } = useAuth();
  const { dailyLog, removeMealFromLog } = useDailyLog();

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

  return (
    <DailyLogComponent
      dailyLog={dailyLog}
      settings={settings}
      onDeleteMeal={handleDeleteMeal}
    />
  );
};

export default DailyLogPage;
