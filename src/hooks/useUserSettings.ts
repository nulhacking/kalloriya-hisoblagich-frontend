import { useMutation } from "@tanstack/react-query";
import { useAuthStore, useToken } from "../stores";
import { updateUserSettings } from "../services/api";
import type { UserSettings, User } from "../types";

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
      if (settings.activity_level !== undefined)
        backendSettings.activity_level = settings.activity_level;

      return updateUserSettings(token, backendSettings);
    },
    // Optimistic update
    onMutate: async (newSettings) => {
      // Snapshot the previous user
      const previousUser = currentUser;

      // Optimistically update the user in store
      if (currentUser) {
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
          weight_kg: newSettings.weight_kg !== undefined
            ? newSettings.weight_kg
            : currentUser.weight_kg,
          height_cm: newSettings.height_cm !== undefined
            ? newSettings.height_cm
            : currentUser.height_cm,
          age: newSettings.age !== undefined
            ? newSettings.age
            : currentUser.age,
          gender: newSettings.gender !== undefined
            ? newSettings.gender
            : currentUser.gender,
          activity_level: newSettings.activity_level !== undefined
            ? newSettings.activity_level
            : currentUser.activity_level,
        };

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
