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

  const tabs: { id: "settings" | "feedback"; icon: string; label: string }[] = [
    { id: "settings", icon: "⚙️", label: "Sozlamalar" },
    { id: "feedback", icon: "💬", label: "Fikr" },
  ];

  return (
    <div className="space-y-4">
      {/* Segment Control */}
      <div className="relative bg-food-brown-100/60 backdrop-blur-sm rounded-2xl p-1 shadow-inner grid grid-cols-2 overflow-hidden">
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-white shadow-md transition-transform duration-300 ease-out"
          style={{
            transform: activeSection === "settings" ? "translateX(0)" : "translateX(100%)",
            marginLeft: "2px",
          }}
        />
        {tabs.map((tab) => {
          const active = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`relative z-10 py-2.5 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                active ? "text-food-green-700" : "text-food-brown-500"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Admin Button */}
      {isAdmin && (
        <button
          onClick={() => navigate("/admin")}
          className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold shadow-md flex items-center justify-center gap-2 hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all"
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
