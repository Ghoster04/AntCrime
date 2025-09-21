import { useState, useEffect, createContext, useContext } from 'react';
import { anticrimeAPI, type BackendAdmin } from '@/services/anticrimeAPI';

interface AuthContextType {
  user: BackendAdmin | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<BackendAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await anticrimeAPI.auth.login({ email, senha });
      
      // Salvar token
      localStorage.setItem('anticrime_token', response.access_token);
      
      // Obter dados do usuário
      const userData = await anticrimeAPI.auth.getMe();
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('anticrime_token');
    setUser(null);
    window.location.href = '/login';
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('anticrime_token');
    if (token) {
      try {
        const userData = await anticrimeAPI.auth.getMe();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('anticrime_token');
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };
};
