import axios from "axios";

// Get the base URL from environment variables, with a fallback for local development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_PROD_URL ||"http://localhost:8080";

// Create a new instance of axios
const api = axios.create({
  baseURL: API_BASE_URL,
  // We remove 'withCredentials' as it's for cookies, not Bearer tokens
});

// --- !!! THIS IS THE NEW, ESSENTIAL PART !!! ---
// This "interceptor" runs before every request
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from localStorage
    const token = localStorage.getItem('jwtToken');
    
    // 2. If the token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);
// --- END OF NEW PART ---

export default api;