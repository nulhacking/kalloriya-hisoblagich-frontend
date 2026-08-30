/**
 * Murabbiy javobini ekranga chiqarish uchun matn yordamchilari.
 *
 * Backend chegaralangan HTML qaytaradi (<b>, <i>, <u>, <code> — qolgani allaqachon
 * escape qilingan). Bu yerda uni tokenlarga ajratamiz; React qatlami tokenlardan
 * elementlar quradi, ya'ni `dangerouslySetInnerHTML` umuman ishlatilmaydi.
 */

const TAG_SPLIT = /(<\/?(?:b|strong|i|em|u|code)>)/gi;
const TAG_MATCH = /^<(\/?)(b|strong|i|em|u|code)>$/i;

export type CoachMark = "b" | "i" | "u" | "code";

export interface CoachTextToken {
  text: string;
  /** Shu bo'lakka amal qiladigan formatlar. */
  marks: CoachMark[];
}

const normalizeTag = (tag: string): CoachMark => {
  const lower = tag.toLowerCase();
  if (lower === "strong") return "b";
  if (lower === "em") return "i";
  return lower as CoachMark;
};

/**
 * Chegaralangan HTML → matn bo'laklari.
 * Yopilmagan teg (typewriter yarim ochganda) xato emas — format oxirigacha davom etadi.
 */
export const tokenizeCoachText = (text: string): CoachTextToken[] => {
  const active = new Set<CoachMark>();
  const tokens: CoachTextToken[] = [];

  for (const part of text.split(TAG_SPLIT)) {
    const tag = TAG_MATCH.exec(part);
    if (tag) {
      const mark = normalizeTag(tag[2]);
      if (tag[1]) active.delete(mark);
      else active.add(mark);
      continue;
    }
    if (!part) continue;
    tokens.push({ text: part, marks: [...active] });
  }

  return tokens;
};

/**
 * Typewriter qirqimi — teg o'rtasidan kesilmaydi.
 * `<b` yarim ochilib qolsa, ochilmagan teg boshigacha orqaga qaytamiz.
 */
export const sliceCoachText = (text: string, count: number): string => {
  if (count >= text.length) return text;
  const slice = text.slice(0, Math.max(0, count));
  const lastOpen = slice.lastIndexOf("<");
  const lastClose = slice.lastIndexOf(">");
  return lastOpen > lastClose ? slice.slice(0, lastOpen) : slice;
};

/** Uzun javob ham cho'zilib ketmasin: qadam matn uzunligiga moslashadi. */
export const typewriterStep = (length: number): number =>
  Math.max(1, Math.round(length / 110));
