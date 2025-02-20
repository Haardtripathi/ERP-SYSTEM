

import axios from 'axios';

// Base URL from environment variables or default
const baseURL = 'http://localhost:5001/api/';

// Get token from localStorage
const token = localStorage.getItem('token');

// Create Axios instance
const axiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    },
});

// Add request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const newToken = localStorage.getItem('token');
        if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized! Redirecting to login.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
