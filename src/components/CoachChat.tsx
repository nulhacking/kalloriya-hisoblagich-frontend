import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CoachHistoryItem, CoachPersona } from "../types";
import {
  sliceCoachText,
  tokenizeCoachText,
  typewriterStep,
  type CoachMark,
} from "../utils/coachText";
import { getPersonaTheme, getQuickQuestions } from "../utils/personaTheme";
import { isStickerMood, moodFromText } from "../utils/coachMood";
import CoachAvatar, { hasCoachArt } from "./coach/CoachAvatar";
import MotivatorArt, { type CoachMood } from "./coach/MotivatorArt";

/* ------------------------------------------------------------------ matn */

const MARK_CLASS: Record<CoachMark, string> = {
  b: "font-extrabold",
  i: "italic",
  u: "underline",
  code: "font-mono text-[0.92em] bg-black/5 px-1 rounded",
};

/** Chegaralangan HTML → React elementlari (innerHTML ishlatilmaydi). */
const renderRichText = (text: string): ReactNode[] =>
  tokenizeCoachText(text).map((token, index) => {
    const className = token.marks.map((mark) => MARK_CLASS[mark]).join(" ");
    return (
      <span key={index} className={className || undefined}>
        {token.text}
      </span>
    );
  });

/**
 * Javob harf-harf ochiladi — botdagi animatsiyaning ilovadagi ko'rinishi.
 */
const useTypewriter = (text: string, enabled: boolean) => {
  const [count, setCount] = useState(enabled ? 0 : text.length);

  useEffect(() => {
    if (!enabled) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const step = typewriterStep(text.length);
    const timer = window.setInterval(() => {
      setCount((prev) => {
        if (prev >= text.length) {
          window.clearInterval(timer);
          return text.length;
        }
        return prev + step;
      });
    }, 18);
    return () => window.clearInterval(timer);
  }, [text, enabled]);

  return {
    visible: sliceCoachText(text, count),
    done: count >= text.length,
  };
};

/* -------------------------------------------------------------- bo'laklar */

const TypingBubble = ({ persona }: { persona: CoachPersona }) => (
  <div className="flex items-end gap-2 animate-fade-in">
    {/* Javob yozilguncha murabbiy "o'ylanib" turadi */}
    <CoachAvatar
      personaId={persona.id}
      emoji={persona.emoji}
      mood="think"
      size="xs"
      animated
    />
    <div className="bg-white border-2 border-food-brown-100 rounded-2xl rounded-bl-md px-4 py-3">
      <div className="flex gap-1 items-center">
        <span className="coach-dot" />
        <span className="coach-dot" style={{ animationDelay: "0.15s" }} />
        <span className="coach-dot" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  </div>
);

interface BubbleProps {
  message: CoachHistoryItem;
  persona: CoachPersona;
  animate: boolean;
  /** Javob ohangi — avatar pozasi va katta reaksiya shunga bog'liq. */
  mood: CoachMood;
  onGrow: () => void;
}

