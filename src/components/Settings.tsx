import { useState, useEffect, useMemo } from "react";
import type { UserSettings, GoalType } from "../types";
import { useAuthStore, useIsRegistered, useToken, useUser } from "../stores";
import { useToast } from "./Toast";
import GoalPicker, { type GoalDraft } from "./GoalPicker";
import ReminderSettings, { type ReminderDraft } from "./ReminderSettings";
import { useSetupGoal } from "../hooks/useGoal";
import { updateUserSettings } from "../services/api";

// Faoliyat darajasi koeffitsiyentlari (backend bilan bir xil)
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** BMR va TDEE hisoblash (Mifflin-St Jeor) */
function calcBmrTdee(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female",
  activityLevel: string
): { bmr: number; tdee: number } | null {
  if (!weight || !height || !age || !gender) return null;
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  const mult = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
  return { bmr, tdee: bmr * mult };
}

interface SettingsProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onNavigateToAuth?: () => void;
}

const Settings = ({ settings, onSaveSettings, onNavigateToAuth }: SettingsProps) => {
  const isRegistered = useIsRegistered();
  const user = useUser();
  const token = useToken();
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const toast = useToast();
  const setupGoal = useSetupGoal();

  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Goal draft (controlled GoalPicker)
  const [goalDraft, setGoalDraft] = useState<GoalDraft>({
    goal_type: (user?.goal_type as GoalType) || "maintain",
    target_weight_kg: user?.target_weight_kg ?? null,
    weekly_pace_kg: user?.weekly_pace_kg ?? 0.5,
  });

  // Reminder draft (controlled ReminderSettings)
  const [reminderDraft, setReminderDraft] = useState<ReminderDraft>({
    enabled: user?.reminder_enabled ?? true,
    morning: user?.reminder_morning || "08:00",
    evening: user?.reminder_evening || "20:00",
  });

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Sync drafts when user updates from elsewhere
  useEffect(() => {
    if (user) {
      setGoalDraft({
        goal_type: (user.goal_type as GoalType) || "maintain",
        target_weight_kg: user.target_weight_kg ?? null,
        weekly_pace_kg: user.weekly_pace_kg ?? 0.5,
      });
      setReminderDraft({
        enabled: user.reminder_enabled ?? true,
        morning: user.reminder_morning || "08:00",
        evening: user.reminder_evening || "20:00",
      });
    }
  }, [user?.goal_type, user?.target_weight_kg, user?.weekly_pace_kg, user?.reminder_enabled, user?.reminder_morning, user?.reminder_evening]);

  // Faoliyat darajasi tanlanganda kaloriya sarfini hisoblash (preview yoki saqlangan)
  const tdeeData = useMemo(() => {
    const w = localSettings.weight_kg;
    const h = localSettings.height_cm;
    const a = localSettings.age;
    const g = localSettings.gender;
    const act = localSettings.activity_level;
    // Tana ma'lumotlari + faoliyat darajasi to'liq bo'lsa — client-side hisoblash
    if (w && h && a && g && act) {
      const calc = calcBmrTdee(w, h, a, g, act);
      if (calc) return { ...calc, isPreview: true };
    }
    // Saqlangan qiymatlar (backend dan)
    if (user?.bmr != null && user?.tdee != null) {
      return { bmr: user.bmr, tdee: user.tdee, isPreview: false };
    }
    return null;
  }, [localSettings.weight_kg, localSettings.height_cm, localSettings.age, localSettings.gender, localSettings.activity_level, user?.bmr, user?.tdee]);

  const hasGoal = !!user?.goal_type;
  const bodyMetricsReady = !!(
    localSettings.weight_kg &&
    localSettings.height_cm &&
    localSettings.age &&
    localSettings.gender &&
    localSettings.activity_level
  );

  const goalChanged = (() => {
    if (!user) return goalDraft.goal_type !== "maintain";
    return (
      goalDraft.goal_type !== (user.goal_type || "maintain") ||
      goalDraft.target_weight_kg !== (user.target_weight_kg ?? null) ||
      goalDraft.weekly_pace_kg !== (user.weekly_pace_kg ?? 0.5)
    );
  })();

  const handleSave = async () => {
    if (!token) {
      toast.error("Avval tizimga kiring");
      return;
    }
    setSaving(true);
    try {
      // 1) Update name + body metrics + manual macros + reminder fields in one call
      const updatedUser = await updateUserSettings(token, {
        name: localSettings.name,
        daily_calorie_goal: localSettings.dailyCalorieGoal,
        daily_protein_goal: localSettings.dailyOqsilGoal,
        daily_carbs_goal: localSettings.dailyCarbsGoal,
        daily_fat_goal: localSettings.dailyFatGoal,
        weight_kg: localSettings.weight_kg,
        height_cm: localSettings.height_cm,
        age: localSettings.age,
        gender: localSettings.gender,
        activity_level: localSettings.activity_level,
        reminder_enabled: reminderDraft.enabled,
        reminder_morning: reminderDraft.morning,
        reminder_evening: reminderDraft.evening,
      });
      setUser(updatedUser);

      // 2) Save goal if user picked one (or changed it) and body metrics are ready
      if (goalChanged && bodyMetricsReady) {
        await setupGoal.mutateAsync({
          goal_type: goalDraft.goal_type,
          target_weight_kg: goalDraft.target_weight_kg,
          weekly_pace_kg:
            goalDraft.goal_type === "maintain" ? 0 : goalDraft.weekly_pace_kg,
          target_date: null,
        });
      } else if (goalChanged && !bodyMetricsReady) {
        toast.error("Maqsad uchun avval ma'lumotlaringizni to'ldiring");
      }

      setSaved(true);
      toast.success("Saqlandi ✅");
      // Notify legacy onSaveSettings (mostly for old screens still using it)
      try {
        await onSaveSettings(localSettings);
      } catch { /* ignored — main update already succeeded */ }
      if (window.Telegram?.WebApp) {
        // @ts-expect-error — HapticFeedback may not be typed
        window.Telegram.WebApp.HapticFeedback?.impactOccurred?.("light");
      }
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Saqlashda xatolik:", error);
      toast.error("Saqlashda xatolik");
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
          : field === "activity_level" && value === ""
            ? undefined
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

      {/* Kunlik maqsadlar — agar maqsad qo'yilgan bo'lsa, kart sifatida ko'rinadi (read-only),
          aks holda manual kiritish formasi */}
      {hasGoal ? (
        <div className="bg-gradient-to-br from-food-green-100 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-green-200">
          <h3 className="text-base font-bold text-food-brown-800 mb-3 flex items-center gap-2">
            <span>🎯</span> Kunlik target
            <span className="ml-auto text-[10px] font-bold bg-food-green-200 text-food-green-800 px-2 py-0.5 rounded-full">
              Avtomatik
            </span>
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white rounded-xl p-2">
              <div className="text-[10px] text-food-brown-500">Kaloriya</div>
              <div className="font-extrabold text-food-orange-600">
                {user?.daily_calorie_goal}
              </div>
              <div className="text-[10px] text-food-brown-500">kkal</div>
            </div>
            <div className="bg-white rounded-xl p-2">
              <div className="text-[10px] text-food-brown-500">🥩 Oqsil</div>
              <div className="font-extrabold text-food-green-600">
                {user?.daily_protein_goal}
              </div>
              <div className="text-[10px] text-food-brown-500">g</div>
            </div>
            <div className="bg-white rounded-xl p-2">
              <div className="text-[10px] text-food-brown-500">🍞 Uglevod</div>
              <div className="font-extrabold text-food-yellow-600">
                {user?.daily_carbs_goal}
              </div>
              <div className="text-[10px] text-food-brown-500">g</div>
            </div>
            <div className="bg-white rounded-xl p-2">
              <div className="text-[10px] text-food-brown-500">🧈 Yog'</div>
              <div className="font-extrabold text-food-orange-700">
                {user?.daily_fat_goal}
              </div>
              <div className="text-[10px] text-food-brown-500">g</div>
            </div>
          </div>
          <p className="text-[11px] text-food-brown-600 mt-3 text-center">
            💡 Maqsadingizga ko'ra hisoblangan. O'zgartirish uchun maqsadingizni qayta tanlang.
          </p>
        </div>
      ) : (
      <div className="bg-gradient-to-br from-food-orange-50 to-food-yellow-50 rounded-2xl p-4 border-2 border-food-orange-200">
        <h3 className="text-base font-bold text-food-brown-800 mb-4 flex items-center gap-2">
          <span>🎯</span> Kunlik maqsadlar (qo'lda)
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
      )}

      {/* Sizning ma'lumotlaringiz */}
      <div className="bg-gradient-to-br from-food-blue-50 to-food-green-50 rounded-2xl p-4 border-2 border-food-blue-200">
        <h3 className="text-base font-bold text-food-brown-800 mb-4 flex items-center gap-2">
          <span>📏</span> Sizning ma'lumotlaringiz
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

      {/* Kunlik kaloriya sarfi — faoliyat darajasi tanlanganda yoki saqlangan */}
      {tdeeData && (
        <div className="bg-gradient-to-r from-food-green-100 to-food-blue-100 rounded-2xl p-4 border-2 border-food-green-300">
          <h3 className="text-base font-bold text-food-brown-800 mb-3 flex items-center gap-2">
            <span>⚡</span> Kunlik kaloriya sarfi
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">😴</div>
              <div className="font-extrabold text-food-orange-600 text-xl">
                {Math.round(tdeeData.bmr)}
              </div>
              <div className="text-xs text-food-brown-500">Tinch holatda</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">⚡</div>
              <div className="font-extrabold text-food-green-600 text-xl">
                {Math.round(tdeeData.tdee)}
              </div>
              <div className="text-xs text-food-brown-500">Faollik bilan</div>
            </div>
          </div>

          {!hasGoal && (
            <p className="text-xs text-food-brown-600 mt-3 text-center">
              💡 Vaznni saqlab turish uchun kuniga ~{Math.round(tdeeData.tdee)} kkal
            </p>
          )}
        </div>
      )}

      {/* Maqsad (Weight coach) */}
      <GoalPicker
        value={goalDraft}
        onChange={setGoalDraft}
        currentWeightKg={localSettings.weight_kg}
      />

      {/* Eslatmalar */}
      <ReminderSettings value={reminderDraft} onChange={setReminderDraft} />

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
