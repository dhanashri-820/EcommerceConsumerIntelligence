import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  LoginPayload, 
  RegisterPayload, 
  loginUser, 
  registerUser, 
  logoutUser, 
  fetchCurrentUser 
} from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await fetchCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Check local fallback session if offline
          const cached = localStorage.getItem('auth_user');
          if (cached) {
            setUser(JSON.parse(cached));
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (payload: LoginPayload) => {
    const res = await loginUser(payload);
    setUser(res.user);
    localStorage.setItem('auth_user', JSON.stringify(res.user));
  };

  const register = async (payload: RegisterPayload) => {
    const res = await registerUser(payload);
    setUser(res.user);
    localStorage.setItem('auth_user', JSON.stringify(res.user));
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
