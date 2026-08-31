import { useState } from "react";
import { useSubscriptionStatus } from "../hooks/useFoodAnalysis";
import { PLAN_META, resolvePlan } from "../utils/plan";
import BottomSheet from "./BottomSheet";
import SubscriptionPanel from "./SubscriptionPanel";

/**
 * Obuna chipi — har sahifada, pastki menyu ustida.
 *
 * Yorliqda joriy tarif nomi turadi (Bepul / Pro / Pro+), shuning uchun
 * Pro Plus yoqilgani darhol bilinadi. Bosilganda tariflar paneli ochiladi.
 */
const SubscriptionFab = () => {
  const subscriptionQuery = useSubscriptionStatus();
  const [open, setOpen] = useState(false);

  const subscription = subscriptionQuery.data;
  if (!subscription) return null;

  const plan = resolvePlan(subscription);
  const meta = PLAN_META[plan];

  const unlimited = subscription.unlimited_daily ?? false;
  const limit = subscription.free_attempts_per_day ?? 3;
  const used = subscription.free_attempts_used_today ?? 0;
  const left =
    subscription.free_attempts_left_today ?? Math.max(limit - used, 0);
  const exhausted = !unlimited && left <= 0;

  // Bepul rejimda qolgan urinish ko'rinadi; obunada tarif nomi yetarli.
  const counter = unlimited ? null : `${left}/${limit}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Tarif: ${meta.label}`}
        className={`fixed right-3 z-40 rounded-full animate-fab-in active:scale-95 transition-transform ${
          exhausted ? "animate-fab-pulse" : ""
        }`}
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 84px)" }}
      >
        <span
          className={`flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm backdrop-blur ${
            exhausted
              ? "bg-stone-900 border-stone-200 text-white"
              : `bg-white ${meta.border} text-stone-700`
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              exhausted ? "bg-white" : meta.solid
            }`}
          />
          <span>{meta.short}</span>
          {counter && (
            <span
              className={exhausted ? "text-white/70" : "text-stone-400"}
            >
              {counter}
            </span>
          )}
        </span>
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

export default SubscriptionFab;
