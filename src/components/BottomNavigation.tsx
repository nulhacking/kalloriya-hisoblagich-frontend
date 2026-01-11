import type { TabType } from "../types";
import { useAuth } from "../contexts/AuthContext";

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  dailyCalories: number;
  dailyGoal: number;
}

const BottomNavigation = ({
  activeTab,
  onTabChange,
  dailyCalories,
  dailyGoal,
}: BottomNavigationProps) => {
  const { isRegistered, user } = useAuth();

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "home", label: "Bosh sahifa", icon: "🏠" },
    { id: "daily", label: "Kunlik", icon: "📊" },
    { id: "settings", label: "Sozlamalar", icon: "⚙️" },
    {
      id: "auth",
      label: isRegistered ? "Profil" : "Kirish",
      icon: isRegistered ? "👤" : "🔐",
    },
  ];

  const getCalorieColor = (): string => {
    const percent = (dailyCalories / dailyGoal) * 100;
    if (percent >= 100) return "text-food-red-500";
    if (percent >= 80) return "text-food-orange-500";
    return "text-food-green-500";
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-food-green-100 shadow-2xl z-50">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 pt-3 transition-all duration-300 relative ${
                activeTab === tab.id
                  ? "text-food-green-600"
                  : "text-food-brown-400 hover:text-food-brown-600"
              }`}
            >
              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-food-green-500 to-food-green-600 rounded-b-full"></div>
              )}

              {/* Icon with badge for daily tab */}
              <div className="relative">
                <span
                  className={`text-2xl transition-transform duration-300 block ${
                    activeTab === tab.id ? "scale-110" : ""
                  }`}
                >
                  {tab.icon}
                </span>

                {/* Kaloriya badge kunlik tabda */}
                {tab.id === "daily" && dailyCalories > 0 && (
                  <span
                    className={`absolute -top-1 -right-3 px-1.5 py-0.5 rounded-full text-xs font-bold bg-white border-2 ${getCalorieColor().replace(
                      "text-",
                      "border-"
                    )} ${getCalorieColor()}`}
                  >
                    {Math.round(dailyCalories)}
                  </span>
                )}

                {/* Registered badge for auth tab */}
                {tab.id === "auth" && isRegistered && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-food-green-500 rounded-full border-2 border-white"></span>
                )}

                {/* Anonymous indicator */}
                {tab.id === "auth" && !isRegistered && user && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-food-yellow-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs mt-1 font-medium transition-all duration-300 ${
                  activeTab === tab.id ? "font-bold" : ""
                }`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]"></div>
    </nav>
  );
};

export default BottomNavigation;
