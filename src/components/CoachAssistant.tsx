import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCoachHistory,
  useCoachPersonas,
  useSelectCoachPersona,
  useSendCoachMessage,
} from "../hooks/useCoachChat";
import { ApiError } from "../services/api";
import { mealKeys } from "../hooks/useMeals";
import { activityKeys } from "../hooks/useActivities";
import { GOAL_SUMMARY_QUERY_KEY } from "../hooks/useGoal";
import type { CoachHistoryItem } from "../types";
import { asCoachMood } from "../utils/coachMood";
import { type CoachMood } from "./coach/MotivatorArt";
import CoachChat from "./CoachChat";
import CoachPersonaPicker from "./CoachPersonaPicker";
import LoadingSpinner from "./LoadingSpinner";
import ProPlusPaywall from "./ProPlusPaywall";
import { PLAN_META } from "../utils/plan";
import { useToast } from "./Toast";

/**
 * AI murabbiy bo'limi: murabbiy tanlash → suhbat.
 *
 * Xabarlar ro'yxati mahalliy state da — javob kelganda darhol chiqadi va
 * typewriter animatsiyasi faqat oxirgi javobda ishlaydi.
 */
const CoachAssistant = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const personasQuery = useCoachPersonas();
  const historyQuery = useCoachHistory();
  const selectMutation = useSelectCoachPersona();
  const sendMutation = useSendCoachMessage();

  const [messages, setMessages] = useState<CoachHistoryItem[]>([]);
  const [animatedKey, setAnimatedKey] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  // Oxirgi javob ohangi — avatar pozasi va stiker shundan (backend yuboradi).
  const [mood, setMood] = useState<CoachMood>("idle");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [paywalled, setPaywalled] = useState(false);

  const data = personasQuery.data;
  const selectedPersona = useMemo(
    () =>
      data?.personas.find((p) => p.id === data.selected_id && p.is_active) ??
      null,
    [data],
  );

  // Serverdagi tarix — murabbiy almashganda ham qayta yuklanadi.
  useEffect(() => {
    if (historyQuery.data) {
      setMessages(historyQuery.data.messages);
      setAnimatedKey(null);
      setSuggestion(null);
      setMood("idle");
    }
  }, [historyQuery.data]);

  const messagesLeft = data?.messages_left_today ?? 0;
  const hasAccess = data?.has_access ?? false;
  const isLocked = paywalled || (!hasAccess && messagesLeft <= 0);

  const handleSelect = (personaId: string) => {
    selectMutation.mutate(personaId, {
      onSuccess: () => {
        setPickerOpen(false);
        setPaywalled(false);
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Murabbiyni tanlab bo'lmadi",
        );
      },
    });
  };

  const handleSend = (text: string) => {
    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, created_at: now },
    ]);
    setAnimatedKey(null);
    setSuggestion(null);

    sendMutation.mutate(text, {
      onSuccess: (reply) => {
        const createdAt = new Date().toISOString();
        // Ovqat/vazn/mashq yozilgan bo'lsa — izoh javob matni bilan birga
        // ochiladi (botdagi bilan bir xil qator, raqamlarni backend yozgan).
        const content = [reply.reply, reply.meal_note, reply.action_note]
          .filter(Boolean)
          .join("\n\n");
        setMessages((prev) => {
          const next: CoachHistoryItem[] = [
            ...prev,
            { role: "coach", content, created_at: createdAt },
          ];
          // Faqat shu javob animatsiya bilan ochilsin.
          setAnimatedKey(`${createdAt}-${next.length - 1}`);
          return next;
        });
        setMood(asCoachMood(reply.mood));
        setSuggestion(reply.ok ? (reply.suggestion ?? null) : null);

        // Kunlik hisob o'zgardi — Bosh sahifa va kunlik ro'yxat yangilansin.
        if (reply.logged_meals?.length) {
          queryClient.invalidateQueries({ queryKey: mealKeys.all });
          queryClient.invalidateQueries({ queryKey: GOAL_SUMMARY_QUERY_KEY });
          const names = reply.logged_meals.map((meal) => meal.name).join(", ");
          toast.success(`✅ Kunlik hisobga yozildi: ${names}`);
        }

        // Murabbiy amal bajardi (vazn, maqsad, mashq) — tegishli bo'lim yangilansin.
        const kinds = reply.action_kinds ?? [];
        if (kinds.length) {
          queryClient.invalidateQueries({ queryKey: GOAL_SUMMARY_QUERY_KEY });
        }
        if (kinds.includes("weight") || kinds.includes("target_weight")) {
          queryClient.invalidateQueries({ queryKey: ["weight"] });
        }
        if (kinds.includes("activity")) {
          queryClient.invalidateQueries({ queryKey: activityKeys.all });
          queryClient.invalidateQueries({ queryKey: mealKeys.all });
        }
        if (reply.logged_activities?.length) {
          const names = reply.logged_activities
            .map((item) => item.name)
            .join(", ");
          toast.success(`✅ Mashq yozildi: ${names}`);
        } else if (kinds.includes("weight")) {
          toast.success("⚖️ Vazn saqlandi");
        }
        if (!reply.ok) {
          toast.info("Murabbiy hozir to'liq javob bera olmadi — qayta urinib ko'ring.");
        }
      },
      onError: (error) => {
        // Yuborilmagan savolni ro'yxatda qoldirmaymiz.
        setMessages((prev) => prev.slice(0, -1));
        if (error instanceof ApiError && error.status === 402) {
          setPaywalled(true);
          return;
        }
        toast.error(
          error instanceof ApiError ? error.message : "Xabar yuborilmadi",
        );
      },
    });
  };

  if (personasQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (personasQuery.error || !data) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
        Murabbiylarni yuklashda xatolik. Internet aloqani tekshiring.
      </div>
    );
  }

  const showPicker = pickerOpen || !selectedPersona;

  return (
    <div className="space-y-4">
      {/* Bo'lim sarlavhasi — sokin, bitta aksent rangi */}
      <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              AI murabbiy
            </p>
            <h2 className="text-lg font-semibold text-stone-900 mt-0.5">
              Murabbiyingiz bilan gaplashing
            </h2>
          </div>
          <span
            className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              hasAccess
                ? `${PLAN_META.pro_plus.bg} ${PLAN_META.pro_plus.text} ${PLAN_META.pro_plus.border}`
                : "bg-stone-100 text-stone-500 border-stone-200"
            }`}
          >
            {hasAccess ? "Pro Plus" : "Bepul sinov"}
          </span>
        </div>
        <p className="text-xs text-stone-500 mt-2 leading-relaxed">
          U vazningiz, maqsadingiz va bugungi kaloriyangizni ko'rib turadi —
          javoblari umumiy emas, aynan sizga.
        </p>
      </div>

      {showPicker ? (
        <>
          <CoachPersonaPicker
            personas={data.personas}
            selectedId={data.selected_id}
            onSelect={handleSelect}
            pendingId={
              selectMutation.isPending
                ? (selectMutation.variables as string)
                : null
            }
          />

          {selectedPersona && (
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="w-full text-sm font-semibold text-stone-500 py-2"
            >
              ← Suhbatga qaytish
            </button>
          )}

          {!hasAccess && (
            <ProPlusPaywall
              subtitle={`Hozir ${data.daily_limit} ta bepul savol sinab ko'rasiz. Cheklovsiz suhbat va boshqa murabbiylar — Pro Plus da.`}
            />
          )}
        </>
      ) : (
        <CoachChat
          persona={selectedPersona}
          messages={messages}
          animatedKey={animatedKey}
          isSending={sendMutation.isPending}
          isLocked={isLocked}
          messagesLeft={messagesLeft}
          isFreeTrial={!hasAccess}
          suggestion={suggestion}
          mood={mood}
          onSend={handleSend}
          onChangePersona={() => setPickerOpen(true)}
          paywall={
            <ProPlusPaywall
              compact
              title="Bepul savollar tugadi"
              subtitle="Murabbiy bilan cheklovsiz suhbatlashish uchun Pro Plus ni oling."
            />
          }
        />
      )}
    </div>
  );
};

export default CoachAssistant;
