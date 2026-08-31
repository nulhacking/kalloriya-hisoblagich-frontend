import { useState } from "react";
import { useUser } from "../stores";
import { useLogWeight } from "../hooks/useWeight";
import { useToast } from "./Toast";

const WeightLogCard = () => {
  const user = useUser();
  const logWeight = useLogWeight();
  const toast = useToast();
  const [value, setValue] = useState<string>("");

  const handleSave = async () => {
    const w = Number(value);
    if (!w || w < 20 || w > 500) {
      toast.error("20-500 oralig'ida vazn kiriting");
      return;
    }
    try {
      await logWeight.mutateAsync({ weight_kg: w });
      setValue("");
      toast.success("Vazn saqlandi ⚖️");
      if (window.Telegram?.WebApp) {
        // @ts-expect-error — HapticFeedback may not be typed
        window.Telegram.WebApp.HapticFeedback?.impactOccurred?.("light");
      }
    } catch (err) {
      console.error(err);
      toast.error("Saqlashda xatolik");
    }
  };

  const current = user?.weight_kg;
  const target = user?.target_weight_kg;
  const diff = current && target ? +(current - target).toFixed(1) : null;
  const losing = user?.goal_type === "lose";

  return (
    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            Bugungi vazn
          </h3>
          {current && (
            <div className="text-xs text-stone-600 mt-0.5">
              Oxirgi: <span className="font-semibold">{current} kg</span>
              {target && diff !== null && (
                <>
                  {" "}• Maqsad: <span className="font-semibold">{target} kg</span>
                  {" "}<span className={losing ? "text-emerald-700" : "text-amber-700"}>
                    ({diff > 0 ? "+" : ""}{diff} kg)
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={current ? `${current}` : "Masalan: 70.5"}
          step={0.1}
          min={20}
          max={500}
          className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-200 outline-none transition-all text-stone-900 font-semibold text-lg bg-white"
        />
        <button
          onClick={handleSave}
          disabled={logWeight.isPending || !value}
          className="px-5 rounded-xl font-semibold text-white bg-stone-900 shadow-sm active:scale-95 transition-all flex items-center gap-1"
        >
          {logWeight.isPending ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>💾</span>
              <span className="text-sm">Saqlash</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WeightLogCard;
