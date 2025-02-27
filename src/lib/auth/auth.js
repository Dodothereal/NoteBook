// lib/auth/auth.js
/**
 * Authentication service with hardcoded users
 */

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
 * Login with username and password
 *
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object|null} User object without password or null if invalid
 */
export function login(username, password) {
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Create a copy without the password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    return null;
}

/**
 * Get current user from localStorage
 *
 * @returns {Object|null} User object or null if not logged in
 */
export function getCurrentUser() {
    if (typeof window === 'undefined') {
        return null;
    }

    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
        return null;
    }

    try {
        return JSON.parse(userJson);
    } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        return null;
    }
}

/**
 * Save user to localStorage
 *
 * @param {Object} user - User object to save
 */
export function saveUser(user) {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Logout current user
 */
export function logout() {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.removeItem('currentUser');
}