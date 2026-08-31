import { useLocation, useNavigate } from "react-router-dom";

interface BottomNavigationProps {
  dailyCalories: number;
  dailyGoal: number;
}

/** Yagona chiziqli ikonka to'plami — emoji o'rniga, bir xil qalinlikda. */
const ICONS: Record<string, string> = {
  "/": "M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5",
  "/coach": "M20.5 11.6a8 8 0 0 1-11.6 7.2L4 20.3l1.5-4.6A8 8 0 1 1 20.5 11.6ZM9 11h.01M12 11h.01M15 11h.01",
  "/daily": "M4 19V9M10 19V5M16 19v-7M4 19h16",
  "/stats": "M3 17.5 9 11l4 4 8-8.5M21 6.5h-4.5M21 6.5V11",
  "/settings": "M4 7h9M17 7h3M4 17h3M11 17h9M15 5.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6M9 15.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6",
};

const BottomNavigation = ({
  dailyCalories,
  dailyGoal,
}: BottomNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs: { path: string; label: string }[] = [
    { path: "/", label: "Bosh" },
    { path: "/coach", label: "Murabbiy" },
    { path: "/daily", label: "Kunlik" },
    { path: "/stats", label: "Statistika" },
    { path: "/settings", label: "Sozlamalar" },
  ];

  const activeTab = location.pathname;
  const overGoal = dailyGoal > 0 && dailyCalories / dailyGoal >= 1;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="max-w-lg mx-auto px-2">
        <div className="flex justify-around items-stretch">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.path;

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-2"
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="relative">
                  <svg
                    className={`w-[22px] h-[22px] transition-colors ${
                      isActive ? "text-stone-900" : "text-stone-400"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={isActive ? 2 : 1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={ICONS[tab.path]} />
                  </svg>

                  {/* Kunlik kaloriya — faqat maqsaddan oshganda ogohlantiruvchi nuqta */}
                  {tab.path === "/daily" && overGoal && (
                    <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-stone-900" />
                  )}
                </span>

                <span
                  className={`text-[10px] transition-colors ${
                    isActive
                      ? "text-stone-900 font-semibold"
                      : "text-stone-400 font-medium"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
