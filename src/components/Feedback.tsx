import { useState } from "react";
import { useAuthStore } from "../stores";
import { submitFeedback, getMyFeedbacks, FeedbackItem } from "../services/api";

const CATEGORIES = [
  { value: "general", label: "Umumiy", icon: "💬" },
  { value: "suggestion", label: "Taklif", icon: "💡" },
  { value: "bug", label: "Xatolik", icon: "🐛" },
  { value: "complaint", label: "Shikoyat", icon: "😤" },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Kutilmoqda", color: "bg-yellow-100 text-yellow-700" },
  in_review: { label: "Ko'rilmoqda", color: "bg-blue-100 text-blue-700" },
  responded: { label: "Javob berildi", color: "bg-green-100 text-green-700" },
  closed: { label: "Yopildi", color: "bg-gray-100 text-gray-700" },
};

const Feedback = () => {
  const token = useAuthStore((state) => state.token);
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  
  // New feedback form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [rating, setRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // History state
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const loadHistory = async () => {
    if (!token || historyLoaded) return;
    
    setLoadingHistory(true);
    try {
      const data = await getMyFeedbacks(token);
      setFeedbacks(data);
      setHistoryLoaded(true);
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleTabChange = (tab: "new" | "history") => {
    setActiveTab(tab);
    if (tab === "history" && !historyLoaded) {
      loadHistory();
    }
  };

  const handleSubmit = async () => {
    if (!token || !subject.trim() || !message.trim()) {
      setError("Mavzu va xabar to'ldirilishi shart");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitFeedback(token, {
        subject: subject.trim(),
        message: message.trim(),
        category,
        rating: rating || undefined,
      });
      
      setSubmitted(true);
      setSubject("");
      setMessage("");
      setCategory("general");
      setRating(null);
      setHistoryLoaded(false); // Refresh history on next view
      
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-food-brown-800 flex items-center justify-center gap-2">
          <span>💬</span>
          Fikr-mulohaza
        </h2>
        <p className="text-food-brown-600 text-sm mt-1">
          Bizga o'z fikringizni bildiring
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-food-green-100 rounded-xl p-1">
        <button
          onClick={() => handleTabChange("new")}
          className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${
            activeTab === "new"
              ? "bg-white text-food-green-700 shadow-md"
              : "text-food-brown-600 hover:text-food-brown-800"
          }`}
        >
          ✍️ Yangi
        </button>
        <button
          onClick={() => handleTabChange("history")}
          className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${
            activeTab === "history"
              ? "bg-white text-food-green-700 shadow-md"
              : "text-food-brown-600 hover:text-food-brown-800"
          }`}
        >
          📋 Tarix
        </button>
      </div>

      {/* New Feedback Tab */}
      {activeTab === "new" && (
        <div className="space-y-4">
          {/* Success message */}
          {submitted && (
            <div className="bg-food-green-100 border-2 border-food-green-300 rounded-xl p-4 text-center">
              <span className="text-2xl mb-2 block">✅</span>
              <p className="text-food-green-700 font-bold">
                Fikringiz qabul qilindi!
              </p>
              <p className="text-food-green-600 text-sm">
                Tez orada ko'rib chiqamiz
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-food-red-100 border-2 border-food-red-300 rounded-xl p-4 text-center">
              <p className="text-food-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Category */}
          <div className="bg-gradient-to-br from-food-green-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-green-200">
            <label className="text-sm font-bold text-food-brown-800 mb-3 block">
              📁 Kategoriya
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`py-2 px-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    category === cat.value
                      ? "bg-food-green-500 text-white shadow-md"
                      : "bg-white text-food-brown-700 border-2 border-food-green-200 hover:border-food-green-400"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="bg-gradient-to-br from-food-orange-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-orange-200">
            <label className="text-sm font-bold text-food-brown-800 mb-2 block">
              📝 Mavzu
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Qisqacha mavzu yozing..."
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border-2 border-food-orange-200 focus:border-food-orange-500 focus:ring-2 focus:ring-food-orange-200 outline-none transition-all text-food-brown-800 font-medium"
            />
          </div>

          {/* Message */}
          <div className="bg-gradient-to-br from-food-green-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-green-200">
            <label className="text-sm font-bold text-food-brown-800 mb-2 block">
              💭 Xabar
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Fikringizni batafsil yozing..."
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border-2 border-food-green-200 focus:border-food-green-500 focus:ring-2 focus:ring-food-green-200 outline-none transition-all text-food-brown-800 font-medium resize-none"
            />
            <p className="text-xs text-food-brown-500 mt-1 text-right">
              {message.length}/1000
            </p>
          </div>

          {/* Rating */}
          <div className="bg-gradient-to-br from-food-yellow-50 to-food-orange-50 rounded-2xl p-4 border-2 border-food-yellow-200">
            <label className="text-sm font-bold text-food-brown-800 mb-3 block">
              ⭐ Baho (ixtiyoriy)
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(rating === star ? null : star)}
                  className={`text-3xl transition-transform hover:scale-110 ${
                    rating && rating >= star ? "opacity-100" : "opacity-30"
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            {rating && (
              <p className="text-center text-sm text-food-brown-600 mt-2">
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
            disabled={submitting || !subject.trim() || !message.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:cursor-not-allowed ${
              submitting
                ? "bg-gray-400"
                : "bg-gradient-to-r from-food-green-500 to-food-green-600 hover:from-food-green-600 hover:to-food-green-700 disabled:from-gray-400 disabled:to-gray-500"
            }`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
          <div className="bg-gradient-to-r from-food-green-100 to-food-yellow-100 border-2 border-food-green-300 rounded-2xl p-4">
            <p className="text-food-brown-700 font-medium text-sm flex items-start gap-2">
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
              <div className="w-8 h-8 border-4 border-food-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-food-brown-600 mt-2">Yuklanmoqda...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-8 bg-food-green-50 rounded-2xl">
              <span className="text-4xl mb-2 block">📭</span>
              <p className="text-food-brown-600 font-medium">
                Hali feedback yubormadingiz
              </p>
              <button
                onClick={() => setActiveTab("new")}
                className="mt-4 px-6 py-2 bg-food-green-500 text-white rounded-xl font-bold hover:bg-food-green-600 transition-all"
              >
                Birinchi feedbackni yuboring
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white rounded-2xl p-4 border-2 border-food-green-100 shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-food-brown-800">
                        {feedback.subject}
                      </h4>
                      <p className="text-xs text-food-brown-500">
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
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        STATUS_LABELS[feedback.status]?.color || "bg-gray-100"
                      }`}
                    >
                      {STATUS_LABELS[feedback.status]?.label || feedback.status}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-food-brown-700 mb-2">
                    {feedback.message}
                  </p>

                  {/* Rating */}
                  {feedback.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${
                            star <= feedback.rating! ? "opacity-100" : "opacity-30"
                          }`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Admin response */}
                  {feedback.admin_response && (
                    <div className="mt-3 pt-3 border-t-2 border-food-green-100">
                      <p className="text-xs text-food-green-600 font-bold mb-1">
                        💬 Javob:
                      </p>
                      <p className="text-sm text-food-brown-700 bg-food-green-50 p-3 rounded-xl">
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
