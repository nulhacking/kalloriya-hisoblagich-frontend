import { useLocation, useNavigate } from "react-router-dom";

interface BottomNavigationProps {
  dailyCalories: number;
  dailyGoal: number;
}

const BottomNavigation = ({
  dailyCalories,
  dailyGoal,
}: BottomNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs: { path: string; label: string; icon: string }[] = [
    { path: "/", label: "Bosh", icon: "🏠" },
    { path: "/daily", label: "Kunlik", icon: "📊" },
    { path: "/history", label: "Tarix", icon: "📅" },
    { path: "/stats", label: "Statistika", icon: "📈" },
    { path: "/settings", label: "Sozlamalar", icon: "⚙️" },
  ];

  const activeTab = location.pathname;

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
          {tabs.map((tab) => {
            const isActive = activeTab === tab.path;
            
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex-1 flex flex-col items-center py-2 pt-3 transition-all duration-300 relative ${
                  isActive
                    ? "text-food-green-600"
                    : "text-food-brown-400 hover:text-food-brown-600"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-food-green-500 to-food-green-600 rounded-b-full"></div>
                )}

                {/* Icon with badge for daily tab */}
                <div className="relative">
                  <span
                    className={`text-2xl transition-transform duration-300 block ${
                      isActive ? "scale-110" : ""
                    }`}
                  >
                    {tab.icon}
                  </span>

                  {/* Kaloriya badge kunlik tabda */}
                  {tab.path === "/daily" && dailyCalories > 0 && (
                    <span
                      className={`absolute -top-1 -right-3 px-1.5 py-0.5 rounded-full text-xs font-bold bg-white border-2 ${getCalorieColor().replace(
                        "text-",
                        "border-"
                      )} ${getCalorieColor()}`}
                    >
                      {Math.round(dailyCalories)}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-xs mt-1 font-medium transition-all duration-300 ${
                    isActive ? "font-bold" : ""
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]"></div>
    </nav>
  );
};

export default BottomNavigation;
