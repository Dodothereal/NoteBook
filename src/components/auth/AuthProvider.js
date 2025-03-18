'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser, storeUser, removeUser } from '@/lib/localStorage';
import { USERS } from '@/lib/users';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // Find user with matching credentials
    const foundUser = USERS.find(
      (u) => u.username === username && u.password === password
    );
    
    if (foundUser) {
      // Create a user object without the password
      const userToStore = {
        id: foundUser.id,
        username: foundUser.username,
        name: foundUser.name,
        email: foundUser.email,
      };
      
      setUser(userToStore);
      storeUser(userToStore);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    removeUser();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);