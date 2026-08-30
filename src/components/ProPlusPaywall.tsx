import { useState } from "react";
import { useIsTelegramMiniApp } from "../stores";
import {
  useCreatePaymePayLink,
  useSubscriptionStatus,
} from "../hooks/useFoodAnalysis";
import { useToast } from "./Toast";
import { buildPaymeGetUrlFromStatus, openPaymeUrl } from "../utils/payme";

const FEATURES = [
  {
    icon: "🎭",
    title: "Shaxsiy AI murabbiy",
    text: "7 uslubdan o'zingizga mosini tanlaysiz",
  },
  {
    icon: "💬",
    title: "Cheklovsiz suhbat",
    text: "Savol berasiz, u ham holingizni so'rab turadi",
  },
  {
    icon: "📸",
    title: "Cheksiz AI tahlil",
    text: "Rasmdan kaloriya — kunlik limitsiz",
  },
  {
    icon: "📊",
    title: "Reja va progress",
    text: "Kunlik ovqat, mashq va haftalik hisobot",
  },
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
  const isTelegramMiniApp = useIsTelegramMiniApp();
  const subscriptionQuery = useSubscriptionStatus();
  const payLinkMutation = useCreatePaymePayLink();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const subscription = subscriptionQuery.data;
  const price = subscription?.pro_plus_price ?? 99000;
  const days = subscription?.pro_plus_days ?? 30;
  const priceText = price.toLocaleString("ru-RU").replace(/ /g, " ");

  const handlePay = async () => {
    if (!subscription || busy) return;
    setBusy(true);
    try {
      // Tez yo'l: /status javobidan GET-linkni o'zimiz quramiz.
      const localUrl = buildPaymeGetUrlFromStatus(subscription, price);
      if (localUrl) {
        openPaymeUrl(localUrl, isTelegramMiniApp);
        return;
      }

      // Zaxira: intent yoqilgan — havolani backend beradi.
      const response = await payLinkMutation.mutateAsync(price);
      const tgOpen = response.telegram_open_url?.trim();
      openPaymeUrl(
        isTelegramMiniApp && tgOpen ? tgOpen : response.pay_url,
        isTelegramMiniApp,
      );
    } catch (error) {
      console.error("Pro Plus to'lov havolasi:", error);
      toast.error("To'lov havolasini ochib bo'lmadi. Keyinroq urinib ko'ring.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-violet-200 bg-white shadow-sm">
      {/* Sarlavha — Pro Plus imzosi */}
      <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💎</span>
          <div className="min-w-0">
            <div className="text-white font-extrabold leading-tight">
              Pro Plus
            </div>
            <div className="text-white/85 text-[11px] leading-tight">
              {title}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {subtitle && (
          <p className="text-sm text-food-brown-700 mb-3 leading-relaxed">
            {subtitle}
          </p>
        )}

        {!compact && (
          <div className="space-y-2 mb-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex gap-2.5 items-start">
                <span className="text-lg leading-none mt-0.5">
                  {feature.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-food-brown-800 leading-tight">
                    {feature.title}
                  </div>
                  <div className="text-xs text-food-brown-600 leading-snug">
                    {feature.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-baseline justify-center gap-1.5 mb-3">
          <span className="text-2xl font-extrabold text-food-brown-800">
            {priceText}
          </span>
          <span className="text-sm font-bold text-food-brown-600">
            so'm / {days} kun
          </span>
        </div>

        <button
          type="button"
          onClick={handlePay}
          disabled={busy || !subscription}
          className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 text-white font-extrabold py-3 rounded-xl shadow-md disabled:opacity-60 active:scale-[0.98] transition-transform"
        >
          {busy ? "Ochilmoqda…" : "💎 Pro Plus olish (Payme)"}
        </button>

        <p className="text-[11px] text-food-brown-500 text-center mt-2">
          To'lov Payme orqali. Obuna avtomatik uzaytirilmaydi.
        </p>
      </div>
    </div>
  );
};

export default ProPlusPaywall;
