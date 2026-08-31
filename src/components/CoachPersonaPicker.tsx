import { useState } from "react";
import type { CoachPersona } from "../types";
import { getPersonaTheme } from "../utils/personaTheme";
import CoachAvatar from "./coach/CoachAvatar";

interface CoachPersonaPickerProps {
  personas: CoachPersona[];
  selectedId: string | null;
  onSelect: (personaId: string) => void;
  /** Tanlash so'rovi ketayotgan murabbiy id si — o'sha kartada spinner. */
  pendingId?: string | null;
}

/**
 * 7 murabbiy — afishadagi raqamlangan ustunlar ilovadagi ko'rinishi.
 * Ochiq murabbiy tanlanadi, yopig'i bosilganda "tez kunda" izohi ochiladi.
 */
const CoachPersonaPicker = ({
  personas,
  selectedId,
  onSelect,
  pendingId,
}: CoachPersonaPickerProps) => {
  const [peekedId, setPeekedId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="text-center px-2">
        <h3 className="text-lg font-extrabold text-food-brown-800">
          Sizga qaysi uslub mos? 🤔
        </h3>
        <p className="text-sm text-food-brown-600 mt-1">
          Har biri boshqacha gapiradi va boshqacha turtki beradi. Birini tanlang —
          u sizning raqamlaringizni ko'rib turadi.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {personas.map((persona, index) => {
          const theme = getPersonaTheme(persona.id);
          const isSelected = persona.id === selectedId;
          const isPending = persona.id === pendingId;
          const isPeeked = persona.id === peekedId;

          return (
            <button
              key={persona.id}
              type="button"
              disabled={isPending}
              onClick={() => {
                if (persona.is_active) {
                  onSelect(persona.id);
                } else {
                  setPeekedId((prev) => (prev === persona.id ? null : persona.id));
                }
              }}
              className={`relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-300 active:scale-[0.97] ${
                isSelected
                  ? `${theme.border} ${theme.soft} shadow-lg`
                  : persona.is_active
                    ? "border-white bg-white/95 shadow-sm hover:shadow-md"
                    : "border-food-brown-100 bg-white/60"
              }`}
            >
              {/* Rangli imzo — yuqoridagi tasma */}
              <div
                className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient} ${
                  persona.is_active ? "" : "opacity-30"
                }`}
              />

              <div className={`p-3 ${persona.is_active ? "" : "opacity-60"}`}>
                {/* Raqam + emoji */}
                <div className="flex items-start justify-between mb-1.5">
                  {/* Chizmasi bor murabbiy o'zi ko'rinadi, qolganlari — emoji */}
                  <CoachAvatar
                    personaId={persona.id}
                    emoji={persona.emoji}
                    mood={isSelected ? "win" : "idle"}
                    size="md"
                    animated={persona.is_active}
                    className={persona.is_active ? "shadow-sm" : "grayscale opacity-70"}
                  />
                  <span
                    className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                      isSelected
                        ? `${theme.text} bg-white`
                        : "text-food-brown-400 bg-food-brown-50"
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>

                <div className="font-extrabold text-food-brown-800 text-sm leading-tight">
                  {persona.name.replace(" Murabbiy", "")}
                </div>

                <ul className="mt-1.5 space-y-0.5">
                  {persona.bullets.slice(0, 3).map((bullet) => (
                    <li
                      key={bullet}
                      className="text-[11px] text-food-brown-600 leading-snug flex gap-1"
                    >
                      <span className={theme.text}>•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* Holat qatori */}
                <div className="mt-2 pt-2 border-t border-food-brown-100/70">
                  {isPending ? (
                    <span className="text-[11px] font-bold text-food-brown-500">
                      Ulanmoqda…
                    </span>
                  ) : isSelected ? (
                    <span
                      className={`text-[11px] font-extrabold ${theme.text} flex items-center gap-1`}
                    >
                      ✓ Tanlangan
                    </span>
                  ) : persona.is_active ? (
                    <span className="text-[11px] font-bold text-food-green-600">
                      Suhbatni boshlash →
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-food-brown-400 flex items-center gap-1">
                      🔒 Tez kunda
                    </span>
                  )}
                </div>

                {/* Yopiq murabbiy bosilganda — qisqa tanishtiruv */}
                {isPeeked && !persona.is_active && (
                  <div className="mt-2 text-[11px] text-food-brown-600 bg-white rounded-lg p-2 border border-food-brown-100 animate-fade-in">
                    {persona.tagline}
                    <div className="mt-1 font-bold text-food-orange-600">
                      Hozircha 🔥 Motivator bilan boshlang
                    </div>
                  </div>
                )}
              </div>

              {/* Yopiq kartadagi burchak lentasi */}
              {!persona.is_active && (
                <div className="absolute top-2 right-0 bg-food-brown-800/80 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-l-full tracking-wide">
                  TEZ KUNDA
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CoachPersonaPicker;
