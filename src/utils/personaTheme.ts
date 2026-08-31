/**
 * Har bir murabbiyning vizual imzosi — afishadagi 7 rangli ustunning ilovadagi
 * ko'rinishi. Backend faqat id/nom/emoji yuboradi, ranglar shu yerda.
 *
 * Tailwind sinflari to'liq yozilgan (`bg-orange-600` kabi) — JIT faqat manbadagi
 * to'liq nomlarni ko'radi, shuning uchun ularni bo'laklab qurish mumkin emas.
 */

export interface PersonaTheme {
  /** Avatardagi va sarlavhadagi bitta tekis aksent rangi (gradient emas). */
  accent: string;
  /** Yumshoq fon — tanlangan kartada. */
  soft: string;
  /** Chegara rangi — tanlangan kartada. */
  border: string;
  /** Matn urg'usi. */
  text: string;
  /** Murabbiy xabari pufakchasining foni. */
  bubble: string;
}

const FALLBACK: PersonaTheme = {
  accent: "bg-emerald-600",
  soft: "bg-emerald-50",
  border: "border-emerald-200",
  text: "text-emerald-700",
  bubble: "bg-emerald-50 border-emerald-100",
};

export const PERSONA_THEME: Record<string, PersonaTheme> = {
  motivator: {
    accent: "bg-orange-600",
    soft: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    bubble: "bg-orange-50 border-orange-100",
  },
  intizomli: {
    accent: "bg-slate-700",
    soft: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
    bubble: "bg-slate-50 border-slate-200",
  },
  ilmiy: {
    accent: "bg-violet-600",
    soft: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    bubble: "bg-violet-50 border-violet-100",
  },
  kardio: {
    accent: "bg-lime-600",
    soft: "bg-lime-50",
    border: "border-lime-200",
    text: "text-green-700",
    bubble: "bg-lime-50 border-lime-100",
  },
  powerlifting: {
    accent: "bg-amber-600",
    soft: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    bubble: "bg-amber-50 border-amber-100",
  },
  kulgu: {
    accent: "bg-yellow-500",
    soft: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-amber-700",
    bubble: "bg-yellow-50 border-yellow-100",
  },
  sokin: {
    accent: "bg-teal-600",
    soft: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    bubble: "bg-teal-50 border-teal-100",
  },
};

export const getPersonaTheme = (personaId?: string | null): PersonaTheme =>
  (personaId && PERSONA_THEME[personaId]) || FALLBACK;

/** Botdagi tez javob tugmalari bilan bir xil — foydalanuvchi bo'sh ekranda qolmasin. */
export const QUICK_QUESTIONS: Record<string, string[]> = {
  motivator: [
    "Bugun nima yeyishim kerak?",
    "Motivatsiyam yo'q 😞",
    "Mashqni qanday boshlayman?",
  ],
};

export const getQuickQuestions = (personaId?: string | null): string[] =>
  (personaId && QUICK_QUESTIONS[personaId]) || [
    "Bugun nima yeyishim kerak?",
    "Qanday mashq qilay?",
    "Natijam qanday ketyapti?",
  ];
