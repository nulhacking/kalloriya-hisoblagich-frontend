import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, AuthResponse, UserSettings } from "../types";
import {
  createAnonymousUser,
  loginUser,
  registerUser,
  convertToRegistered,
  getCurrentUser,
  updateUserSettings,
  refreshToken,
} from "../services/api";

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Computed getters
  isAuthenticated: boolean;
  isRegistered: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  handleAuthResponse: (response: AuthResponse) => void;
  clearAuth: () => void;

  // Async actions
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  convertAnonymous: (
    email: string,
    password: string,
    name?: string
  ) => Promise<void>;
  logout: () => void;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isLoading: true,
      isInitialized: false,

      // Computed (derived from state)
      get isAuthenticated() {
        return !!get().user;
      },
      get isRegistered() {
        return get().user?.user_type === "registered";
      },

      // Simple setters
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),

      // Handle auth response
      handleAuthResponse: (response) => {
        set({
          token: response.access_token,
          user: response.user,
        });
      },

      // Clear auth state
      clearAuth: () => {
        set({
          token: null,
          user: null,
        });
      },

      // Initialize auth
      initAuth: async () => {
        const { token, handleAuthResponse, clearAuth } = get();
        set({ isLoading: true });

        try {
          if (token) {
            // Try to refresh/validate existing token
            try {
              const response = await refreshToken(token);
              handleAuthResponse(response);
            } catch {
              // Token invalid, try to get current user
              try {
                const currentUser = await getCurrentUser(token);
                set({ user: currentUser });
              } catch {
                // Token completely invalid, create anonymous user
                clearAuth();
                const response = await createAnonymousUser();
                handleAuthResponse(response);
              }
            }
          } else {
            // No token, create anonymous user
            const response = await createAnonymousUser();
            handleAuthResponse(response);
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          // Create anonymous user as fallback
          try {
            const response = await createAnonymousUser();
            handleAuthResponse(response);
          } catch {
            console.error("Failed to create anonymous user");
          }
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      // Login
      login: async (email, password) => {
        const response = await loginUser(email, password);
        get().handleAuthResponse(response);
      },

      // Register
      register: async (email, password, name) => {
        const response = await registerUser(email, password, name);
        get().handleAuthResponse(response);
      },

      // Convert anonymous to registered
      convertAnonymous: async (email, password, name) => {
        const { token, handleAuthResponse } = get();
        if (!token) throw new Error("Token mavjud emas");
        const response = await convertToRegistered(token, email, password, name);
        handleAuthResponse(response);
      },

      // Logout
      logout: () => {
        get().clearAuth();
        // Create new anonymous user
        createAnonymousUser()
          .then((response) => get().handleAuthResponse(response))
          .catch(console.error);
      },

      // Update settings
      updateSettings: async (settings) => {
        const { token } = get();
        if (!token) throw new Error("Token mavjud emas");

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

        const updatedUser = await updateUserSettings(token, backendSettings);
        set({ user: updatedUser });
      },
    }),
    {
      name: "kaloriya-auth",
      storage: createJSONStorage(() => localStorage),
      // Only persist token - user will be fetched on init
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useToken = () => useAuthStore((state) => state.token);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
export const useIsRegistered = () =>
  useAuthStore((state) => state.user?.user_type === "registered");
