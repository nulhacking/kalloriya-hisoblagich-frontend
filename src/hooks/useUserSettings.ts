import { useMutation } from "@tanstack/react-query";
import { useAuthStore, useToken } from "../stores";
import { updateUserSettings } from "../services/api";
import type { UserSettings, User } from "../types";

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

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

// Update user settings mutation with optimistic update
export const useUpdateUserSettings = () => {
  const token = useToken();
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      if (!token) throw new Error("Token mavjud emas");

      // Convert frontend settings to backend format
      const backendSettings: Record<string, unknown> = {};
      if (settings.name !== undefined) backendSettings.name = settings.name;
      if (settings.dailyCalorieGoal !== undefined)
        backendSettings.daily_calorie_goal = settings.dailyCalorieGoal;
      if (settings.dailyOqsilGoal !== undefined)
        backendSettings.daily_protein_goal = settings.dailyOqsilGoal;
      if (settings.dailyCarbsGoal !== undefined)
        backendSettings.daily_carbs_goal = settings.dailyCarbsGoal;
      if (settings.dailyFatGoal !== undefined)
        backendSettings.daily_fat_goal = settings.dailyFatGoal;
      if (settings.weight_kg !== undefined)
        backendSettings.weight_kg = settings.weight_kg;
      if (settings.height_cm !== undefined)
        backendSettings.height_cm = settings.height_cm;
      if (settings.age !== undefined)
        backendSettings.age = settings.age;
      if (settings.gender !== undefined)
        backendSettings.gender = settings.gender;
      if (settings.activity_level != null)
        backendSettings.activity_level = settings.activity_level;

      return updateUserSettings(token, backendSettings);
    },
    // Optimistic update
    onMutate: async (newSettings) => {
      // Snapshot the previous user
      const previousUser = currentUser;

      // Optimistically update the user in store
      if (currentUser) {
        const w = newSettings.weight_kg ?? currentUser.weight_kg;
        const h = newSettings.height_cm ?? currentUser.height_cm;
        const a = newSettings.age ?? currentUser.age;
        const g = (newSettings.gender ?? currentUser.gender) as "male" | "female" | undefined;
        const act = newSettings.activity_level ?? currentUser.activity_level ?? "moderate";

        const updatedUser: User = {
          ...currentUser,
          name: newSettings.name !== undefined ? newSettings.name : currentUser.name,
          daily_calorie_goal: newSettings.dailyCalorieGoal !== undefined 
            ? newSettings.dailyCalorieGoal 
            : currentUser.daily_calorie_goal,
          daily_protein_goal: newSettings.dailyOqsilGoal !== undefined
            ? newSettings.dailyOqsilGoal
            : currentUser.daily_protein_goal,
          daily_carbs_goal: newSettings.dailyCarbsGoal !== undefined
            ? newSettings.dailyCarbsGoal
            : currentUser.daily_carbs_goal,
          daily_fat_goal: newSettings.dailyFatGoal !== undefined
            ? newSettings.dailyFatGoal
            : currentUser.daily_fat_goal,
          weight_kg: w,
          height_cm: h,
          age: a,
          gender: g,
          activity_level:
            newSettings.activity_level != null
              ? newSettings.activity_level
              : currentUser.activity_level,
        };

        // Faoliyat darajasi tanlanganda BMR/TDEE ni optimistik hisoblash
        if (w && h && a && g) {
          const calc = calcBmrTdee(w, h, a, g, act);
          if (calc) {
            updatedUser.bmr = Math.round(calc.bmr * 10) / 10;
            updatedUser.tdee = Math.round(calc.tdee * 10) / 10;
          }
        }

        setUser(updatedUser);
      }

      // Return context with the previous value
      return { previousUser };
    },
    // If mutation fails, roll back
    onError: (_err, _newSettings, context) => {
      if (context?.previousUser) {
        setUser(context.previousUser);
      }
    },
    // On success, update with server response
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    },
  });
};
