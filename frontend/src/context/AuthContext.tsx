import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: { name: string; email: string; password: string }) => Promise<void>;
  guestLogin: (credentials: { email: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (token: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setError(null);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        credentials
      );
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const register = async (credentials: { name: string; email: string; password: string }) => {
    try {
      setError(null);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        credentials
      );
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const guestLogin = async (credentials: { email: string }) => {
    try {
      setError(null);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/guest-login`,
        credentials
      );
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Guest login failed';
      // If the email is registered with a regular account, suggest logging in
      if (errorMessage.includes('registered with a regular account')) {
        setError('This email is already registered. Please login to your account instead.');
      } else {
        setError(errorMessage);
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        token,
        login,
        register,
        guestLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 