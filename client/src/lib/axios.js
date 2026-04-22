import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to unauthorized access
    if (error.response && error.response.status === 401) {
      // Potentially dispatch a logout action or redirect to login
      // console.error('Unauthorized response:', error);
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
