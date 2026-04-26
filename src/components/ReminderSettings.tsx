export interface ReminderDraft {
  enabled: boolean;
  morning: string;
  evening: string;
}

interface ReminderSettingsProps {
  value: ReminderDraft;
  onChange: (next: ReminderDraft) => void;
}

const ReminderSettings = ({ value, onChange }: ReminderSettingsProps) => {
  return (
    <div className="bg-gradient-to-br from-food-yellow-50 to-food-orange-50 rounded-2xl p-4 border-2 border-food-yellow-200 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-food-brown-800 flex items-center gap-2">
            <span>🔔</span> Eslatmalar
          </h3>
          <p className="text-xs text-food-brown-600 mt-1">
            Bot sizga vazn va progress haqida eslatadi
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-food-brown-200 rounded-full peer peer-checked:bg-food-green-500 peer-focus:ring-2 peer-focus:ring-food-green-200 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5" />
        </label>
      </div>

      {value.enabled && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
              <span>🌅</span> Ertalab
            </label>
            <input
              type="time"
              value={value.morning}
              onChange={(e) => onChange({ ...value, morning: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-food-yellow-200 focus:border-food-yellow-500 focus:ring-2 focus:ring-food-yellow-200 outline-none text-food-brown-800 font-bold bg-white"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-food-brown-700 mb-1.5 flex items-center gap-2">
              <span>🌆</span> Kechqurun
            </label>
            <input
              type="time"
              value={value.evening}
              onChange={(e) => onChange({ ...value, evening: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-food-orange-200 focus:border-food-orange-500 focus:ring-2 focus:ring-food-orange-200 outline-none text-food-brown-800 font-bold bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderSettings;
