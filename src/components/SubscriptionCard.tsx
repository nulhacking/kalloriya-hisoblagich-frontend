import { useState } from "react";
import { useSubscriptionStatus } from "../hooks/useFoodAnalysis";
import { PLAN_META, formatExpiry, resolvePlan } from "../utils/plan";
import BottomSheet from "./BottomSheet";
import SubscriptionPanel from "./SubscriptionPanel";

/**
 * Sozlamalardagi tarif qatori — joriy tarifni ko'rsatadi va tariflar
 * panelini ochadi. Pro Plus ga o'tish uchun doimiy, ko'rinadigan kirish nuqtasi.
 */
const SubscriptionCard = () => {
  const { data: subscription } = useSubscriptionStatus();
  const [open, setOpen] = useState(false);

  if (!subscription) return null;

  const plan = resolvePlan(subscription);
  const meta = PLAN_META[plan];
  const expiry = formatExpiry(subscription.subscription_expires_at);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-left active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Tarif
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${meta.solid}`} />
              <span className="text-base font-semibold text-stone-900">
                {meta.label}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {plan === "free"
                ? "Pro va Pro Plus tariflarini ko'rish"
                : expiry
                  ? `${expiry} gacha`
                  : meta.tagline}
            </p>
          </div>
          <span className="shrink-0 text-stone-300 text-lg">›</span>
        </div>
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Obuna"
        accent="neutral"
        maxHeight="max-h-[88vh]"
      >
        <SubscriptionPanel onPurchaseStarted={() => setOpen(false)} />
      </BottomSheet>
    </>
  );
};

export default SubscriptionCard;
