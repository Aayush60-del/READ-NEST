import axios from 'axios';

const rawApiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export const getStoredSession = () => {
  try {
    const token = localStorage.getItem("readnest_token");
    const user = JSON.parse(localStorage.getItem("readnest_user") || "null");
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

export const saveSession = ({ token, user }) => {
  if (token) localStorage.setItem("readnest_token", token);
  if (user) localStorage.setItem("readnest_user", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("readnest_token");
  localStorage.removeItem("readnest_user");
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const { token } = getStoredSession();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      if (
        window.location.pathname !== '/auth' &&
        window.location.pathname !== '/' &&
        window.location.pathname !== '/oauth-success'
      ) {
        window.location.href = '/auth';
      }
    }
    
    // Graceful 404 handling for specific endpoints
    if (error.response?.status === 404) {
      const url = error.config.url;
      if (url.includes('/lib/books/lib') || url.includes('/lib/reading-stats') || url.includes('/lib/myLibrary') || url.includes('/continue-reading') || url.includes('/progress')) {
         return null; // Return null instead of throwing so UI can handle empty state natively
      }
    }

    const message = error.response?.data?.message || error.message || "Something went wrong.";
    return Promise.reject(new Error(message));
  }
);

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/signup',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    ACCOUNT: '/auth/account',
  },
  USER: {
    ALL: '/user/all',
    PROFILE: '/user/profile',
    BY_ID: (id) => `/user/${id}`,
  },
  ADMIN: {
    ANALYTICS: '/api/admin/analytics',
  },
  PUBLIC: {
    STATS: '/api/public/stats',
  },
  BOOKS: {
    LIST: '/lib/books',
    ADMIN_LIST: '/lib/books/lib',
    DETAIL: (id) => `/lib/books/${id}`,
    PROGRESS: (id) => `/lib/books/${id}/progress`,
    READ: (id) => `/lib/books/${id}/readBook`,
    BOOKMARKS: (id) => `/lib/books/${id}/BookMarks`,
    NOTES: (id) => `/lib/books/${id}/notes`,
    HIGHLIGHTS: (id) => `/lib/books/${id}/highlights`,
    MY_LIBRARY: '/lib/myLibrary',
    CONTINUE_READING: '/lib/continue-reading',
    DISCOVER_RECOMMENDATIONS: '/lib/discover/recommendations',
    STATS: '/lib/reading-stats',
    STREAK: '/lib/streak',
    SEARCH: (title) => `/lib/books/search/${title}`,
  },
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    FCM_TOKEN: '/api/notifications/fcm-token',
    READ: (id) => `/api/notifications/${id}/read`,
    READ_ALL: '/api/notifications/read-all',
    SETTINGS: '/api/notifications/settings',
    TEST: '/api/test-notification'
  }
};

export const fetchCurrentUser = async () => {
  const payload = await api.get(ENDPOINTS.AUTH.PROFILE);
  const nextUser = payload?.user || null;

  if (nextUser) {
    const { token } = getStoredSession();
    saveSession({ token, user: nextUser });
  }

  return nextUser;
};

export default api;



