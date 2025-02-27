'use client';

import { createContext, useState, useContext, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// Hardcoded user data
const users = [
    {
        id: '1',
        username: 'user',
        password: 'password',
        displayName: 'Demo User',
        role: 'user',
        avatar: null
    },
    {
        id: '2',
        username: 'admin',
        password: 'admin123',
        displayName: 'Admin',
        role: 'admin',
        avatar: null
    }
];

/**
 * Authentication provider component
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = () => {
            const userJson = localStorage.getItem('currentUser');
            if (userJson) {
                try {
                    setUser(JSON.parse(userJson));
                } catch (error) {
                    console.error('Error parsing user data from localStorage:', error);
                }
            }
            setLoading(false);
        };

        // Check if window is defined (client-side)
        if (typeof window !== 'undefined') {
            initializeAuth();
        } else {
            setLoading(false);
        }
    }, []);

    /**
     * Login function
     *
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {boolean} Success status
     */
    const login = (username, password) => {
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // Create a copy without the password
            const { password, ...userWithoutPassword } = user;
            setUser(userWithoutPassword);

            // Save to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            }

            return true;
        }
        return false;
    };

    /**
     * Logout function
     */
    const logout = () => {
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('currentUser');
        }
    };

    // Context value
    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}