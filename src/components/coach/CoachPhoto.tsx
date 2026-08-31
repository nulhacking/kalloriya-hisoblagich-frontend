import { useState } from "react";
import MotivatorArt, { type CoachMood } from "./MotivatorArt";

/**
 * Murabbiyning fotorealistik kadri (`public/coach/`).
 *
 * Kadrlar Gemini bilan yaratilib, `yarn stickers` da tayyorlanadi. Fayl
 * yetib kelmasa (eski kesh, yangi kayfiyat, offline birinchi ochilish) —
 * o'sha zahoti vektor chizmaga tushadi, ya'ni avatar hech qachon bo'sh qolmaydi.
 *
 * Uch xil kesim:
 *   • `avatar` — 192×192 bosh+yelka, dumaloq avatar uchun (~10 KB);
 *   • `full`   — 512×512 to'liq gavda, yozuvsiz (hero, paywall, bo'sh ekran);
 *   • `sticker`— 512×512 oq konturli, yozuvli — Telegram stikerining o'zi.
 */

export type CoachPhotoVariant = "avatar" | "full" | "sticker";

const SUFFIX: Record<CoachPhotoVariant, string> = {
  avatar: "-avatar",
  full: "-full",
  sticker: "",
};

/** Fotokadri bor murabbiylar. Yangisi chizilganda shu ro'yxatga qo'shiladi. */
const WITH_PHOTO = new Set(["motivator"]);

export const hasCoachPhoto = (personaId?: string | null): boolean =>
  !!personaId && WITH_PHOTO.has(personaId);

export interface CoachPhotoProps {
  mood: CoachMood;
  variant?: CoachPhotoVariant;
  personaId?: string;
  className?: string;
  /** Sekin "nafas olish" — jonli tuyulishi uchun. */
  animated?: boolean;
  alt?: string;
}

const CoachPhoto = ({
  mood,
  variant = "avatar",
  personaId = "motivator",
  className = "",
  animated = false,
  alt = "Motivator Murabbiy",
}: CoachPhotoProps) => {
  const [failed, setFailed] = useState(false);

  if (failed || !hasCoachPhoto(personaId)) {
    return (
      <MotivatorArt
        mood={mood}
        animated={animated}
        sticker={variant === "sticker"}
        background={false}
        className={className}
        idPrefix={`fb-${variant}-${mood}`}
      />
    );
  }

  return (
    <img
      src={`/coach/${personaId}-${mood}${SUFFIX[variant]}.webp`}
      alt={alt}
      draggable={false}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`${className} ${animated ? "coach-photo-breathe" : ""} select-none`}
    />
  );
};

export default CoachPhoto;
