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
    { path: "/coach", label: "Coach", icon: "🧭" },
    { path: "/daily", label: "Kunlik", icon: "📊" },
    { path: "/stats", label: "Statistika", icon: "📈" },
    { path: "/settings", label: "Sozlamalar", icon: "⚙️" },
  ];

  const activeTab = location.pathname;

  const getCalorieColor = (): string => {
    const percent = (dailyCalories / dailyGoal) * 100;
    if (percent >= 100) return "text-food-red-600 border-food-red-400";
    if (percent >= 80) return "text-food-orange-600 border-food-orange-400";
    return "text-food-green-600 border-food-green-400";
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* subtle top fade shadow */}
      <div className="h-3 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />

      <div className="bg-white/95 backdrop-blur-xl border-t border-food-green-100 shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.12)]">
        <div className="max-w-lg mx-auto px-2">
          <div className="flex justify-around items-center">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.path;

              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className="flex-1 flex flex-col items-center pt-2.5 pb-1.5 relative"
                  aria-label={tab.label}
                >
                  {/* Pill background on active */}
                  <div
                    className={`absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-14 h-8 bg-gradient-to-r from-food-green-100 to-food-green-50 opacity-100"
                        : "w-14 h-8 opacity-0"
                    }`}
                  />

                  {/* Icon with badge */}
                  <div className="relative z-10">
                    <span
                      className={`text-xl block transition-all duration-300 ${
                        isActive ? "scale-110 -translate-y-0.5" : "opacity-70"
                      }`}
                    >
                      {tab.icon}
                    </span>

                    {tab.path === "/daily" && dailyCalories > 0 && (
                      <span
                        className={`absolute -top-1 -right-4 min-w-[22px] h-[18px] px-1 rounded-full text-[10px] font-extrabold bg-white border-2 flex items-center justify-center ${getCalorieColor()}`}
                      >
                        {Math.round(dailyCalories)}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] mt-0.5 font-bold transition-all duration-300 relative z-10 ${
                      isActive ? "text-food-green-700" : "text-food-brown-400"
                    }`}
                  >
                    {tab.label}
                  </span>

                  {/* Active dot indicator */}
                  <div
                    className={`h-1 w-1 rounded-full mt-0.5 transition-all duration-300 ${
                      isActive ? "bg-food-green-600 scale-100" : "scale-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
