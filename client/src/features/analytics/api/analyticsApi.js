import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const analyticsApi = {
  getDashboardSummary: async (params = {}) => {
    const response = await axios.get(`${API_URL}/analytics`, { 
      params,
      withCredentials: true 
    });
    return response.data.data;
  }
};
