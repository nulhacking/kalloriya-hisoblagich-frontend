import type { SubscriptionPlan } from "../types";
import { usePaymePurchase } from "../hooks/usePaymePurchase";
import {
  PLAN_META,
  daysLeft,
  formatExpiry,
  formatSum,
  resolvePlan,
} from "../utils/plan";
import { useToast } from "./Toast";

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  free: 0,
  pro: 1,
  pro_plus: 2,
};

interface PlanCardData {
  plan: Exclude<SubscriptionPlan, "free">;
  price: number;
  days: number;
  features: string[];
}

interface SubscriptionPanelProps {
  /** To'lov havolasi ochilgach chaqiriladi — masalan sheetni yopish uchun. */
  onPurchaseStarted?: () => void;
  /** Faqat tariflar: joriy holat va kunlik limit bloki chiqmaydi. */
  plansOnly?: boolean;
  /** Qaysi tarifga urg'u berilsin (paywall chaqiruvi uchun). */
  highlight?: Exclude<SubscriptionPlan, "free">;
}

/**
 * Tariflar paneli — Bepul / Pro / Pro Plus bitta joyda.
 *
 * Ilgari Pro Plus faqat murabbiy sahifasidagi paywallda ko'rinardi va aktiv
 * Pro Plus ham "PRO" deb yozilardi. Endi joriy tarif o'z nomi bilan
 * ko'rsatiladi, Pro Plus ga o'tish esa har doim ochiq turadi.
 */
const SubscriptionPanel = ({
  onPurchaseStarted,
  plansOnly = false,
  highlight,
}: SubscriptionPanelProps) => {
  const toast = useToast();
  const { subscription, pay, isPending, busy } = usePaymePurchase();

  if (!subscription) return null;

  const current = resolvePlan(subscription);
  const currentMeta = PLAN_META[current];
  const expiry = formatExpiry(subscription.subscription_expires_at);
  const left = daysLeft(subscription.subscription_expires_at);

  const unlimited = subscription.unlimited_daily ?? false;
  const used = subscription.free_attempts_used_today ?? 0;
  const limit = subscription.free_attempts_per_day ?? 3;
  const attemptsLeft =
    subscription.free_attempts_left_today ?? Math.max(limit - used, 0);
  const percentUsed =
    !unlimited && limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const exhausted = !unlimited && attemptsLeft <= 0;

  const cards: PlanCardData[] = [
    {
      plan: "pro",
      price: subscription.monthly_price ?? 20000,
      days: subscription.monthly_days ?? 30,
      features: [
        "Cheklovsiz AI tahlil — rasmdan kaloriya",
        "To'liq statistika va kunlik jurnal",
      ],
    },
    {
      plan: "pro_plus",
      price: subscription.pro_plus_price ?? 99000,
      days: subscription.pro_plus_days ?? 30,
      features: [
        "Pro dagi hamma imkoniyat",
        "Shaxsiy AI murabbiy — 7 uslub",
        "Cheklovsiz suhbat, ovqat va mashq rejasi",
      ],
    },
  ];

  const handlePay = async (amount: number) => {
    try {
      const opened = await pay(amount);
      if (opened) onPurchaseStarted?.();
    } catch (error) {
      console.error("Payme havolasi:", error);
      toast.error("To'lov havolasini ochib bo'lmadi. Keyinroq urinib ko'ring.");
    }
  };

  return (
    <div className="space-y-3">
      {!plansOnly && (
        <>
          {/* Joriy tarif — nomi bilan, shunda Pro Plus aktivligi bilinadi */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                  Joriy tarif
                </p>
                <p className="text-xl font-semibold text-stone-900 mt-0.5">
                  {currentMeta.label}
                </p>
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${currentMeta.bg} ${currentMeta.text} ${currentMeta.border}`}
              >
                {current === "free" ? "Faol emas" : "Aktiv"}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              {current === "free"
                ? currentMeta.tagline
                : expiry
                  ? `${expiry} gacha${left !== null ? ` · ${left} kun qoldi` : ""}`
                  : currentMeta.tagline}
            </p>
          </div>

          {/* Kunlik AI tahlil */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-stone-600">Bugungi AI tahlil</span>
              <span className="text-sm font-semibold text-stone-900">
                {unlimited ? "Cheklovsiz" : `${used} / ${limit}`}
              </span>
            </div>
            {!unlimited && (
              <>
                <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden mt-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      exhausted ? "bg-stone-900" : "bg-emerald-600"
                    }`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  {exhausted
                    ? "Kunlik limit tugadi — ertaga yangilanadi."
                    : `Yana ${attemptsLeft} ta tahlil qolgan.`}
                </p>
              </>
            )}
          </div>
        </>
      )}

      <div>
        <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-2 px-1">
          Tariflar
        </p>
        <div className="space-y-3">
          {cards.map((card) => {
            const meta = PLAN_META[card.plan];
            const isCurrent = current === card.plan;
            // Pro Plus aktivda Pro allaqachon "ichida" — qayta sotib olish shart emas.
            const included = PLAN_RANK[current] > PLAN_RANK[card.plan];
            const emphasized = highlight
              ? highlight === card.plan
              : !isCurrent && !included;

            return (
              <div
                key={card.plan}
                className={`rounded-2xl border bg-white p-4 ${
                  isCurrent ? meta.border : "border-stone-200"
                } ${included ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${meta.solid}`}
                      />
                      <h3 className="text-base font-semibold text-stone-900">
                        {meta.label}
                      </h3>
                      {isCurrent && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${meta.bg} ${meta.text}`}
                        >
                          Aktiv
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{meta.tagline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-semibold text-stone-900 leading-none">
                      {formatSum(card.price)}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-1">
                      so'm / {card.days} kun
                    </div>
                  </div>
                </div>

                <ul className="mt-3 space-y-1.5">
                  {card.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-2 text-xs text-stone-600 leading-relaxed"
                    >
                      <span className={`${meta.text} shrink-0`}>—</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {included ? (
                  <p className="mt-3 text-xs text-stone-500">
                    {currentMeta.label} tarkibida mavjud.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePay(card.price)}
                    disabled={busy}
                    className={`mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors active:scale-[0.99] disabled:opacity-50 ${
                      emphasized
                        ? `${meta.solid} text-white`
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    {isPending(card.price)
                      ? "Ochilmoqda…"
                      : isCurrent
                        ? "Muddatni uzaytirish"
                        : current === "free"
                          ? `${meta.label} olish`
                          : `${meta.label} ga o'tish`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-stone-400 text-center leading-relaxed pt-1">
        To'lov Payme orqali. Obuna avtomatik uzaytirilmaydi.
      </p>
    </div>
  );
};

export default SubscriptionPanel;
