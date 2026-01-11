import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRegistered: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  convertAnonymous: (
    email: string,
    password: string,
    name?: string
  ) => Promise<void>;
  logout: () => void;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  initAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "kaloriya_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveToken = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const handleAuthResponse = (response: AuthResponse) => {
    saveToken(response.access_token);
    setUser(response.user);
  };

  // Initialize authentication on app load
  const initAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);

      if (savedToken) {
        // Try to refresh/validate existing token
        try {
          const response = await refreshToken(savedToken);
          handleAuthResponse(response);
        } catch {
          // Token invalid, try to get current user
          try {
            const currentUser = await getCurrentUser(savedToken);
            setToken(savedToken);
            setUser(currentUser);
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
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email: string, password: string) => {
    const response = await loginUser(email, password);
    handleAuthResponse(response);
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await registerUser(email, password, name);
    handleAuthResponse(response);
  };

  const convertAnonymous = async (
    email: string,
    password: string,
    name?: string
  ) => {
    if (!token) throw new Error("Token mavjud emas");
    const response = await convertToRegistered(token, email, password, name);
    handleAuthResponse(response);
  };

  const logout = () => {
    clearAuth();
    // Create new anonymous user
    createAnonymousUser()
      .then(handleAuthResponse)
      .catch(console.error);
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
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
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isRegistered: user?.user_type === "registered",
        token,
        login,
        register,
        convertAnonymous,
        logout,
        updateSettings,
        initAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
