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

const TypingBubble = ({ gradient }: { gradient: string }) => (
  <div className="flex items-end gap-2 animate-fade-in">
    <div
      className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} shrink-0`}
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
  onGrow: () => void;
}

const Bubble = ({ message, persona, animate, onGrow }: BubbleProps) => {
  const theme = getPersonaTheme(persona.id);
  const isCoach = message.role === "coach";
  const { visible, done } = useTypewriter(message.content, animate && isCoach);

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
    <div className="flex items-end gap-2 animate-bubble-in">
      <div
        className={`w-7 h-7 rounded-full bg-gradient-to-br ${theme.gradient} shrink-0 flex items-center justify-center text-sm`}
      >
        {persona.emoji}
      </div>
      <div
        className={`max-w-[85%] ${theme.bubble} border-2 rounded-2xl rounded-bl-md px-3.5 py-2.5`}
      >
        <p className="text-sm leading-relaxed text-food-brown-800 whitespace-pre-wrap break-words">
          {renderRichText(visible)}
          {!done && <span className="coach-caret" />}
        </p>
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

  const quickQuestions = useMemo(
    () => getQuickQuestions(persona.id),
    [persona.id],
  );

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
        <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-xl">
          {persona.emoji}
        </div>
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
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-3xl mb-3 shadow-lg`}
            >
              {persona.emoji}
            </div>
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

        {messages.map((message, index) => (
          <Bubble
            key={`${message.created_at}-${index}`}
            message={message}
            persona={persona}
            animate={`${message.created_at}-${index}` === animatedKey}
            onGrow={scrollToBottom}
          />
        ))}

        {isSending && <TypingBubble gradient={theme.gradient} />}
      </div>

      {/* Tez savollar */}
      {!isLocked && messages.length < 6 && (
        <div className="px-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {quickQuestions.map((question) => (
            <button
              key={question}
              type="button"
              disabled={isSending}
              onClick={() => submit(question)}
              className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border-2 ${theme.border} ${theme.soft} ${theme.text} disabled:opacity-50 active:scale-95 transition-transform`}
            >
              💬 {question}
            </button>
          ))}
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
