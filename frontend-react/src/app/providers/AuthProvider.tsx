import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../../services/authService';
import type { User, LoginCredentials } from '../../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials, remember?: boolean) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [token, setToken] = useState<string | null>(() => authService.getCurrentToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async (): Promise<User | null> => {
    try {
      const currentToken = authService.getCurrentToken();
      if (!currentToken) {
        setUser(null);
        setToken(null);
        return null;
      }
      const profile = await authService.getProfile();
      setUser(profile);
      setToken(authService.getCurrentToken());
      return profile;
    } catch {
      setUser(null);
      setToken(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials: LoginCredentials, remember = false): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials, remember);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
