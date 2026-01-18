import { useNavigate } from "react-router-dom";
import { useAuthStore, useUser } from "../stores";
import Settings from "../components/Settings";
import type { UserSettings } from "../types";

const SettingsPage = () => {
  const user = useUser();
  const updateSettings = useAuthStore((state) => state.updateSettings);
  const navigate = useNavigate();

  const settings: UserSettings = {
    dailyCalorieGoal: user?.daily_calorie_goal || 2000,
    dailyOqsilGoal: user?.daily_protein_goal || 80,
    dailyCarbsGoal: user?.daily_carbs_goal || 250,
    dailyFatGoal: user?.daily_fat_goal || 65,
    name: user?.name || "",
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    try {
      await updateSettings(newSettings);
    } catch (err) {
      console.error("Sozlamalarni saqlashda xatolik:", err);
      throw err;
    }
  };

  const handleNavigateToAuth = () => {
    navigate("/auth");
  };

  return (
    <Settings
      settings={settings}
      onSaveSettings={handleSaveSettings}
      onNavigateToAuth={handleNavigateToAuth}
    />
  );
};

export default SettingsPage;
