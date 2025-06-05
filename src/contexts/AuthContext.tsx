import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'EV_DRIVER' | 'STATION_OPERATOR' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'EV_DRIVER' | 'STATION_OPERATOR' | 'ADMIN';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a token and fetch user data
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // If token is invalid, clear everything
        logout();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('token', data.token);
      
      // Fetch user data after successful login
      const userResponse = await fetch('http://localhost/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      setUser(userData);
      
      // Redirect based on user type
      switch (userData.userType) {
        case 'EV_DRIVER':
          navigate('/evdriver');
          break;
        case 'STATION_OPERATOR':
          navigate('/operator');
          break;
        case 'ADMIN':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      let endpoint = '';
      let requestBody: any = {
        user: {
          username: userData.username,
          password: userData.password,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          userType: userData.userType
        }
      };

      switch (userData.userType) {
        case 'EV_DRIVER':
          endpoint = '/api/v1/auth/register/driver';
          requestBody = {
            user: requestBody.user,
            driver: {
              // Empty driver object is fine as it will be populated by the backend
              // The backend will create the driver record and link it to the user
            }
          };
          break;
        case 'STATION_OPERATOR':
          endpoint = '/api/v1/auth/register/operator';
          requestBody = {
            user: requestBody.user,
            operator: {
              // Empty operator object is fine as it will be populated by the backend
            }
          };
          break;
        case 'ADMIN':
          endpoint = '/api/v1/auth/register/admin';
          requestBody = {
            user: requestBody.user,
            admin: {
              // Empty admin object is fine as it will be populated by the backend
            }
          };
          break;
        default:
          throw new Error('Invalid user type');
      }

      console.log('Registration request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`http://localhost${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('token', data.token);
      
      // Fetch user data after successful registration
      await fetchUserData();
      
      // Redirect based on user type
      switch (data.userType) {
        case 'EV_DRIVER':
          navigate('/evdriver');
          break;
        case 'STATION_OPERATOR':
          navigate('/operator');
          break;
        case 'ADMIN':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
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