import { createContext, useEffect, useState } from "react";

import { getCurrentUser } from "../api/auth";
import { clearAuthTokens, getAccessToken, saveAuthTokens } from "../utils/storage";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const savedToken = await getAccessToken();
        if (!savedToken) {
          setLoading(false);
          return;
        }

        setToken(savedToken);
        const userData = await getCurrentUser(savedToken);
        setUser(userData);
      } catch (error) {
        await clearAuthTokens();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (accessToken, refreshToken, userData) => {
    await saveAuthTokens(accessToken, refreshToken);
    setToken(accessToken);
    try {
      setUser(await getCurrentUser(accessToken));
    } catch {
      setUser(userData || null);
    }
  };

  const logout = async () => {
    await clearAuthTokens();
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
