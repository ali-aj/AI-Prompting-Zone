import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  _id: string;
  username: string;
  userType: 'student' | 'admin' | 'super_admin' | string;
  avatar?: string;
  email?: string;
  clubId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void; // Modify login to accept user data
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  loading: boolean; // Add loading property
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read token and user from local storage on initial load
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const [user, setUser] = useState<User | null>(storedUser ? JSON.parse(storedUser) : null);
  const [token, setToken] = useState<string | null>(storedToken);
  const [loading, setLoading] = useState<boolean>(true); // Keep loading true initially

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    if (!token) {
      // If no token, authentication check is complete.
      // Do NOT set loading to false here, it's handled at the end of the initial check useEffect
      return;
    }

    // If user is already identified as super_admin or student, skip profile fetch.
    // Their data is considered sufficient from login/local storage.
    if (user?.userType === 'super_admin' || user?.userType === 'student' || user?.userType === 'admin') {
       return;
    }

    // Set loading true before fetching, it might already be true from initial state
    // setLoading(true); // This might cause unnecessary re-renders, keep initial loading true

    try {
      // Using the correct endpoint based on userType from stored user
      let endpoint = '/api/users/profile'; // Default for regular users

      // Note: Admin profile fetch is now handled by the skip logic above, 
      // this section is primarily for non-student/non-super_admin users.
      // If you introduce other admin types that need fetching, adjust accordingly.

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData: User = await response.json();
         // Ensure userType is included, default to 'user' if not provided by /api/users/profile
        const userWithRole = { ...userData, userType: userData.userType || 'user' };
        setUser(userWithRole);
        localStorage.setItem('user', JSON.stringify(userWithRole));
      } else {
        // Handle token expiration or invalid token
        console.error('Failed to fetch user profile or token invalid.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
       // setLoading(false); // Set loading false after fetch attempt
    }
  };

  // Effect to fetch user profile when token changes
  useEffect(() => {
    fetchUserProfile();
  }, [token]);

  // Effect to handle initial authentication check on component mount
  useEffect(() => {
    const checkAuth = async () => {
      // If a token exists, fetch the profile. fetchUserProfile will set loading to false.
      if (token) {
        await fetchUserProfile(); // Wait for profile fetch to complete
      } else {
        // If no token, set loading to false as authentication check is complete.
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array means this effect runs only once on mount

  // Function to handle login (stores token and user data)
  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  // Function to handle logout (removes token and clears user state)
  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Set loading to false after logout is complete
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, fetchUserProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 