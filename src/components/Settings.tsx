import { useState } from "react";
import type { UserSettings } from "../types";

interface SettingsProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

const Settings = ({ settings, onSaveSettings }: SettingsProps) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (field: keyof UserSettings, value: string | number) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]:
        typeof value === "string" && field !== "name"
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

      {/* Saqlash tugmasi */}
      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
          saved
            ? "bg-gradient-to-r from-food-green-500 to-food-green-600"
            : "bg-gradient-to-r from-food-orange-500 to-food-orange-600 hover:from-food-orange-600 hover:to-food-orange-700"
        }`}
      >
        {saved ? (
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
            Sozlamalar qurilmangizda saqlanadi. Ilovani qayta o'rnatganingizda
            ma'lumotlar o'chib ketishi mumkin.
          </span>
        </p>
      </div>
    </div>
  );
};

export default Settings;
