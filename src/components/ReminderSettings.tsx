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
    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            Eslatmalar
          </h3>
          <p className="text-xs text-stone-600 mt-1">
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
          <div className="w-11 h-6 bg-stone-100 rounded-full peer peer-checked:bg-emerald-600 peer-focus:ring-2 peer-focus:ring-stone-200 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5" />
        </label>
      </div>

      {value.enabled && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-1.5 flex items-center gap-2">
              Ertalab
            </label>
            <input
              type="time"
              value={value.morning}
              onChange={(e) => onChange({ ...value, morning: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-amber-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-200 outline-none text-stone-900 font-semibold bg-white"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-1.5 flex items-center gap-2">
              Kechqurun
            </label>
            <input
              type="time"
              value={value.evening}
              onChange={(e) => onChange({ ...value, evening: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-amber-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-200 outline-none text-stone-900 font-semibold bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderSettings;
