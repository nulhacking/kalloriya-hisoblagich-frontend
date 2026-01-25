import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useUser } from "../stores";
import Settings from "../components/Settings";
import Feedback from "../components/Feedback";
import { checkAdminStatus } from "../services/api";
import type { UserSettings } from "../types";

const SettingsPage = () => {
  const user = useUser();
  const token = useAuthStore((state) => state.token);
  const updateSettings = useAuthStore((state) => state.updateSettings);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"settings" | "feedback">("settings");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (token) {
        const result = await checkAdminStatus(token);
        setIsAdmin(result.is_admin);
      }
    };
    checkAdmin();
  }, [token]);

  const settings: UserSettings = {
    dailyCalorieGoal: user?.daily_calorie_goal || 2000,
    dailyOqsilGoal: user?.daily_protein_goal || 80,
    dailyCarbsGoal: user?.daily_carbs_goal || 250,
    dailyFatGoal: user?.daily_fat_goal || 65,
    name: user?.name || "",
    // Body metrics
    weight_kg: user?.weight_kg,
    height_cm: user?.height_cm,
    age: user?.age,
    gender: user?.gender,
    activity_level: user?.activity_level,
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

      {/* Admin Button */}
      {isAdmin && (
        <button
          onClick={() => navigate("/admin")}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:from-purple-600 hover:to-purple-700 transition-all"
        >
          <span>👨‍💼</span>
          <span>Admin Panel</span>
        </button>
      )}

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
