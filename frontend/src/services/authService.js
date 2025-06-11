import axiosInstance from '../axiosInstance';

export const register = async (formData) => {
    try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await axiosInstance.post('/auth/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            },
        });
        console.log(response)
        return response.data;
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Registration failed');
    }
};


export const login = async (userData) => {
    const response = await axiosInstance.post(`/auth/login`, userData);
    return response.data;
};


export const getAgentList = async () => {
    const response = await axiosInstance.get('/auth/agentList');
    return response.data;
}


export const getRoleList = async () => {
    const response = await axiosInstance.get('/auth/roleList');
    return response.data;
}
