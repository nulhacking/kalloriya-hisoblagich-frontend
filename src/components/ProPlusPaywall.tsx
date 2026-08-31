import { usePaymePurchase } from "../hooks/usePaymePurchase";
import { PLAN_META, formatSum, resolvePlan } from "../utils/plan";
import { useToast } from "./Toast";

const FEATURES = [
  "Shaxsiy AI murabbiy — 7 uslubdan tanlaysiz",
  "Cheklovsiz suhbat va savol-javob",
  "Cheklovsiz rasm tahlili",
  "Kunlik ovqat, mashq va haftalik hisobot",
];

interface ProPlusPaywallProps {
  /** Kompakt ko'rinish — chat ostidagi tor joy uchun. */
  compact?: boolean;
  title?: string;
  subtitle?: string;
}

/**
 * Pro Plus taklifi — AI murabbiy shu tarifda ochiladi.
 * Narx backenddan keladi (`pro_plus_price`), frontendda qattiq yozilmagan.
 */
const ProPlusPaywall = ({
  compact = false,
  title = "AI murabbiy — Pro Plus da",
  subtitle,
}: ProPlusPaywallProps) => {
  const toast = useToast();
  const { subscription, pay, isPending, busy } = usePaymePurchase();

  const meta = PLAN_META.pro_plus;
  const price = subscription?.pro_plus_price ?? 99000;
  const days = subscription?.pro_plus_days ?? 30;
  const currentPlan = resolvePlan(subscription);

  const handlePay = async () => {
    try {
      await pay(price);
    } catch (error) {
      console.error("Pro Plus to'lov havolasi:", error);
      toast.error("To'lov havolasini ochib bo'lmadi. Keyinroq urinib ko'ring.");
    }
  };

  return (
    <div className={`rounded-2xl border ${meta.border} bg-white p-4`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full ${meta.solid}`} />
          <h3 className="text-base font-semibold text-stone-900">
            {meta.label}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <span className="text-base font-semibold text-stone-900">
            {formatSum(price)}
          </span>
          <span className="text-[11px] text-stone-400 ml-1">
            so'm / {days} kun
          </span>
        </div>
      </div>

      <p className="text-sm text-stone-600 mt-2 leading-relaxed">
        {subtitle ?? title}
      </p>

      {!compact && (
        <ul className="mt-3 space-y-1.5">
          {FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex gap-2 text-xs text-stone-600 leading-relaxed"
            >
              <span className={`${meta.text} shrink-0`}>—</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={busy || !subscription}
        className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors active:scale-[0.99] disabled:opacity-50 ${meta.solid}`}
      >
        {isPending(price)
          ? "Ochilmoqda…"
          : currentPlan === "pro"
            ? "Pro Plus ga o'tish"
            : "Pro Plus olish"}
      </button>

      <p className="text-[11px] text-stone-400 text-center mt-2">
        To'lov Payme orqali. Obuna avtomatik uzaytirilmaydi.
      </p>
    </div>
  );
};

export default ProPlusPaywall;
