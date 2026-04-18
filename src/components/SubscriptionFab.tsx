import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useIsTelegramMiniApp } from "../stores";
import {
  useCreatePaymePayLink,
  useSubscriptionStatus,
} from "../hooks/useFoodAnalysis";

const SubscriptionFab = () => {
  const isTelegramMiniApp = useIsTelegramMiniApp();
  const subscriptionQuery = useSubscriptionStatus();
  const paymePayMutation = useCreatePaymePayLink();
  const [open, setOpen] = useState(false);

  const subscription = subscriptionQuery.data;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!subscription) return null;

  const isActive = subscription.is_active;
  const used = subscription.free_attempts_used_today ?? 0;
  const limit = subscription.free_attempts_per_day ?? (isActive ? 20 : 3);
  const left = subscription.free_attempts_left_today ?? Math.max(limit - used, 0);
  const percentUsed = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const limitExhausted = left <= 0;

  const fabGradient = isActive
    ? "from-emerald-500 via-food-green-500 to-emerald-600"
    : limitExhausted
      ? "from-food-red-500 via-food-red-600 to-rose-600"
      : "from-food-orange-500 via-food-yellow-500 to-food-orange-500";

  const fabIcon = isActive ? "💎" : limitExhausted ? "🔒" : "⚡";
  const fabLabel = isActive
    ? `${left}/${limit}`
    : limitExhausted
      ? "Limit"
      : `${left}/${limit}`;

  const handlePay = async () => {
    try {
      const amount = subscription.monthly_price ?? 20000;
      const response = await paymePayMutation.mutateAsync(amount);
      const tgOpen = response.telegram_open_url?.trim();
      if (isTelegramMiniApp && tgOpen) {
        const webApp = window.Telegram?.WebApp;
        const openLink =
          webApp && "openLink" in webApp ? webApp.openLink : undefined;
        if (typeof openLink === "function") {
          openLink.call(webApp, tgOpen, { try_instant_view: false });
        } else {
          window.open(tgOpen, "_blank", "noopener,noreferrer");
        }
        setOpen(false);
        return;
      }
      if (
        response.pay_method === "post" &&
        response.pay_form_fields &&
        Object.keys(response.pay_form_fields).length > 0
      ) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = response.pay_url;
        form.target = "_blank";
        form.acceptCharset = "UTF-8";
        for (const [name, value] of Object.entries(response.pay_form_fields)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        form.remove();
      } else {
        window.open(response.pay_url, "_blank");
      }
      setOpen(false);
    } catch (err) {
      console.error("Payme link olishda xatolik:", err);
    }
  };

  const sheetNode = open ? (
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{ zIndex: 9999 }}
    >
      <button
        type="button"
        aria-label="Yopish"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm animate-backdrop-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full sm:max-w-md bg-white rounded-t-[28px] shadow-2xl animate-sheet-up overflow-hidden"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{fabIcon}</span>
                <h2 className="text-lg font-extrabold text-food-brown-800">
                  {isActive ? "PRO obuna aktiv" : "Bepul rejim"}
                </h2>
              </div>
              <p className="text-xs text-food-brown-500 mt-1">
                {isActive
                  ? "Kuniga 20 ta AI tahlil"
                  : "Kuniga 3 ta AI tahlil — tez, bepul"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Yopish"
              className="w-9 h-9 rounded-full bg-food-brown-100 hover:bg-food-brown-200 text-food-brown-700 flex items-center justify-center text-lg font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-5">
          <div className="rounded-2xl bg-gradient-to-br from-food-green-50 via-white to-food-yellow-50 border border-food-green-100 p-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs font-bold text-food-brown-600 uppercase tracking-wider">
                Bugungi tahlil
              </span>
              <span className="text-xs font-bold text-food-brown-500">
                {used} / {limit}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-food-brown-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${limitExhausted
                  ? "from-food-red-400 to-food-red-600"
                  : percentUsed > 70
                    ? "from-food-orange-400 to-food-orange-600"
                    : "from-food-green-400 to-food-green-600"
                  }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <p className="text-xs text-food-brown-600 mt-2">
              {limitExhausted
                ? isActive
                  ? "Kunlik limit tugadi. Ertaga avtomatik yangilanadi."
                  : "Kunlik bepul limit tugadi. Obuna olib kuniga 20 ta tahlil qiling."
                : `Bugun yana ${left} ta tahlil qilish imkoniyati bor.`}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded-2xl bg-food-blue-50 border border-food-blue-100 p-3">
              <p className="text-[10px] uppercase tracking-wider font-bold text-food-brown-500">
                Qolgan
              </p>
              <p className="text-2xl font-extrabold text-food-brown-800 mt-0.5">
                {left}
              </p>
              <p className="text-[11px] text-food-brown-500">ta tahlil</p>
            </div>
            <div className="rounded-2xl bg-food-green-50 border border-food-green-100 p-3">
              <p className="text-[10px] uppercase tracking-wider font-bold text-food-brown-500">
                Rejim
              </p>
              <p className="text-2xl font-extrabold text-food-brown-800 mt-0.5">
                {isActive ? "PRO" : "FREE"}
              </p>
              <p className="text-[11px] text-food-brown-500">
                {isActive
                  ? subscription.subscription_expires_at
                    ? `${new Date(
                      subscription.subscription_expires_at,
                    ).toLocaleDateString("uz-UZ")} gacha`
                    : "aktiv"
                  : "bepul plan"}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 mt-5">
          {!isActive ? (
            <>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-food-green-600 to-emerald-700 p-4 text-white shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💎</span>
                  <h3 className="font-extrabold text-base">PRO obuna</h3>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="opacity-80">✓</span> Kuniga{" "}
                    <b>20 ta</b> AI tahlil
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="opacity-80">✓</span>{" "}
                    {subscription.monthly_days ?? 30} kun amal qiladi
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="opacity-80">✓</span> Statistika va
                    jurnal to'liq
                  </li>
                </ul>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {(subscription.monthly_price ?? 20000).toLocaleString(
                      "uz-UZ",
                    )}
                  </span>
                  <span className="text-sm font-bold opacity-80">
                    so'm / oy
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePay}
                disabled={paymePayMutation.isPending}
                className="mt-3 w-full py-3.5 rounded-2xl bg-[#00b277] hover:bg-[#009966] active:scale-[0.98] text-white text-base font-extrabold shadow-lg disabled:opacity-60 disabled:cursor-wait transition-all flex items-center justify-center gap-2"
              >
                {paymePayMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    <span className="text-xl">💚</span>
                    Payme orqali to'lash
                  </>
                )}
              </button>
              <p className="text-[11px] text-food-brown-500 text-center mt-2">
                To'lov Payme xavfsiz sahifasida amalga oshiriladi
              </p>
            </>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-food-green-50 to-emerald-50 border border-food-green-200 p-4 text-center">
              <p className="text-3xl mb-1">🎉</p>
              <h3 className="font-extrabold text-base text-food-brown-800">
                PRO aktiv!
              </h3>
              <p className="text-xs text-food-brown-600 mt-1">
                {subscription.subscription_expires_at
                  ? `${new Date(
                    subscription.subscription_expires_at,
                  ).toLocaleDateString("uz-UZ")} gacha amal qiladi`
                  : "obuna aktiv"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Obuna holati"
        className={`fixed right-3 z-40 animate-fab-in active:scale-95 transition-transform duration-200 ${limitExhausted ? "animate-fab-pulse" : ""
          }`}
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)",
        }}
      >
        <div
          className={`flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full bg-gradient-to-br ${fabGradient} text-white font-extrabold shadow-2xl border border-white/40 backdrop-blur-sm`}
        >
          <span className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-lg leading-none">
            {fabIcon}
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[10px] uppercase tracking-wider font-bold opacity-90">
              {isActive ? "Pro" : limitExhausted ? "Tugadi" : "Bepul"}
            </span>
            <span className="text-sm font-extrabold">{fabLabel}</span>
          </span>
        </div>
      </button>

      {sheetNode &&
        typeof document !== "undefined" &&
        createPortal(sheetNode, document.body)}
    </>
  );
};

export default SubscriptionFab;
