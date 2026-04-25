import type { GoalSummary } from "../types";

interface StatusBannerProps {
  summary: GoalSummary | undefined;
}

interface BannerContent {
  emoji: string;
  title: string;
  sub: string;
  gradient: string;
  text: string;
}

function buildBanner(summary: GoalSummary): BannerContent {
  const target = summary.target.calories;
  const eaten = summary.eaten_calories;
  const net = Math.max(0, eaten - summary.burned_calories);
  const goal = summary.goal_type;

  // Over target
  if (net > target + 50) {
    const over = Math.round(net - target);
    if (goal === "gain") {
      return {
        emoji: "💪",
        title: `+${over} kkal surplus`,
        sub: "Mushak yig'ish uchun zo'r!",
        gradient: "from-food-orange-100 to-food-yellow-100",
        text: "text-food-orange-800",
      };
    }
    return {
      emoji: "⚠️",
      title: `Targetdan ${over} kkal oshdi`,
      sub: "Ertaga biroz mashq qiling",
      gradient: "from-food-red-100 to-food-orange-100",
      text: "text-food-red-700",
    };
  }

  // Close to target (within 100)
  if (Math.abs(net - target) <= 100) {
    return {
      emoji: "✅",
      title: "Maqsad yo'lidasiz",
      sub: "Ajoyib! Aynan shu balansda davom eting",
      gradient: "from-food-green-100 to-food-green-50",
      text: "text-food-green-800",
    };
  }

  // Low
  const remaining = Math.round(target - net);
  if (goal === "lose") {
    return {
      emoji: "🏃",
      title: `${remaining} kkal qoldi`,
      sub: "Deficit holatidasiz — davom eting",
      gradient: "from-food-green-100 to-food-yellow-50",
      text: "text-food-green-800",
    };
  }
  if (goal === "gain") {
    return {
      emoji: "🍽️",
      title: `Yana ${remaining} kkal yeng`,
      sub: "Semirish uchun surplus kerak",
      gradient: "from-food-orange-100 to-food-yellow-100",
      text: "text-food-orange-800",
    };
  }
  return {
    emoji: "💡",
    title: `${remaining} kkal qoldi`,
    sub: "Maqsadga yetish uchun davom eting",
    gradient: "from-food-yellow-100 to-food-orange-50",
    text: "text-food-brown-800",
  };
}

const StatusBanner = ({ summary }: StatusBannerProps) => {
  if (!summary) return null;
  const b = buildBanner(summary);
  return (
    <div className={`bg-gradient-to-r ${b.gradient} rounded-2xl p-4 border-2 border-white/60 shadow-sm`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{b.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-extrabold ${b.text}`}>{b.title}</div>
          <div className="text-xs text-food-brown-600 mt-0.5">{b.sub}</div>
        </div>
      </div>
    </div>
  );
};

export default StatusBanner;
