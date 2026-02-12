import axios from 'axios';

// Configure axios defaults
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
axios.defaults.baseURL = baseURL.endsWith('/api') ? baseURL : baseURL + '/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Request interceptor for auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // For demo users, add a special header to help the backend identify the simulated user
      if (token === 'demo-token') {
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) {
          try {
            const parsedUser = JSON.parse(demoUser);
            config.headers['X-Demo-User'] = parsedUser.username;
          } catch (e) {
            console.warn('Error parsing demo user for header', e);
          }
        }
      }
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const shouldGuard = error.config?.__sessionGuard;
    if (shouldGuard && error.response?.status === 401) {
      const token = localStorage.getItem('token');
       if (token) {
        window.dispatchEvent(new CustomEvent('app:session-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
