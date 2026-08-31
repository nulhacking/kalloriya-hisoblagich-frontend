import CoachPhoto, { hasCoachPhoto } from "./CoachPhoto";
import { type CoachMood } from "./MotivatorArt";
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
}

export const hasCoachArt = hasCoachPhoto;

/**
 * Murabbiy avatari — ilovadagi barcha joyda bir xil qahramon.
 *
 * Motivator uchun fotorealistik kadr (stiker va bot GIF i bilan bitta manbadan),
 * qolgan murabbiylar uchun hozircha emoji. Yangi murabbiy chizilganda
 * `CoachPhoto` dagi ro'yxatga qo'shiladi — bu yerda hech narsa o'zgarmaydi.
 */
const CoachAvatar = ({
  personaId,
  emoji = "🎭",
  mood = "idle",
  size = "md",
  animated = false,
  ring = false,
  className = "",
}: CoachAvatarProps) => {
  const theme = getPersonaTheme(personaId);
  const base = `${SIZES[size]} rounded-full bg-gradient-to-br ${theme.gradient} overflow-hidden shrink-0 ${
    ring ? "ring-2 ring-white shadow-sm" : ""
  } ${className}`;

  if (!hasCoachPhoto(personaId)) {
    return (
      <div className={`${base} flex items-center justify-center ${EMOJI_SIZES[size]}`}>
        <span>{emoji}</span>
      </div>
    );
  }

  return (
    <div className={base}>
      {/* Bosh+yelka kesimi — doirani to'liq to'ldiradi */}
      <CoachPhoto
        mood={mood}
        variant="avatar"
        personaId={personaId}
        animated={animated}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default CoachAvatar;
