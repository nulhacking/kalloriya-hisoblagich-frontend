import type { MealAdvice } from "../types";

interface MealAdviceCardProps {
  advice: MealAdvice;
  /** Pro Plus emas — kartochka oxirida murabbiy taklifi ko'rsatiladi. */
  showCoachUpsell?: boolean;
  onOpenCoach?: () => void;
}

/**
 * "Yeysizmi?" va "keyin nima qilasiz?" — tahlil natijasidagi eng muhim javob.
 *
 * Raqamlarni backend hisoblaydi (`coach/burn.py`), bu yerda faqat bezak.
 * Botdagi xabar bilan bir xil mazmun — foydalanuvchi ikkalasida bir narsani
 * ko'rishi kerak.
 */

const VERDICT_STYLE: Record<
  string,
  { icon: string; ring: string; bg: string; text: string }
> = {
  fits: {
    icon: "✅",
    ring: "border-food-green-300",
    bg: "from-food-green-50 to-food-green-100",
    text: "text-food-green-800",
  },
  tight: {
    icon: "✅",
    ring: "border-food-green-300",
    bg: "from-food-green-50 to-food-yellow-50",
    text: "text-food-green-800",
  },
  over: {
    icon: "⚠️",
    ring: "border-food-orange-300",
    bg: "from-food-yellow-50 to-food-orange-100",
    text: "text-food-brown-800",
  },
  full: {
    icon: "🛑",
    ring: "border-food-red-300",
    bg: "from-food-red-50 to-food-orange-50",
    text: "text-food-red-800",
  },
  unknown: {
    icon: "⏱",
    ring: "border-food-green-200",
    bg: "from-white to-food-green-50",
    text: "text-food-brown-800",
  },
};

/** 45 → "45 daqiqa", 90 → "1.5 soat". */
const humanMinutes = (minutes: number): string =>
  minutes < 60 ? `${minutes} daqiqa` : `${minutes / 60} soat`;

const MealAdviceCard = ({
  advice,
  showCoachUpsell = false,
  onOpenCoach,
}: MealAdviceCardProps) => {
  const style = VERDICT_STYLE[advice.verdict] ?? VERDICT_STYLE.unknown;

  return (
    <div
      className={`bg-gradient-to-br ${style.bg} rounded-2xl p-4 border-2 ${style.ring} space-y-3`}
    >
      {advice.text && (
        <p
          className={`font-bold text-sm md:text-base flex items-start gap-2 ${style.text}`}
        >
          <span className="text-xl leading-none">{style.icon}</span>
          <span>{advice.text}</span>
        </p>
      )}

      <div className="bg-white/70 rounded-xl p-3 space-y-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wide text-food-brown-500">
          Yegandan keyin
        </h4>

        <div className="flex items-start gap-2.5">
          <span className="text-lg leading-none">🚶</span>
          <p className="text-sm text-food-brown-700">
            <span className="font-bold">
              {humanMinutes(advice.walk_after_minutes)}
            </span>
            dan so'ng — 10-15 daqiqa yengil yurish{" "}
            <span className="text-food-brown-400">(hazm uchun)</span>
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <span className="text-lg leading-none">🔥</span>
          <div className="text-sm text-food-brown-700">
            <p>
              <span className="font-bold">
                {humanMinutes(advice.train_after_minutes)}
              </span>
              dan so'ng — mashq qilsangiz bo'ladi
            </p>
            {advice.burn.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {advice.burn.map((option) => (
                  <span
                    key={option.name}
                    className="px-2.5 py-1 bg-white rounded-full text-xs font-bold text-food-brown-700 border border-food-green-200"
                  >
                    {option.icon} {option.minutes} daq {option.name.toLowerCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCoachUpsell && (
        <button
          type="button"
          onClick={onOpenCoach}
          className="w-full text-left bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl p-3 active:scale-[0.99] transition"
        >
          <p className="font-bold text-sm">💎 Pro Plus — shaxsiy AI murabbiy</p>
          <p className="text-xs text-white/85 mt-0.5">
            Aynan shu ovqatga qarab aytadi: yeyish kerakmi, nimani almashtirish
            kerak, keyin qanday mashq.
          </p>
        </button>
      )}
    </div>
  );
};

export default MealAdviceCard;
