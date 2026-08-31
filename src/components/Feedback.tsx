import { useState } from "react";
import { useMyFeedbacks, useSubmitFeedback } from "../hooks/useFeedback";
import type { FeedbackCreateData } from "../services/api";
import { useToast } from "./Toast";

const CATEGORIES = [
  { value: "general", label: "Umumiy", icon: "💬" },
  { value: "suggestion", label: "Taklif", icon: "💡" },
  { value: "bug", label: "Xatolik", icon: "🐛" },
  { value: "complaint", label: "Shikoyat", icon: "😤" },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Kutilmoqda", color: "bg-amber-100 text-amber-700" },
  in_review: { label: "Ko'rilmoqda", color: "bg-stone-100 text-stone-700" },
  responded: { label: "Javob berildi", color: "bg-emerald-100 text-emerald-700" },
  closed: { label: "Yopildi", color: "bg-stone-100 text-stone-700" },
};

const Feedback = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");

  // React Query hooks for data fetching
  const { data: feedbacks = [], isLoading: loadingHistory } = useMyFeedbacks();
  const submitFeedbackMutation = useSubmitFeedback();

  // New feedback form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (tab: "new" | "history") => {
    setActiveTab(tab);
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Mavzu va xabar to'ldirilishi shart");
      return;
    }

    setError(null);

    try {
      const feedbackData: FeedbackCreateData = {
        subject: subject.trim(),
        message: message.trim(),
        category,
      };
      if (rating) {
        feedbackData.rating = rating;
      }
      await submitFeedbackMutation.mutateAsync(feedbackData);

      setSubmitted(true);
      toast.success("Fikringiz qabul qilindi!");
      setSubject("");
      setMessage("");
      setCategory("general");
      setRating(null);

      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Xatolik yuz berdi";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-stone-900">
          Fikr-mulohaza
        </h2>
        <p className="text-stone-500 text-sm mt-0.5">
          Bizga o'z fikringizni bildiring
        </p>
      </div>

      {/* Segment Control */}
      <div className="relative bg-stone-100/60 rounded-2xl p-1 shadow-inner grid grid-cols-2 overflow-hidden">
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-white shadow-sm transition-transform duration-300 ease-out"
          style={{
            transform: activeTab === "new" ? "translateX(0)" : "translateX(100%)",
            marginLeft: "2px",
          }}
        />
        <button
          onClick={() => handleTabChange("new")}
          className={`relative z-10 py-2.5 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === "new" ? "text-emerald-700" : "text-stone-500"
            }`}
        >
          <span>✍️</span>
          <span>Yangi</span>
        </button>
        <button
          onClick={() => handleTabChange("history")}
          className={`relative z-10 py-2.5 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === "history" ? "text-emerald-700" : "text-stone-500"
            }`}
        >
          <span>📋</span>
          <span>Tarix</span>
        </button>
      </div>

      {/* New Feedback Tab */}
      {activeTab === "new" && (
        <div className="space-y-4">
          {/* Success message */}
          {submitted && (
            <div className="bg-emerald-100 border border-stone-200 rounded-xl p-4 text-center">
              <span className="text-2xl mb-2 block">✅</span>
              <p className="text-emerald-700 font-semibold">
                Fikringiz qabul qilindi!
              </p>
              <p className="text-emerald-700 text-sm">
                Tez orada ko'rib chiqamiz
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Category */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200">
            <label className="text-sm font-semibold text-stone-900 mb-3 block">
              📁 Kategoriya
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`py-2 px-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${category === cat.value
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-stone-700 border border-stone-200 hover:border-stone-200"
                    }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <label className="text-sm font-semibold text-stone-900 mb-2 block">
              📝 Mavzu
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Qisqacha mavzu yozing..."
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-200 outline-none transition-all text-stone-900 font-medium"
            />
          </div>

          {/* Message */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200">
            <label className="text-sm font-semibold text-stone-900 mb-2 block">
              💭 Xabar
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Fikringizni batafsil yozing..."
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-200 outline-none transition-all text-stone-900 font-medium resize-none"
            />
            <p className="text-xs text-stone-500 mt-1 text-right">
              {message.length}/1000
            </p>
          </div>

          {/* Rating */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <label className="text-sm font-semibold text-stone-900 mb-3 block">
              ⭐ Baho (ixtiyoriy)
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(rating === star ? null : star)}
                  className={`text-3xl transition-transform hover:scale-110 ${rating && rating >= star ? "opacity-100" : "opacity-30"
                    }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            {rating && (
              <p className="text-center text-sm text-stone-600 mt-2">
                {rating === 5 && "Ajoyib! 🎉"}
                {rating === 4 && "Yaxshi! 👍"}
                {rating === 3 && "O'rtacha 😐"}
                {rating === 2 && "Yomon 😕"}
                {rating === 1 && "Juda yomon 😞"}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={submitFeedbackMutation.isPending || !subject.trim() || !message.trim()}
            className={`w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:cursor-not-allowed ${submitFeedbackMutation.isPending
                ? "bg-stone-400"
                : "bg-emerald-600 "
              }`}
          >
            {submitFeedbackMutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Yuborilmoqda...</span>
              </>
            ) : (
              <>
                <span className="text-xl">📤</span>
                <span>Yuborish</span>
              </>
            )}
          </button>

          {/* Info */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="text-stone-700 font-medium text-sm flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                Siz shuningdek Telegram botga xabar yozish orqali ham feedback yuborishingiz mumkin!
              </span>
            </p>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border border-stone-200 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-stone-600 mt-2">Yuklanmoqda...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl">
              <span className="text-4xl mb-2 block">📭</span>
              <p className="text-stone-600 font-medium">
                Hali feedback yubormadingiz
              </p>
              <button
                onClick={() => setActiveTab("new")}
                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-all"
              >
                Birinchi feedbackni yuboring
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-stone-900">
                        {feedback.subject}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {new Date(feedback.created_at).toLocaleDateString("uz-UZ", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_LABELS[feedback.status]?.color || "bg-stone-100"
                        }`}
                    >
                      {STATUS_LABELS[feedback.status]?.label || feedback.status}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-stone-700 mb-2">
                    {feedback.message}
                  </p>

                  {/* Rating */}
                  {feedback.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${star <= feedback.rating! ? "opacity-100" : "opacity-30"
                            }`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Admin response */}
                  {feedback.admin_response && (
                    <div className="mt-3 pt-3 border-t border-stone-200">
                      <p className="text-xs text-emerald-700 font-semibold mb-1">
                        💬 Javob:
                      </p>
                      <p className="text-sm text-stone-700 bg-white p-3 rounded-xl">
                        {feedback.admin_response}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Feedback;
