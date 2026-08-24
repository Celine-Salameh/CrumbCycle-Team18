import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { apiClient } from "../lib/apiClient";

const STORAGE_KEY = "crumbcycle.auth";
const AuthContext = createContext(null);

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const persistSession = useCallback((payload) => {
    const nextSession = {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      user: payload.user,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return nextSession;
  }, []);

  const login = useCallback(
    async (credentials) => persistSession(await apiClient.post("/auth/login", credentials, { token: null })),
    [persistSession],
  );

  const signup = useCallback(
    async (details) => persistSession(await apiClient.post("/auth/register", details, { token: null })),
    [persistSession],
  );

  const googleSignup = useCallback(
    async (details) => persistSession(await apiClient.post("/auth/google", details, { token: null })),
    [persistSession],
  );

  const logout = useCallback(async () => {
    try {
      if (session?.accessToken) {
        await apiClient.post(
          "/auth/logout",
          { refresh_token: session.refreshToken },
          { token: session.accessToken },
        );
      }
    } catch {
      // A local sign-out must still complete if the API is temporarily unavailable.
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
    }
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      isAuthenticated: Boolean(session?.accessToken),
      login,
      signup,
      googleSignup,
      logout,
    }),
    [session, login, signup, googleSignup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}