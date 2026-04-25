import { useEffect, useState } from "react";
import { useUser, useToken, useAuthStore } from "../stores";
import { updateUserSettings } from "../services/api";
import { useToast } from "./Toast";

const ReminderSettings = () => {
  const user = useUser();
  const token = useToken();
  const setUser = useAuthStore((s) => s.setUser);
  const toast = useToast();

  const [enabled, setEnabled] = useState<boolean>(user?.reminder_enabled ?? true);
  const [morning, setMorning] = useState<string>(user?.reminder_morning || "08:00");
  const [evening, setEvening] = useState<string>(user?.reminder_evening || "20:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEnabled(user.reminder_enabled ?? true);
      setMorning(user.reminder_morning || "08:00");
      setEvening(user.reminder_evening || "20:00");
    }
  }, [user?.reminder_enabled, user?.reminder_morning, user?.reminder_evening]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const updated = await updateUserSettings(token, {
        reminder_enabled: enabled,
        reminder_morning: morning,
        reminder_evening: evening,
      });
      setUser(updated);
      toast.success("Eslatmalar saqlandi 🔔");
    } catch (err) {
      console.error(err);
      toast.error("Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-food-yellow-50 to-food-orange-50 rounded-2xl p-4 border-2 border-food-yellow-200 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-food-brown-800 flex items-center gap-2">
            <span>🔔</span> Eslatmalar
          </h3>
          <p className="text-xs text-food-brown-600 mt-1">
            Telegram orqali kunlik vazn va progress xabarlari
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-food-brown-200 rounded-full peer peer-checked:bg-food-green-500 peer-focus:ring-2 peer-focus:ring-food-green-200 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5" />
        </label>
      </div>

      {enabled && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
              <span>🌅</span> Ertalab
            </label>
            <input
              type="time"
              value={morning}
              onChange={(e) => setMorning(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-food-yellow-200 focus:border-food-yellow-500 focus:ring-2 focus:ring-food-yellow-200 outline-none text-food-brown-800 font-bold bg-white"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
              <span>🌆</span> Kechqurun
            </label>
            <input
              type="time"
              value={evening}
              onChange={(e) => setEvening(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-food-orange-200 focus:border-food-orange-500 focus:ring-2 focus:ring-food-orange-200 outline-none text-food-brown-800 font-bold bg-white"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-food-yellow-500 to-food-orange-500 hover:from-food-yellow-600 hover:to-food-orange-600 disabled:from-gray-400 disabled:to-gray-500 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Saqlanmoqda...</span>
          </>
        ) : (
          <>
            <span>🔔</span>
            <span>Eslatmalarni saqlash</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ReminderSettings;
