// Constants for localStorage keys
const USER_KEY = 'notebook_user';
const CHAT_HISTORY_KEY = 'notebook_chat_history';
const USER_SETTINGS_KEY = 'notebook_user_settings';

// User-related localStorage functions
export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const storeUser = (user) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(USER_KEY);
};

// Chat history localStorage functions
export const getChatHistory = (userId) => {
  if (typeof window === 'undefined') return [];
  
  const historyKey = `${CHAT_HISTORY_KEY}_${userId}`;
  const historyStr = localStorage.getItem(historyKey);
  return historyStr ? JSON.parse(historyStr) : [];
};

export const storeChatHistory = (userId, chatHistory) => {
  if (typeof window === 'undefined') return;
  
  const historyKey = `${CHAT_HISTORY_KEY}_${userId}`;
  localStorage.setItem(historyKey, JSON.stringify(chatHistory));
};

// User settings localStorage functions
export const getUserSettings = (userId) => {
  if (typeof window === 'undefined') return {};
  
  const settingsKey = `${USER_SETTINGS_KEY}_${userId}`;
  const settingsStr = localStorage.getItem(settingsKey);
  return settingsStr ? JSON.parse(settingsStr) : {};
};

export const storeUserSettings = (userId, settings) => {
  if (typeof window === 'undefined') return;
  
  const settingsKey = `${USER_SETTINGS_KEY}_${userId}`;
  localStorage.setItem(settingsKey, JSON.stringify(settings));
};