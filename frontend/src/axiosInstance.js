import axios from 'axios';

// Get token from localStorage
const token = localStorage.getItem('token');

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5001/api/', // Base API URL
    timeout: 10000, // Timeout after 10 seconds
    headers: {
        'Content-Type': 'application/json', // Default headers
        ...(token && { Authorization: `Bearer ${token}` }), // Attach token if it exists
    },
});

// Add a request interceptor to automatically attach token to all requests
axiosInstance.interceptors.request.use(
    (config) => {
        const newToken = localStorage.getItem('token'); // Re-fetch token in case it changes
        if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized! Redirecting to login.');
            // Handle unauthorized errors (e.g., redirect to login page)
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
