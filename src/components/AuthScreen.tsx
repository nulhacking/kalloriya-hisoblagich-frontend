import { useState } from "react";
import { useAuthStore, useIsRegistered, useUser, useIsTelegramMiniApp } from "../stores";

type AuthMode = "login" | "register";

export default function AuthScreen() {
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const convertAnonymous = useAuthStore((state) => state.convertAnonymous);
  const loginWithTelegram = useAuthStore((state) => state.loginWithTelegram);
  const linkTelegram = useAuthStore((state) => state.linkTelegram);
  const isRegistered = useIsRegistered();
  const user = useUser();
  const isTelegramMiniApp = useIsTelegramMiniApp();
  const [mode, setMode] = useState<AuthMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "login") {
        await login(email, password);
        setSuccess("Muvaffaqiyatli kirdingiz!");
      } else {
        // If user is anonymous, convert them
        if (user?.user_type === "anonymous") {
          await convertAnonymous(email, password, name || undefined);
          setSuccess(
            "Muvaffaqiyatli ro'yxatdan o'tdingiz! Ma'lumotlaringiz saqlab qolindi."
          );
        } else {
          await register(email, password, name || undefined);
          setSuccess("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
        }
      }
      // Clear form
      setEmail("");
      setPassword("");
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // Telegram bot username - configure this in your environment
  const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "kaloriya_hisoblagich_bot";

  const handleTelegramLogin = async () => {
    const initData = window.Telegram?.WebApp?.initData;
    
    // If not in Telegram Mini App, open the bot
    if (!initData || !isTelegramMiniApp) {
      // Open Telegram bot link
      const botUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=login`;
      window.open(botUrl, "_blank");
      return;
    }

    setTelegramLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (user?.user_type === "anonymous") {
        // Link Telegram to existing anonymous account
        await linkTelegram(initData);
        setSuccess("Telegram hisobi ulandi! Ma'lumotlaringiz saqlab qolindi.");
      } else {
        // Login with Telegram
        await loginWithTelegram(initData);
        setSuccess("Telegram orqali muvaffaqiyatli kirdingiz!");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Telegram orqali kirishda xatolik");
    } finally {
      setTelegramLoading(false);
    }
  };

  if (isRegistered) {
    const isTelegramUser = user?.user_type === "telegram";
    
    return (
      <div className="animate-fade-in-up">
        {/* Header */}
        <header className="text-center mb-6">
          <div className="text-5xl mb-2">{isTelegramUser ? "✈️" : "👤"}</div>
          <h1 className="text-2xl font-extrabold gradient-text-food mb-1">
            Profil
          </h1>
          <p className="text-sm text-food-brown-600">
            {isTelegramUser ? "Telegram orqali kirgansiz" : "Siz ro'yxatdan o'tgansiz"}
          </p>
        </header>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 border-2 border-food-green-100">
          <div className="text-center">
            {user?.telegram_photo_url ? (
              <img
                src={user.telegram_photo_url}
                alt={user.name || "User"}
                className="w-20 h-20 mx-auto rounded-full object-cover shadow-lg mb-4 border-4 border-food-green-200"
              />
            ) : (
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-food-green-400 to-food-green-600 rounded-full flex items-center justify-center text-4xl text-white shadow-lg mb-4">
                {user?.name?.[0]?.toUpperCase() || "👤"}
              </div>
            )}
            <h2 className="text-xl font-bold text-food-brown-800 mb-1">
              {user?.name || "Foydalanuvchi"}
            </h2>
            {user?.email && (
              <p className="text-food-brown-600 text-sm mb-2">{user.email}</p>
            )}
            {user?.telegram_username && (
              <p className="text-blue-500 text-sm mb-4">@{user.telegram_username}</p>
            )}

            <div className={`${isTelegramUser ? "bg-blue-50" : "bg-food-green-50"} rounded-2xl p-4 mb-4`}>
              <div className={`flex items-center justify-center gap-2 ${isTelegramUser ? "text-blue-600" : "text-food-green-700"}`}>
                <span className="text-xl">{isTelegramUser ? "✈️" : "✅"}</span>
                <span className="font-medium">
                  {isTelegramUser ? "Telegram orqali ulangan" : "Hisobingiz sinxronlangan"}
                </span>
              </div>
              <p className={`text-xs ${isTelegramUser ? "text-blue-500" : "text-food-green-600"} mt-1`}>
                Ma'lumotlaringiz bulutda saqlanadi
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-food-orange-50 rounded-xl p-3">
                <div className="text-2xl mb-1">🎯</div>
                <div className="font-bold text-food-orange-700">
                  {user?.daily_calorie_goal}
                </div>
                <div className="text-food-orange-600 text-xs">
                  Kunlik kaloriya
                </div>
              </div>
              <div className="bg-food-yellow-50 rounded-xl p-3">
                <div className="text-2xl mb-1">💪</div>
                <div className="font-bold text-food-yellow-700">
                  {user?.daily_protein_goal}g
                </div>
                <div className="text-food-yellow-600 text-xs">Kunlik oqsil</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <header className="text-center mb-6">
        <div className="text-5xl mb-2">🔐</div>
        <h1 className="text-2xl font-extrabold gradient-text-food mb-1">
          {mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
        </h1>
        <p className="text-sm text-food-brown-600">
          {mode === "login"
            ? "Hisobingizga kiring"
            : "Ma'lumotlaringizni sinxronlang"}
        </p>
      </header>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 border-2 border-food-green-100">
        {/* Anonymous user notice */}
        {user?.user_type === "anonymous" && mode === "register" && (
          <div className="bg-food-yellow-50 rounded-2xl p-4 mb-4 border border-food-yellow-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-bold text-food-yellow-800 text-sm">
                  Ma'lumotlaringiz saqlanadi!
                </p>
                <p className="text-food-yellow-700 text-xs mt-1">
                  Ro'yxatdan o'tsangiz, hozirgi barcha ovqat yozuvlaringiz
                  saqlanib qoladi va boshqa qurilmalarda ham ko'rishingiz
                  mumkin.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-food-red-50 rounded-2xl p-4 mb-4 border border-food-red-200 animate-shake">
            <p className="text-food-red-700 font-medium text-sm flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-food-green-50 rounded-2xl p-4 mb-4 border border-food-green-200">
            <p className="text-food-green-700 font-medium text-sm flex items-center gap-2">
              <span>✅</span>
              {success}
            </p>
          </div>
        )}

        {/* Telegram Login Button - Always visible */}
        <div className="mb-6">
          <button
            onClick={handleTelegramLogin}
            disabled={telegramLoading}
            className="w-full bg-gradient-to-r from-[#0088cc] via-[#0099dd] to-[#0088cc] hover:from-[#0077bb] hover:via-[#0088cc] hover:to-[#0077bb] disabled:from-gray-300 disabled:via-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg active:scale-95"
          >
            {telegramLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Kutilmoqda...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span>Telegram orqali kirish</span>
              </>
            )}
          </button>
          
          {!isTelegramMiniApp && (
            <p className="text-center text-food-brown-500 text-xs mt-2">
              Telegram botimiz orqali tez va xavfsiz kiring
            </p>
          )}
          
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-food-brown-200"></div>
            <span className="px-4 text-food-brown-400 text-sm">yoki</span>
            <div className="flex-1 border-t border-food-brown-200"></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-bold text-food-brown-700 mb-2">
                Ism (ixtiyoriy)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-food-green-200 focus:border-food-green-500 focus:ring-2 focus:ring-food-green-200 outline-none transition-all text-food-brown-800"
                placeholder="Ismingizni kiriting"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-food-brown-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-food-green-200 focus:border-food-green-500 focus:ring-2 focus:ring-food-green-200 outline-none transition-all text-food-brown-800"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-food-brown-700 mb-2">
              Parol
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border-2 border-food-green-200 focus:border-food-green-500 focus:ring-2 focus:ring-food-green-200 outline-none transition-all text-food-brown-800"
              placeholder="Kamida 6 ta belgi"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-food-green-500 via-food-green-600 to-food-green-500 hover:from-food-green-600 hover:via-food-green-700 hover:to-food-green-600 disabled:from-gray-300 disabled:via-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Kutilmoqda...</span>
              </>
            ) : (
              <>
                <span>{mode === "login" ? "🚀" : "✨"}</span>
                <span>
                  {mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <p className="text-food-brown-600 text-sm">
            {mode === "login"
              ? "Hisobingiz yo'qmi?"
              : "Allaqachon hisobingiz bormi?"}
          </p>
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
              setSuccess(null);
            }}
            className="mt-2 text-food-green-600 hover:text-food-green-700 font-bold underline underline-offset-2 transition-colors"
          >
            {mode === "login" ? "Ro'yxatdan o'tish" : "Kirish"}
          </button>
        </div>

        {/* Skip for now */}
        {user?.user_type === "anonymous" && (
          <div className="mt-4 text-center">
            <p className="text-food-brown-500 text-xs">
              Hozircha anonim foydalanishda davom etishingiz mumkin.
              <br />
              Ma'lumotlaringiz faqat shu qurilmada saqlanadi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
