import type { SubscriptionPlan, SubscriptionStatus } from "../types";

/**
 * Tarif ma'lumotlari — UI hamma joyda shu yagona manbadan foydalanadi,
 * shunda "Pro" va "Pro Plus" hech qachon bir xil ko'rinmaydi.
 */
export interface PlanMeta {
  id: SubscriptionPlan;
  /** To'liq nom — sarlavhalarda. */
  label: string;
  /** Qisqa belgi — FAB va nishonchalarda joy tor. */
  short: string;
  /** Bir qatorli tavsif. */
  tagline: string;
  /** Tailwind rang klasslari — bitta aksent, gradient yo'q. */
  text: string;
  bg: string;
  border: string;
  solid: string;
}

export const PLAN_META: Record<SubscriptionPlan, PlanMeta> = {
  free: {
    id: "free",
    label: "Bepul",
    short: "FREE",
    tagline: "Kunlik cheklangan AI tahlil",
    text: "text-stone-600",
    bg: "bg-stone-100",
    border: "border-stone-200",
    solid: "bg-stone-900",
  },
  pro: {
    id: "pro",
    label: "Pro",
    short: "PRO",
    tagline: "Cheklovsiz AI tahlil",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    solid: "bg-emerald-600",
  },
  pro_plus: {
    id: "pro_plus",
    label: "Pro Plus",
    short: "PRO+",
    tagline: "AI tahlil + shaxsiy AI murabbiy",
    text: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    solid: "bg-violet-600",
  },
};

/** Obuna holatidan amaldagi tarif. Obuna tugagan bo'lsa — har doim "free". */
export const resolvePlan = (
  status?: SubscriptionStatus | null,
): SubscriptionPlan => {
  if (!status?.is_active) return "free";
  const plan = status.plan;
  if (plan === "pro_plus" || plan === "pro") return plan;
  // Pro Plus dan oldingi to'lovlarda `plan` yo'q edi — ular Pro.
  return "pro";
};

/** 99000 → "99 000" (uzluksiz bo'shliq bilan, qator bo'linmasin). */
export const formatSum = (value: number): string =>
  value.toLocaleString("ru-RU").replace(/\s/g, " ");

/** ISO sana → "31.08.2026". Bo'sh bo'lsa null. */
export const formatExpiry = (iso?: string | null): string | null => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("uz-UZ");
};

/** Obuna tugashiga necha kun qolgani (yaxlitlangan, manfiy bo'lmaydi). */
export const daysLeft = (iso?: string | null): number | null => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const diff = date.getTime() - Date.now();
  return Math.max(Math.ceil(diff / 86_400_000), 0);
};
