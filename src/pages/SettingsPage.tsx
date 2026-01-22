import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useUser } from "../stores";
import Settings from "../components/Settings";
import Feedback from "../components/Feedback";
import type { UserSettings } from "../types";

const SettingsPage = () => {
  const user = useUser();
  const updateSettings = useAuthStore((state) => state.updateSettings);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"settings" | "feedback">("settings");

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
    <div className="space-y-4">
      {/* Section Tabs */}
      <div className="flex bg-white/80 backdrop-blur-md rounded-2xl p-1.5 shadow-lg border-2 border-food-green-100">
        <button
          onClick={() => setActiveSection("settings")}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeSection === "settings"
              ? "bg-gradient-to-r from-food-green-500 to-food-green-600 text-white shadow-md"
              : "text-food-brown-600 hover:text-food-brown-800 hover:bg-food-green-50"
          }`}
        >
          <span>⚙️</span>
          <span>Sozlamalar</span>
        </button>
        <button
          onClick={() => setActiveSection("feedback")}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeSection === "feedback"
              ? "bg-gradient-to-r from-food-green-500 to-food-green-600 text-white shadow-md"
              : "text-food-brown-600 hover:text-food-brown-800 hover:bg-food-green-50"
          }`}
        >
          <span>💬</span>
          <span>Fikr-mulohaza</span>
        </button>
      </div>

      {/* Content */}
      {activeSection === "settings" ? (
        <Settings
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onNavigateToAuth={handleNavigateToAuth}
        />
      ) : (
        <Feedback />
      )}
    </div>
  );
};

export default SettingsPage;
