import { useState, useEffect } from "react";
import { useAuthStore } from "../stores";
import {
  checkAdminStatus,
  getAllFeedbacks,
  getFeedbackStats,
  replyFeedbackTelegram,
  sendMessageToUser,
  getTelegramUsers,
  FeedbackDetailItem,
  FeedbackStatsResponse,
  TelegramUser,
} from "../services/api";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Kutilmoqda", color: "bg-amber-100 text-amber-700 border-amber-200" },
  in_review: { label: "Ko'rilmoqda", color: "bg-stone-100 text-stone-700 border-stone-200" },
  responded: { label: "Javob berildi", color: "bg-emerald-100 text-emerald-700 border-stone-200" },
  closed: { label: "Yopildi", color: "bg-stone-100 text-stone-700 border-stone-200" },
};

const AdminPage = () => {
  const token = useAuthStore((state) => state.token);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"feedbacks" | "users" | "broadcast">("feedbacks");
  
  // Feedback state
  const [feedbacks, setFeedbacks] = useState<FeedbackDetailItem[]>([]);
  const [stats, setStats] = useState<FeedbackStatsResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Reply modal state
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackDetailItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  
  // Users state
  const [users, setUsers] = useState<TelegramUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Send message state
  const [selectedUser, setSelectedUser] = useState<TelegramUser | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  
  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!token) {
        setIsAdmin(false);
        return;
      }
      const result = await checkAdminStatus(token);
      setIsAdmin(result.is_admin);
    };
    checkAdmin();
  }, [token]);

  // Load feedbacks
  useEffect(() => {
    const loadData = async () => {
      if (!token || !isAdmin) return;
      
      setLoading(true);
      try {
        const [feedbacksData, statsData] = await Promise.all([
          getAllFeedbacks(token, page, 10, statusFilter || undefined),
          getFeedbackStats(token),
        ]);
        setFeedbacks(feedbacksData.feedbacks);
        setTotalPages(feedbacksData.total_pages);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token, isAdmin, page, statusFilter]);

  // Load users
  const loadUsers = async () => {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const usersData = await getTelegramUsers(token);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users" && users.length === 0) {
      loadUsers();
    }
  }, [activeTab]);

  // Handle reply
  const handleReply = async () => {
    if (!token || !selectedFeedback || !replyText.trim()) return;
    
    setReplying(true);
    try {
      const result = await replyFeedbackTelegram(token, selectedFeedback.id, replyText);
      alert(result.message);
      setSelectedFeedback(null);
      setReplyText("");
      // Reload feedbacks
      const feedbacksData = await getAllFeedbacks(token, page, 10, statusFilter || undefined);
      setFeedbacks(feedbacksData.feedbacks);
    } catch (error) {
      alert("Xatolik yuz berdi");
    } finally {
      setReplying(false);
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!token || !selectedUser || !messageText.trim()) return;
    
    setSending(true);
    try {
      const result = await sendMessageToUser(token, selectedUser.id, messageText);
      alert(result.message);
      setSelectedUser(null);
      setMessageText("");
    } catch (error) {
      alert("Xatolik yuz berdi");
    } finally {
      setSending(false);
    }
  };

  // Not admin
  if (isAdmin === false) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl mb-4 block">🚫</span>
        <h2 className="text-xl font-semibold text-stone-900">Kirish taqiqlangan</h2>
        <p className="text-stone-600 mt-2">Bu sahifa faqat adminlar uchun</p>
      </div>
    );
  }

  // Loading
  if (isAdmin === null || loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border border-stone-200 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-stone-600 mt-4">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-stone-900">
          Admin Panel
        </h2>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-center">
            <p className="text-2xl font-semibold text-amber-700">{stats.pending}</p>
            <p className="text-xs text-amber-700">Kutilmoqda</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-center">
            <p className="text-2xl font-semibold text-stone-600">{stats.in_review}</p>
            <p className="text-xs text-stone-700">Ko'rilmoqda</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 border border-stone-200 text-center">
            <p className="text-2xl font-semibold text-emerald-700">{stats.responded}</p>
            <p className="text-xs text-emerald-700">Javob berildi</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-center">
            <p className="text-2xl font-semibold text-stone-600">{stats.total}</p>
            <p className="text-xs text-stone-700">Jami</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1 gap-1">
        <button
          onClick={() => setActiveTab("feedbacks")}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
            activeTab === "feedbacks"
              ? "bg-emerald-600 text-white"
              : "text-stone-600 hover:bg-stone-50"
          }`}
        >
          💬 Feedbacklar
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
            activeTab === "users"
              ? "bg-emerald-600 text-white"
              : "text-stone-600 hover:bg-stone-50"
          }`}
        >
          👥 Foydalanuvchilar
        </button>
      </div>

      {/* Feedbacks Tab */}
      {activeTab === "feedbacks" && (
        <div className="space-y-3">
          {/* Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => { setStatusFilter(""); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                !statusFilter ? "bg-emerald-600 text-white" : "bg-white text-stone-600 border"
              }`}
            >
              Barchasi
            </button>
            {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => { setStatusFilter(key); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                  statusFilter === key ? "bg-emerald-600 text-white" : "bg-white text-stone-600 border"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Feedbacks List */}
          {feedbacks.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl">
              <span className="text-4xl mb-2 block">📭</span>
              <p className="text-stone-600">Feedbacklar yo'q</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-stone-900">{feedback.subject}</p>
                      <p className="text-xs text-stone-500">
                        {feedback.user?.telegram_username 
                          ? `@${feedback.user.telegram_username}` 
                          : feedback.user?.name || "Anonim"
                        }
                        {" • "}
                        {new Date(feedback.created_at).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_LABELS[feedback.status]?.color}`}>
                      {STATUS_LABELS[feedback.status]?.label}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-stone-700 mb-3">{feedback.message}</p>

                  {/* Admin response if exists */}
                  {feedback.admin_response && (
                    <div className="bg-emerald-50 p-3 rounded-lg mb-3">
                      <p className="text-xs text-emerald-700 font-semibold mb-1">Javob:</p>
                      <p className="text-sm text-stone-700">{feedback.admin_response}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedFeedback(feedback);
                        setReplyText(feedback.admin_response || "");
                      }}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all"
                    >
                      💬 Javob berish
                    </button>
                    {feedback.user?.telegram_username && (
                      <button
                        onClick={() => {
                          setSelectedUser({
                            id: feedback.user_id,
                            name: feedback.user?.name || null,
                            email: null,
                            user_type: feedback.user?.user_type || "telegram",
                            telegram_id: null,
                            telegram_username: feedback.user?.telegram_username || null,
                            telegram_first_name: feedback.user?.name || null,
                            created_at: "",
                            is_active: true,
                          });
                          setMessageText("");
                        }}
                        className="py-2 px-4 bg-stone-900 text-white rounded-lg text-sm font-semibold hover:bg-stone-800 transition-all"
                      >
                        📤 Xabar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white rounded-lg border disabled:opacity-50"
              >
                ←
              </button>
              <span className="px-4 py-2 bg-white rounded-lg border">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white rounded-lg border disabled:opacity-50"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-3">
          {loadingUsers ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border border-stone-200 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl">
              <span className="text-4xl mb-2 block">👥</span>
              <p className="text-stone-600">Telegram foydalanuvchilari yo'q</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-stone-600 font-medium">
                Jami: {users.length} ta foydalanuvchi
              </p>
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-xl p-3 border border-stone-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-stone-900">
                      {user.telegram_first_name || user.name || "Anonim"}
                    </p>
                    <p className="text-xs text-stone-500">
                      {user.telegram_username ? `@${user.telegram_username}` : user.telegram_id}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setMessageText("");
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all"
                  >
                    📤 Xabar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reply Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="font-semibold text-lg text-stone-900 mb-3">
              💬 Feedbackga javob
            </h3>
            
            <div className="bg-emerald-50 p-3 rounded-lg mb-3">
              <p className="text-xs text-emerald-700 font-semibold mb-1">Foydalanuvchi xabari:</p>
              <p className="text-sm text-stone-700">{selectedFeedback.message}</p>
            </div>
            
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Javob yozing..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 outline-none resize-none mb-3"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="flex-1 py-3 bg-stone-200 text-stone-700 rounded-xl font-semibold"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleReply}
                disabled={replying || !replyText.trim()}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {replying ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 w-full max-w-md">
            <h3 className="font-semibold text-lg text-stone-900 mb-3">
              📤 Xabar yuborish
            </h3>
            
            <div className="bg-stone-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-stone-700">
                <b>Kimga:</b> {selectedUser.telegram_first_name || selectedUser.name}
                {selectedUser.telegram_username && ` (@${selectedUser.telegram_username})`}
              </p>
            </div>
            
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Xabar yozing..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 outline-none resize-none mb-3"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-3 bg-stone-200 text-stone-700 rounded-xl font-semibold"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !messageText.trim()}
                className="flex-1 py-3 bg-stone-900 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {sending ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
