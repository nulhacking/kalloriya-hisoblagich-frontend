/**
 * Har bir murabbiyning vizual imzosi — afishadagi 7 rangli ustunning ilovadagi
 * ko'rinishi. Backend faqat id/nom/emoji yuboradi, ranglar shu yerda.
 *
 * Tailwind sinflari to'liq yozilgan (`from-rose-500` kabi) — JIT faqat manbadagi
 * to'liq nomlarni ko'radi, shuning uchun ularni bo'laklab qurish mumkin emas.
 */

export interface PersonaTheme {
  /** Karta yuqorisidagi va avatardagi gradient. */
  gradient: string;
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
  gradient: "from-food-green-500 to-emerald-600",
  soft: "bg-food-green-50",
  border: "border-food-green-300",
  text: "text-food-green-700",
  bubble: "bg-food-green-50 border-food-green-100",
};

export const PERSONA_THEME: Record<string, PersonaTheme> = {
  motivator: {
    gradient: "from-orange-500 via-red-500 to-rose-600",
    soft: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-700",
    bubble: "bg-orange-50 border-orange-100",
  },
  intizomli: {
    gradient: "from-slate-600 via-slate-700 to-zinc-800",
    soft: "bg-slate-50",
    border: "border-slate-300",
    text: "text-slate-700",
    bubble: "bg-slate-50 border-slate-200",
  },
  ilmiy: {
    gradient: "from-violet-500 via-purple-600 to-indigo-700",
    soft: "bg-violet-50",
    border: "border-violet-300",
    text: "text-violet-700",
    bubble: "bg-violet-50 border-violet-100",
  },
  kardio: {
    gradient: "from-lime-500 via-green-500 to-emerald-600",
    soft: "bg-lime-50",
    border: "border-lime-300",
    text: "text-green-700",
    bubble: "bg-lime-50 border-lime-100",
  },
  powerlifting: {
    gradient: "from-amber-600 via-orange-700 to-stone-800",
    soft: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-800",
    bubble: "bg-amber-50 border-amber-100",
  },
  kulgu: {
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    soft: "bg-yellow-50",
    border: "border-yellow-300",
    text: "text-amber-700",
    bubble: "bg-yellow-50 border-yellow-100",
  },
  sokin: {
    gradient: "from-teal-400 via-cyan-500 to-sky-600",
    soft: "bg-teal-50",
    border: "border-teal-300",
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
