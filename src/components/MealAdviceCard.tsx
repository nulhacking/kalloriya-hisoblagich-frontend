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
    ring: "border-stone-200",
    bg: "bg-white",
    text: "text-emerald-700",
  },
  tight: {
    icon: "✅",
    ring: "border-stone-200",
    bg: "bg-white",
    text: "text-emerald-700",
  },
  over: {
    icon: "⚠️",
    ring: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-stone-900",
  },
  full: {
    icon: "🛑",
    ring: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-600",
  },
  unknown: {
    icon: "⏱",
    ring: "border-stone-200",
    bg: "bg-white",
    text: "text-stone-900",
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
      className={`${style.bg} rounded-2xl p-4 border ${style.ring} space-y-3`}
    >
      {advice.text && (
        <p
          className={`font-semibold text-sm md:text-base flex items-start gap-2 ${style.text}`}
        >
          <span className="text-xl leading-none">{style.icon}</span>
          <span>{advice.text}</span>
        </p>
      )}

      <div className="bg-white rounded-xl p-3 space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Yegandan keyin
        </h4>

        <div className="flex items-start gap-2.5">
          <span className="text-lg leading-none">🚶</span>
          <p className="text-sm text-stone-700">
            <span className="font-semibold">
              {humanMinutes(advice.walk_after_minutes)}
            </span>
            dan so'ng — 10-15 daqiqa yengil yurish{" "}
            <span className="text-stone-400">(hazm uchun)</span>
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <span className="text-lg leading-none">🔥</span>
          <div className="text-sm text-stone-700">
            <p>
              <span className="font-semibold">
                {humanMinutes(advice.train_after_minutes)}
              </span>
              dan so'ng — mashq qilsangiz bo'ladi
            </p>
            {advice.burn.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {advice.burn.map((option) => (
                  <span
                    key={option.name}
                    className="px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-stone-700 border border-stone-200"
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
          className="w-full text-left bg-violet-600 text-white rounded-xl p-3 active:scale-[0.99] transition"
        >
          <p className="font-semibold text-sm">💎 Pro Plus — shaxsiy AI murabbiy</p>
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
