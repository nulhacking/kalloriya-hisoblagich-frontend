import { useState } from "react";
import { useAuthStore, useIsRegistered, useUser } from "../stores";

type AuthMode = "login" | "register";

export default function AuthScreen() {
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const convertAnonymous = useAuthStore((state) => state.convertAnonymous);
  const isRegistered = useIsRegistered();
  const user = useUser();
  const [mode, setMode] = useState<AuthMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
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

  if (isRegistered) {
    return (
      <div className="animate-fade-in-up">
        {/* Header */}
        <header className="text-center mb-6">
          <div className="text-5xl mb-2">👤</div>
          <h1 className="text-2xl font-extrabold gradient-text-food mb-1">
            Profil
          </h1>
          <p className="text-sm text-food-brown-600">
            Siz ro'yxatdan o'tgansiz
          </p>
        </header>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 border-2 border-food-green-100">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-food-green-400 to-food-green-600 rounded-full flex items-center justify-center text-4xl text-white shadow-lg mb-4">
              {user?.name?.[0]?.toUpperCase() || "👤"}
            </div>
            <h2 className="text-xl font-bold text-food-brown-800 mb-1">
              {user?.name || "Foydalanuvchi"}
            </h2>
            <p className="text-food-brown-600 text-sm mb-4">{user?.email}</p>

            <div className="bg-food-green-50 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-center gap-2 text-food-green-700">
                <span className="text-xl">✅</span>
                <span className="font-medium">
                  Hisobingiz sinxronlangan
                </span>
              </div>
              <p className="text-xs text-food-green-600 mt-1">
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
