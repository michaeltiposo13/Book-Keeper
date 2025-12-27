import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../lib/api';

interface User {
  id: string;
  borrower_id?: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user and token on mount, verify with API
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('library_user');
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedUser && storedToken) {
        try {
          // Verify token is still valid by fetching user info
          const response = await authAPI.me();
          if (response.success && response.data) {
            const userData = response.data;
            const mappedUser: User = {
              id: userData.borrower_id?.toString() || userData.id?.toString() || '',
              borrower_id: userData.borrower_id,
              name: userData.name,
              email: userData.email,
              role: userData.role || 'Member', // Use role from backend
            };
            setUser(mappedUser);
            localStorage.setItem('library_user', JSON.stringify(mappedUser));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('library_user');
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          // Token invalid or expired, clear storage
          localStorage.removeItem('library_user');
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        const { borrower, token } = response.data;
        
        // Store token
        localStorage.setItem('auth_token', token);
        
        // Map borrower to user format
        const mappedUser: User = {
          id: borrower.borrower_id?.toString() || borrower.id?.toString() || '',
          borrower_id: borrower.borrower_id,
          name: borrower.name,
          email: borrower.email,
          role: borrower.role || 'Member', // Use role from backend
        };
        
        setUser(mappedUser);
        localStorage.setItem('library_user', JSON.stringify(mappedUser));
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await authAPI.register({
        name,
        email,
        password,
        password_confirmation: password,
        joined_date: today,
      });

      if (response.success && response.data) {
        const { borrower, token } = response.data;
        
        // Store token
        localStorage.setItem('auth_token', token);
        
        // Map borrower to user format
        const mappedUser: User = {
          id: borrower.borrower_id?.toString() || borrower.id?.toString() || '',
          borrower_id: borrower.borrower_id,
          name: borrower.name,
          email: borrower.email,
          role: borrower.role || 'Member', // Use role from backend
        };
        
        setUser(mappedUser);
        localStorage.setItem('library_user', JSON.stringify(mappedUser));
        
        return { success: true };
      }
      
      return { success: false, error: response.message || 'Registration failed' };
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle network errors (no response from server)
      if (!error.response) {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please make sure the backend is running on http://localhost:8000' 
        };
      }
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        // Get first error message from any field
        const firstError = Object.values(errors).flat()[0] as string;
        return { success: false, error: firstError || 'Validation failed' };
      }
      
      // Handle other error messages
      const errorMessage = error.response?.data?.message || 
                          error.message ||
                          'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('library_user');
      localStorage.removeItem('auth_token');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('library_user', JSON.stringify(updatedUser));
  };

  // Don't render children until auth check is complete
  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        updateUser,
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