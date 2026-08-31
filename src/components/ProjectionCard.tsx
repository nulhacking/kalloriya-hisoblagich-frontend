import { useGoalSummary } from "../hooks/useGoal";
import { useUser } from "../stores";

function formatLongDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const ProjectionCard = () => {
  const user = useUser();
  const { data } = useGoalSummary(!!user?.bmr && !!user?.tdee);

  if (!data || !user?.goal_type || user.goal_type === "maintain") {
    return null;
  }

  const projected = data.projected_goal_date;
  const target = data.target_weight_kg;
  const current = data.current_weight_kg ?? user.weight_kg;

  if (!target || !current) return null;

  const diff = target - current;
  const diffStr = `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg`;
  const losing = user.goal_type === "lose";

  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-200">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{losing ? "🏃" : "💪"}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Prognoz
          </div>
          <div className="text-base font-semibold text-stone-900 mt-0.5">
            {projected ? (
              <>
                <span className="text-emerald-700">{formatLongDate(projected)}</span> sanasida
              </>
            ) : (
              "Vazn yozuvi to'planganda prognoz hisoblanadi"
            )}
          </div>
          <div className="text-sm text-stone-700 mt-1">
            <b>{current} kg</b> → <b>{target} kg</b>
            <span className={`ml-2 font-semibold ${losing ? "text-emerald-700" : "text-amber-700"}`}>
              ({diffStr})
            </span>
          </div>
          {data.target.delta_kcal !== 0 && (
            <div className="text-xs text-stone-600 mt-1">
              Kunlik {data.target.delta_kcal < 0 ? "deficit" : "surplus"}:{" "}
              <b>{Math.abs(data.target.delta_kcal)} kkal</b>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectionCard;
