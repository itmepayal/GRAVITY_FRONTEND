import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

type AuthStore = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: User) => void;
  setAuthInitialized: (value: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAuthInitialized: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      updateTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      updateUser: (user) =>
        set({
          user,
        }),

      setAuthInitialized: (value) =>
        set({
          isAuthInitialized: value,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
