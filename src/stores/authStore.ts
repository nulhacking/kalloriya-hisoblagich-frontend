import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, AuthResponse, UserSettings } from "../types";
import {
  loginUser,
  registerUser,
  convertToRegistered,
  getCurrentUser,
  updateUserSettings,
  refreshToken,
  telegramAuth,
  linkTelegramAccount,
} from "../services/api";

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  isTelegramMiniApp: boolean;

  // Computed getters
  isAuthenticated: boolean;
  isRegistered: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  handleAuthResponse: (response: AuthResponse) => void;
  clearAuth: () => void;
  setIsTelegramMiniApp: (value: boolean) => void;

  // Async actions
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  convertAnonymous: (
    email: string,
    password: string,
    name?: string
  ) => Promise<void>;
  loginWithTelegram: (initData: string) => Promise<void>;
  linkTelegram: (initData: string) => Promise<void>;
  logout: () => void;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

// Helper to check if running in Telegram Mini App
const checkIsTelegramMiniApp = (): boolean => {
  return !!(
    typeof window !== "undefined" &&
    window.Telegram?.WebApp?.initData &&
    window.Telegram.WebApp.initData.length > 0
  );
};

// Helper to get Telegram init data
const getTelegramInitData = (): string | null => {
  if (typeof window !== "undefined" && window.Telegram?.WebApp?.initData) {
    return window.Telegram.WebApp.initData;
  }
  return null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isLoading: true,
      isInitialized: false,
      isTelegramMiniApp: false,

      // Computed (derived from state)
      get isAuthenticated() {
        return !!get().user;
      },
      get isRegistered() {
        const userType = get().user?.user_type;
        return userType === "registered" || userType === "telegram";
      },

      // Simple setters
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setIsTelegramMiniApp: (value) => set({ isTelegramMiniApp: value }),

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
        // Always get fresh state from store, not from closure
        const { handleAuthResponse, clearAuth, setIsTelegramMiniApp } = get();
        set({ isLoading: true });

        // Check if running in Telegram Mini App
        const isTelegram = checkIsTelegramMiniApp();
        setIsTelegramMiniApp(isTelegram);

        try {
          // If in Telegram Mini App, try to auto-authenticate
          if (isTelegram) {
            const initData = getTelegramInitData();
            if (initData) {
              try {
                // Expand the Mini App
                window.Telegram?.WebApp?.expand();
                window.Telegram?.WebApp?.ready();
                
                const response = await telegramAuth(initData);
                handleAuthResponse(response);
                set({ isLoading: false, isInitialized: true });
                return;
              } catch (error) {
                console.error("Telegram auto-auth failed:", error);
                // Fall through to normal auth flow
              }
            }
          }

          // Get fresh token and user from store (after persist middleware has loaded)
          const currentToken = get().token;

          if (currentToken) {
            // We have a token - validate it
            try {
              // Try to refresh token first
              const response = await refreshToken(currentToken);
              handleAuthResponse(response);
            } catch (refreshError) {
              // Refresh failed, try to get user with existing token
              try {
                const fetchedUser = await getCurrentUser(currentToken);
                // Token is valid, update user
                set({ user: fetchedUser });
              } catch (getUserError) {
                // Token is completely invalid - clear auth
                clearAuth();
                console.warn("Token expired, please login again");
              }
            }
          } else {
            // No token - user needs to login
            clearAuth();
          }
        } catch (error: any) {
          console.error("Auth initialization error:", error);

          // Check for 401 (Unauthorized) or 403 (Forbidden) errors
          // Only clear auth if the token is explicitly rejected by the server
          if (error?.status === 401 || error?.status === 403) {
            clearAuth();
            console.warn("Token expired/invalid, please login again");
          } else {
             // For other errors (Network Error, 500, etc.), KEEP the current state.
             // This ensures users don't get logged out if the server is down or internet is flaky.
             console.warn("Auth check failed but keeping session (network/server error)");
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

      // Login with Telegram
      loginWithTelegram: async (initData) => {
        const response = await telegramAuth(initData);
        get().handleAuthResponse(response);
      },

      // Link Telegram to existing account
      linkTelegram: async (initData) => {
        const { token, handleAuthResponse } = get();
        if (!token) throw new Error("Token mavjud emas");
        const response = await linkTelegramAccount(token, initData);
        handleAuthResponse(response);
      },

      // Logout
      logout: () => {
        get().clearAuth();
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
      // Call initAuth after localStorage data is loaded
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating auth state:", error);
          return;
        }
        // After rehydration, initialize auth if not already initialized
        // Use setTimeout to ensure state is fully set
        if (state && !state.isInitialized) {
          setTimeout(() => {
            state.initAuth().catch((err) => {
              console.error("Error initializing auth:", err);
            });
          }, 0);
        }
      },
    }
  )
);

// Selector hooks for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useToken = () => useAuthStore((state) => state.token);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
export const useIsRegistered = () =>
  useAuthStore((state) => {
    const userType = state.user?.user_type;
    return userType === "registered" || userType === "telegram";
  });
export const useIsTelegramMiniApp = () =>
  useAuthStore((state) => state.isTelegramMiniApp);
