import type { CoachMood } from "../components/coach/MotivatorArt";

/**
 * Xabar ohangi — avatar pozasi shunga qarab tanlanadi.
 *
 * Asosiy manba — backend (`CoachChatResponse.mood`, `coach/mood.py`). Bu yerdagi
 * mantiq faqat zaxira: server yubormagan holatlar uchun (eski tarix, kesh).
 * Kalit so'zlar backend bilan bir xil bo'lishi uchun ataylab qisqa saqlangan.
 */

const norm = (text: string): string =>
  text.toLowerCase().replace(/[`´‘’ʻʼ]/g, "'").replace(/\s+/g, " ").trim();

const SAD = [
  "charcha",
  "qiyin",
  "qiynal",
  "motivatsiya yo'q",
  "motivatsiyam yo'q",
  "kayfiyat yo'q",
  "tashlab qo",
  "bo'lmayapti",
  "uddalay olmay",
  "xafa",
  "tushkun",
  "buzdim",
  "yeb yubordim",
  "ko'p yedim",
  "😞",
  "😔",
  "😭",
];

const WIN = [
  "bajardim",
  "qildim",
  "yugurdim",
  "ozdim",
  "kamaydi",
  "erishdim",
  "uddaladim",
  "zo'r",
  "barakalla",
  "ajoyib",
  "tabrik",
  "qoyil",
  "👏",
  "💪",
  "🎉",
];

const GREETING = ["salom", "assalom", "hormang", "qalaysiz"];

const has = (text: string, needles: string[]) =>
  needles.some((needle) => text.includes(needle));

/** Savol + javobdan kayfiyat (backenddagi `detect_mood` bilan bir xil tartib). */
export const moodFromText = (userText = "", coachText = ""): CoachMood => {
  const user = norm(userText);
  const coach = norm(coachText);

  if (has(user, SAD)) return "sad";
  if (has(user, WIN) || has(coach, WIN)) return "win";
  if (user && user.length <= 40 && has(user, GREETING)) return "hello";
  return "push";
};

/** Serverdan kelgan qiymatni tekshirish — noma'lum qiymat `push` ga tushadi. */
export const asCoachMood = (value?: string | null): CoachMood => {
  const moods: CoachMood[] = ["idle", "hello", "win", "push", "sad", "think"];
  return moods.includes(value as CoachMood) ? (value as CoachMood) : "push";
};

/** Katta reaksiya (stiker) faqat hissiy cho'qqilarda chiqadi — botdagi qoida bilan bir xil. */
export const isStickerMood = (mood: CoachMood): boolean =>
  mood === "win" || mood === "sad";
