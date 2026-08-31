import MotivatorArt, { type CoachMood } from "./MotivatorArt";
import { getPersonaTheme } from "../../utils/personaTheme";

export type { CoachMood };

/** Avatar o'lchamlari — suhbat pufakchasidan afisha kartasigacha. */
const SIZES = {
  xs: "w-7 h-7",
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-20 h-20",
  xl: "w-28 h-28",
} as const;

/** Emoji fallback o'lchami (chizmasi yo'q murabbiylar uchun). */
const EMOJI_SIZES = {
  xs: "text-sm",
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-5xl",
} as const;

export interface CoachAvatarProps {
  personaId: string;
  /** Chizmasi yo'q murabbiylar uchun zaxira. */
  emoji?: string;
  mood?: CoachMood;
  size?: keyof typeof SIZES;
  /** Nafas olish, qo'l silkitish kabi CSS animatsiyalari. */
  animated?: boolean;
  /** Oq halqa — rangli fon ustida ajralib tursin. */
  ring?: boolean;
  className?: string;
  idPrefix?: string;
}

/** Chizmasi tayyor murabbiylar. Qolganlari — emoji bilan (afishadagi tartib saqlanadi). */
const HAS_ART = new Set(["motivator"]);

export const hasCoachArt = (personaId?: string | null): boolean =>
  !!personaId && HAS_ART.has(personaId);

/**
 * Murabbiy avatari — ilovadagi barcha joyda bir xil qahramon.
 *
 * Motivator uchun vektor portret (stikerlar bilan bitta manbadan), qolgan
 * murabbiylar uchun hozircha emoji. Yangi murabbiy chizilganda `HAS_ART` ga
 * qo'shiladi — boshqa hech narsani o'zgartirish shart emas.
 */
const CoachAvatar = ({
  personaId,
  emoji = "🎭",
  mood = "idle",
  size = "md",
  animated = false,
  ring = false,
  className = "",
  idPrefix,
}: CoachAvatarProps) => {
  const theme = getPersonaTheme(personaId);
  const base = `${SIZES[size]} rounded-full bg-gradient-to-br ${theme.gradient} overflow-hidden shrink-0 ${
    ring ? "ring-2 ring-white shadow-sm" : ""
  } ${className}`;

  if (!hasCoachArt(personaId)) {
    return (
      <div className={`${base} flex items-center justify-center ${EMOJI_SIZES[size]}`}>
        <span>{emoji}</span>
      </div>
    );
  }

  return (
    <div className={base}>
      {/* Chizma to'liq gavda — doira ichida bosh va yelkani ko'rsatish uchun kattalashtiriladi */}
      <MotivatorArt
        mood={mood}
        animated={animated}
        background={false}
        idPrefix={idPrefix ?? `av-${size}-${mood}`}
        style={{ width: "134%", height: "134%", marginLeft: "-17%", marginTop: "-20%" }}
      />
    </div>
  );
};

export default CoachAvatar;
