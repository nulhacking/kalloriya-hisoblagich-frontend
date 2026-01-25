import { useState, useEffect } from "react";
import type { UserSettings } from "../types";
import { useAuthStore, useIsRegistered, useUser } from "../stores";

interface SettingsProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onNavigateToAuth?: () => void;
}

const Settings = ({ settings, onSaveSettings, onNavigateToAuth }: SettingsProps) => {
  const isRegistered = useIsRegistered();
  const user = useUser();
  const logout = useAuthStore((state) => state.logout);
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveSettings(localSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Saqlashda xatolik:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UserSettings, value: string | number) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]:
        typeof value === "string" && field !== "name" && field !== "gender" && field !== "activity_level"
          ? Number(value) || 0
          : value,
    }));
    setSaved(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-food-brown-800 flex items-center justify-center gap-2">
          <span>⚙️</span>
          Sozlamalar
        </h2>
        <p className="text-food-brown-600 text-sm mt-1">
          Kunlik maqsadlaringizni belgilang
        </p>
      </div>

      {/* Auth Section - Show if not registered */}
      {!isRegistered && (
        <div className="bg-gradient-to-br from-food-green-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-green-200">
          <h3 className="text-base font-bold text-food-brown-800 mb-3 flex items-center gap-2">
            <span>🔐</span>
            Hisobingizni sinxronlang
          </h3>
          <p className="text-sm text-food-brown-600 mb-3">
            Ro'yxatdan o'ting va ma'lumotlaringiz barcha qurilmalarda sinxronlansin!
          </p>
          <button
            onClick={() => {
              if (onNavigateToAuth) {
                onNavigateToAuth();
              }
            }}
            className="w-full bg-gradient-to-r from-food-green-500 to-food-green-600 hover:from-food-green-600 hover:to-food-green-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>✨</span>
            <span>Ro'yxatdan o'tish yoki kirish</span>
          </button>
        </div>
      )}

      {/* Ism */}
      <div className="bg-gradient-to-br from-food-green-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-green-200">
        <label className=" text-sm font-bold text-food-brown-800 mb-2 flex items-center gap-2">
          <span>👤</span> Ismingiz
        </label>
        <input
          type="text"
          value={localSettings.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Ismingizni kiriting"
          className="w-full px-4 py-3 rounded-xl border-2 border-food-green-200 focus:border-food-green-500 focus:ring-2 focus:ring-food-green-200 outline-none transition-all text-food-brown-800 font-medium"
        />
      </div>

      {/* Kunlik maqsadlar */}
      <div className="bg-gradient-to-br from-food-orange-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-orange-200">
        <h3 className="text-base font-bold text-food-brown-800 mb-4 flex items-center gap-2">
          <span>🎯</span> Kunlik maqsadlar
        </h3>

        <div className="space-y-4">
          {/* Kaloriya */}
          <div>
            <label className=" text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
              <span>🔥</span> Kaloriya (kkal)
            </label>
            <input
              type="number"
              value={localSettings.dailyCalorieGoal}
              onChange={(e) => handleChange("dailyCalorieGoal", e.target.value)}
              min="500"
              max="10000"
              className="w-full px-4 py-3 rounded-xl border-2 border-food-orange-200 focus:border-food-orange-500 focus:ring-2 focus:ring-food-orange-200 outline-none transition-all text-food-brown-800 font-bold text-lg"
            />
            <p className="text-xs text-food-brown-500 mt-1">
              Tavsiya: Erkaklar 2000-2500, Ayollar 1600-2000
            </p>
          </div>

          {/* Oqsil */}
          <div>
            <label className=" text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
              <span>🥩</span> Oqsil (g)
            </label>
            <input
              type="number"
              value={localSettings.dailyOqsilGoal}
              onChange={(e) => handleChange("dailyOqsilGoal", e.target.value)}
              min="20"
              max="500"
              className="w-full px-4 py-3 rounded-xl border-2 border-food-green-200 focus:border-food-green-500 focus:ring-2 focus:ring-food-green-200 outline-none transition-all text-food-brown-800 font-bold text-lg"
            />
            <p className="text-xs text-food-brown-500 mt-1">
              Tavsiya: Vazningiz (kg) × 0.8
            </p>
          </div>

          {/* Uglevodlar */}
          <div>
            <label className=" text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
              <span>🍞</span> Uglevodlar (g)
            </label>
            <input
              type="number"
              value={localSettings.dailyCarbsGoal}
              onChange={(e) => handleChange("dailyCarbsGoal", e.target.value)}
              min="50"
              max="1000"
              className="w-full px-4 py-3 rounded-xl border-2 border-food-yellow-200 focus:border-food-yellow-500 focus:ring-2 focus:ring-food-yellow-200 outline-none transition-all text-food-brown-800 font-bold text-lg"
            />
            <p className="text-xs text-food-brown-500 mt-1">
              Tavsiya: Kaloriyangizning 45-65%
            </p>
          </div>

          {/* Yog' */}
          <div>
            <label className=" text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
              <span>🧈</span> Yog' (g)
            </label>
            <input
              type="number"
              value={localSettings.dailyFatGoal}
              onChange={(e) => handleChange("dailyFatGoal", e.target.value)}
              min="20"
              max="300"
              className="w-full px-4 py-3 rounded-xl border-2 border-food-orange-200 focus:border-food-orange-500 focus:ring-2 focus:ring-food-orange-200 outline-none transition-all text-food-brown-800 font-bold text-lg"
            />
            <p className="text-xs text-food-brown-500 mt-1">
              Tavsiya: Kaloriyangizning 20-35%
            </p>
          </div>
        </div>
      </div>

      {/* Tana ma'lumotlari */}
      <div className="bg-gradient-to-br from-food-blue-50 to-food-green-50 rounded-2xl p-4 border-2 border-food-blue-200">
        <h3 className="text-base font-bold text-food-brown-800 mb-4 flex items-center gap-2">
          <span>📏</span> Tana ma'lumotlari (TDEE hisoblash uchun)
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Vazn */}
            <div>
              <label className="text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
                <span>⚖️</span> Vazn (kg)
              </label>
              <input
                type="number"
                value={localSettings.weight_kg || ""}
                onChange={(e) => handleChange("weight_kg", e.target.value)}
                placeholder="70"
                min="20"
                max="500"
                className="w-full px-4 py-3 rounded-xl border-2 border-food-blue-200 focus:border-food-blue-500 focus:ring-2 focus:ring-food-blue-200 outline-none transition-all text-food-brown-800 font-bold text-lg"
              />
            </div>

            {/* Bo'y */}
            <div>
              <label className="text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
                <span>📐</span> Bo'y (cm)
              </label>
              <input
                type="number"
                value={localSettings.height_cm || ""}
                onChange={(e) => handleChange("height_cm", e.target.value)}
                placeholder="175"
                min="50"
                max="300"
                className="w-full px-4 py-3 rounded-xl border-2 border-food-blue-200 focus:border-food-blue-500 focus:ring-2 focus:ring-food-blue-200 outline-none transition-all text-food-brown-800 font-bold text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Yosh */}
            <div>
              <label className="text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
                <span>🎂</span> Yosh
              </label>
              <input
                type="number"
                value={localSettings.age || ""}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="25"
                min="1"
                max="150"
                className="w-full px-4 py-3 rounded-xl border-2 border-food-blue-200 focus:border-food-blue-500 focus:ring-2 focus:ring-food-blue-200 outline-none transition-all text-food-brown-800 font-bold text-lg"
              />
            </div>

            {/* Jins */}
            <div>
              <label className="text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
                <span>👤</span> Jins
              </label>
              <select
                value={localSettings.gender || ""}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-food-blue-200 focus:border-food-blue-500 focus:ring-2 focus:ring-food-blue-200 outline-none transition-all text-food-brown-800 font-bold text-lg bg-white"
              >
                <option value="">Tanlang</option>
                <option value="male">Erkak</option>
                <option value="female">Ayol</option>
              </select>
            </div>
          </div>

          {/* Faoliyat darajasi */}
          <div>
            <label className="text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
              <span>🏃</span> Faoliyat darajasi
            </label>
            <select
              value={localSettings.activity_level || ""}
              onChange={(e) => handleChange("activity_level", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-food-blue-200 focus:border-food-blue-500 focus:ring-2 focus:ring-food-blue-200 outline-none transition-all text-food-brown-800 font-bold bg-white"
            >
              <option value="">Tanlang</option>
              <option value="sedentary">🪑 Kam harakatli (ofis ishi)</option>
              <option value="light">🚶 Yengil (1-3 kun/hafta)</option>
              <option value="moderate">🏃 O'rtacha (3-5 kun/hafta)</option>
              <option value="active">💪 Faol (6-7 kun/hafta)</option>
              <option value="very_active">🏋️ Juda faol (og'ir ish)</option>
            </select>
          </div>
        </div>
      </div>

      {/* BMR va TDEE natijasi */}
      {user?.bmr && user?.tdee && (
        <div className="bg-gradient-to-r from-food-green-100 to-food-blue-100 rounded-2xl p-4 border-2 border-food-green-300">
          <h3 className="text-base font-bold text-food-brown-800 mb-3 flex items-center gap-2">
            <span>⚡</span> Kunlik kaloriya sarfi
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🔥</div>
              <div className="font-extrabold text-food-orange-600 text-xl">
                {Math.round(user.bmr)}
              </div>
              <div className="text-xs text-food-brown-500">BMR (tinch holat)</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">⚡</div>
              <div className="font-extrabold text-food-green-600 text-xl">
                {Math.round(user.tdee)}
              </div>
              <div className="text-xs text-food-brown-500">TDEE (kunlik sarf)</div>
            </div>
          </div>
          
          <p className="text-xs text-food-brown-600 mt-3 text-center">
            💡 Vazn ushlab turish uchun kuniga ~{Math.round(user.tdee)} kkal yeng
          </p>
        </div>
      )}

      {/* Saqlash tugmasi */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:cursor-not-allowed ${
          saved
            ? "bg-gradient-to-r from-food-green-500 to-food-green-600"
            : "bg-gradient-to-r from-food-orange-500 to-food-orange-600 hover:from-food-orange-600 hover:to-food-orange-700 disabled:from-gray-400 disabled:to-gray-500"
        }`}
      >
        {saving ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Saqlanmoqda...</span>
          </>
        ) : saved ? (
          <>
            <span className="text-xl">✓</span>
            <span>Saqlandi!</span>
          </>
        ) : (
          <>
            <span className="text-xl">💾</span>
            <span>Saqlash</span>
          </>
        )}
      </button>

      {/* Ma'lumot */}
      <div className="bg-gradient-to-r from-food-green-100 to-food-yellow-100 border-2 border-food-green-300 rounded-2xl p-4">
        <p className="text-food-brown-700 font-medium text-sm flex items-start gap-2">
          <span className="text-lg">💡</span>
          <span>
            {isRegistered
              ? "Sozlamalar bulutda saqlanadi va barcha qurilmalaringizda sinxronlanadi."
              : "Ro'yxatdan o'ting va ma'lumotlaringiz barcha qurilmalarda sinxronlansin!"}
          </span>
        </p>
      </div>

      {/* Account info */}
      {user && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-food-green-100">
          <h3 className="text-base font-bold text-food-brown-800 mb-3 flex items-center gap-2">
            <span>👤</span> Hisob ma'lumotlari
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-food-green-100">
              <span className="text-food-brown-600">Hisob turi:</span>
              <span
                className={`font-bold ${
                  isRegistered ? "text-food-green-600" : "text-food-yellow-600"
                }`}
              >
                {isRegistered ? "✅ Ro'yxatdan o'tgan" : "👻 Anonim"}
              </span>
            </div>

            {user.email && (
              <div className="flex justify-between items-center py-2 border-b border-food-green-100">
                <span className="text-food-brown-600">Email:</span>
                <span className="font-medium text-food-brown-800">
                  {user.email}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-2">
              <span className="text-food-brown-600">ID:</span>
              <span className="font-mono text-xs text-food-brown-500">
                {user.id.slice(0, 8)}...
              </span>
            </div>
          </div>

          {/* Logout button for registered users */}
          {isRegistered && (
            <button
              onClick={logout}
              className="w-full mt-4 py-3 rounded-xl font-bold text-food-red-600 bg-food-red-50 hover:bg-food-red-100 border-2 border-food-red-200 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              <span>Chiqish</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;
