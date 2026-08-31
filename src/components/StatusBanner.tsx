import type { GoalSummary } from "../types";

interface StatusBannerProps {
  summary: GoalSummary | undefined;
}

interface BannerContent {
  title: string;
  sub: string;
  /** Chap chekkadagi ingichka aksent chizig'i — holatni rang bilan aytadi. */
  accent: string;
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
        title: `+${over} kkal surplus`,
        sub: "Mushak yig'ish uchun zo'r",
        accent: "bg-emerald-600",
        text: "text-stone-900",
      };
    }
    return {
      title: `Targetdan ${over} kkal oshdi`,
      sub: "Ertaga biroz mashq qiling",
      accent: "bg-red-500",
      text: "text-stone-900",
    };
  }

  // Close to target (within 100)
  if (Math.abs(net - target) <= 100) {
    return {
      title: "Maqsad yo'lidasiz",
      sub: "Aynan shu balansda davom eting",
      accent: "bg-emerald-600",
      text: "text-stone-900",
    };
  }

  // Low
  const remaining = Math.round(target - net);
  if (goal === "lose") {
    return {
      title: `${remaining} kkal qoldi`,
      sub: "Deficit holatidasiz — davom eting",
      accent: "bg-emerald-600",
      text: "text-stone-900",
    };
  }
  if (goal === "gain") {
    return {
      title: `Yana ${remaining} kkal yeng`,
      sub: "Semirish uchun surplus kerak",
      accent: "bg-amber-500",
      text: "text-stone-900",
    };
  }
  return {
    title: `${remaining} kkal qoldi`,
    sub: "Maqsadga yetish uchun davom eting",
    accent: "bg-stone-900",
    text: "text-stone-900",
  };
}

const StatusBanner = ({ summary }: StatusBannerProps) => {
  if (!summary) return null;
  const b = buildBanner(summary);
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex items-stretch gap-3">
        <span className={`w-1 rounded-full shrink-0 ${b.accent}`} aria-hidden />
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-semibold ${b.text}`}>{b.title}</div>
          <div className="text-xs text-stone-500 mt-0.5">{b.sub}</div>
        </div>
      </div>
    </div>
  );
};

export default StatusBanner;
