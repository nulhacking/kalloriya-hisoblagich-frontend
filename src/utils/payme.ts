import type { SubscriptionStatus } from "../types";

/**
 * Payme GET-checkout havolasi (base64 payload) — to'g'ridan-to'g'ri /subscription/status
 * javobidan quriladi, backendga qo'shimcha so'rov ketmaydi.
 *
 * Maydonlar yo'q bo'lsa (masalan payment intent yoqilgan) null qaytadi — chaqiruvchi
 * zaxira sifatida backend /pay-link ni ishlatadi.
 */
export const buildPaymeGetUrlFromStatus = (
  status: SubscriptionStatus,
  amount: number,
): string | null => {
  const merchant = status.payme_merchant_id?.trim();
  const accKey = status.payme_account_key?.trim();
  const accVal = status.payme_account_value?.trim();
  if (!merchant || !accKey || !accVal) return null;

  const amountTiyin = Math.round(amount * 100);
  if (amountTiyin <= 0) return null;

  const base =
    status.payme_checkout_base_url?.trim().replace(/\/+$/, "") ||
    "https://checkout.paycom.uz";

  const parts = [`m=${merchant}`, `ac.${accKey}=${accVal}`, `a=${amountTiyin}`];

  const cb = status.payme_callback_url?.trim();
  if (cb) {
    parts.push(`c=${cb}`);
    const ct = status.payme_callback_timeout_ms?.trim();
    if (ct) parts.push(`ct=${ct}`);
  }

  // btoa faqat latin-1: Payme payloadi ASCII, xavfsiz.
  const encoded = btoa(parts.join(";"));
  return `${base}/${encoded}`;
};

/** Telegram Mini App ichida tashqi havola WebApp.openLink orqali ochiladi. */
export const openPaymeUrl = (url: string, isTelegramMiniApp: boolean): void => {
  const webApp = window.Telegram?.WebApp;
  const openLink = webApp && "openLink" in webApp ? webApp.openLink : undefined;
  if (isTelegramMiniApp && typeof openLink === "function") {
    openLink.call(webApp, url, { try_instant_view: false });
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};