const Bubble = ({ message, persona, animate, mood, onGrow }: BubbleProps) => {
  const theme = getPersonaTheme(persona.id);
  const isCoach = message.role === "coach";
  const { visible, done } = useTypewriter(message.content, animate && isCoach);
  // Stiker faqat yangi javobda va hissiy cho'qqida — botdagi qoida bilan bir xil.
  const showSticker = animate && isCoach && isStickerMood(mood) && hasCoachArt(persona.id);

  // Matn ochilib borar ekan ro'yxat pastga surilib tursin.
  useEffect(() => {
    onGrow();
  }, [visible, onGrow]);

  if (!isCoach) {
    return (
      <div className="flex justify-end animate-bubble-in">
        <div className="max-w-[85%] bg-gradient-to-br from-food-green-500 to-food-green-600 text-white rounded-2xl rounded-br-md px-3.5 py-2.5 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-bubble-in">
      {/* Murabbiyning stikeri — javob ustida "sakrab" chiqadi */}
      {showSticker && (
        <MotivatorArt
          mood={mood}
          animated
          sticker
          className="w-24 h-24 ml-9 -mb-1 coach-sticker-in"
          idPrefix={`stk-${mood}`}
        />
      )}
      <div className="flex items-end gap-2">
        <CoachAvatar
          personaId={persona.id}
          emoji={persona.emoji}
          mood={mood}
          size="xs"
          animated={animate}
        />
        <div
          className={`max-w-[85%] ${theme.bubble} border-2 rounded-2xl rounded-bl-md px-3.5 py-2.5`}
        >
          <p className="text-sm leading-relaxed text-food-brown-800 whitespace-pre-wrap break-words">
            {renderRichText(visible)}
            {!done && <span className="coach-caret" />}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ chat */

interface CoachChatProps {
  persona: CoachPersona;
  messages: CoachHistoryItem[];
  /** Yangi kelgan javob shu id bilan belgilanadi — faqat u animatsiya bilan ochiladi. */
  animatedKey: string | null;
  isSending: boolean;
  isLocked: boolean;
  messagesLeft: number;
  isFreeTrial: boolean;
  /** Murabbiy taklif qilgan keyingi savol — bosilganda chatga yoziladi. */
  suggestion?: string | null;
  /** Oxirgi javob ohangi (backenddan) — sarlavhadagi avatar shunga moslashadi. */
  mood?: CoachMood;
  onSend: (message: string) => void;
  onChangePersona: () => void;
  paywall?: ReactNode;
}

const CoachChat = ({
  persona,
  messages,
  animatedKey,
  isSending,
  isLocked,
  messagesLeft,
  isFreeTrial,
  suggestion,
  mood = "idle",
  onSend,
  onChangePersona,
  paywall,
}: CoachChatProps) => {
  const theme = getPersonaTheme(persona.id);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages.length, isSending, scrollToBottom]);

  // Faqat suhbat bo'sh bo'lganda ko'rsatiladi — keyin murabbiyning o'z taklifi chiqadi.
  const starters = useMemo(() => getQuickQuestions(persona.id), [persona.id]);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || isSending || isLocked) return;
    setDraft("");
    onSend(value);
  };

  return (
    <div className="bg-white/95 rounded-2xl border-2 border-white shadow-sm overflow-hidden flex flex-col">
      {/* Sarlavha */}
      <div
        className={`bg-gradient-to-r ${theme.gradient} px-3 py-2.5 flex items-center gap-2.5`}
      >
        {/* Kayfiyat o'zgarganda avatar qayta "sakrab" chiqadi (key → pop animatsiyasi) */}
        <CoachAvatar
          key={isSending ? "think" : mood}
          personaId={persona.id}
          emoji={persona.emoji}
          mood={isSending ? "think" : mood}
          size="sm"
          animated
          ring
          className="coach-mood-pop"
        />
        <div className="flex-1 min-w-0">
          <div className="text-white font-extrabold text-sm truncate">
            {persona.name}
          </div>
          <div className="text-white/85 text-[11px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-300 animate-pulse" />
            {isSending ? "yozyapti…" : "aloqada"}
          </div>
        </div>
        <button
          type="button"
          onClick={onChangePersona}
          className="text-white/90 text-[11px] font-bold bg-white/20 hover:bg-white/30 rounded-full px-2.5 py-1.5 transition-colors active:scale-95"
        >
          🔄 Almashtirish
        </button>
      </div>

      {/* Bepul tanishuv hisoblagichi */}
      {isFreeTrial && !isLocked && (
        <div className="bg-food-yellow-50 border-b border-food-yellow-200 px-3 py-1.5 text-[11px] text-food-brown-700 font-bold text-center">
          Bepul tanishuv: yana{" "}
          <span className="text-food-orange-600">{messagesLeft}</span> ta savol
        </div>
      )}

      {/* Xabarlar */}
      <div
        ref={scrollRef}
        className="px-3 py-3 space-y-3 overflow-y-auto"
        style={{ height: "min(58vh, 460px)" }}
      >
        {messages.length === 0 && !isSending && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <CoachAvatar
              personaId={persona.id}
              emoji={persona.emoji}
              mood="hello"
              size="xl"
              animated
              ring
              className="mb-3 shadow-lg"
            />
            <p className="font-extrabold text-food-brown-800">
              {persona.name} keldi
            </p>
            <p className="text-sm text-food-brown-600 mt-1">
              {persona.tagline}
            </p>
            <p className="text-xs text-food-brown-500 mt-3">
              Savolingizni yozing — u sizning vazningiz, maqsadingiz va bugungi
              kaloriyangizni ko'rib turibdi.
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const key = `${message.created_at}-${index}`;
          const isLatest = key === animatedKey;
          return (
            <Bubble
              key={key}
              message={message}
              persona={persona}
              animate={isLatest}
              // Yangi javobda serverdagi ohang, eski tarixda matndan taxmin.
              mood={isLatest ? mood : moodFromText("", message.content)}
              onGrow={scrollToBottom}
            />
          );
        })}

        {isSending && <TypingBubble persona={persona} />}
      </div>

      {/* Suhbatdan kelib chiqqan bitta taklif. Bo'sh ekranda — boshlang'ich savollar. */}
      {!isLocked && !isSending && (
        <div className="px-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {(suggestion ? [suggestion] : messages.length === 0 ? starters : []).map(
            (question) => (
              <button
                key={question}
                type="button"
                onClick={() => submit(question)}
                className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border-2 ${theme.border} ${theme.soft} ${theme.text} active:scale-95 transition-transform`}
              >
                💬 {question}
              </button>
            ),
          )}
        </div>
      )}

      {/* Yozish maydoni yoki paywall */}
      {isLocked ? (
        <div className="p-3 border-t-2 border-food-brown-100">{paywall}</div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(draft);
          }}
          className="p-2.5 border-t-2 border-food-brown-100 flex gap-2 items-end"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(draft);
              }
            }}
            rows={1}
            maxLength={700}
            placeholder="Savolingizni yozing…"
            className="flex-1 resize-none rounded-xl border-2 border-food-brown-100 focus:border-food-green-300 focus:outline-none px-3 py-2 text-sm text-food-brown-800 placeholder:text-food-brown-400 max-h-24"
          />
          <button
            type="submit"
            disabled={!draft.trim() || isSending}
            className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${theme.gradient} text-white text-lg flex items-center justify-center shadow-sm disabled:opacity-40 active:scale-95 transition-transform`}
            aria-label="Yuborish"
          >
            {isSending ? "…" : "➤"}
          </button>
        </form>
      )}
    </div>
  );
};

export default CoachChat;
