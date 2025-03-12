import axiosInstance from '../axiosInstance';

export const register = async (formData) => {
    try {
        const response = await axiosInstance.post('/auth/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Optional, but browser usually handles this
            },
        });
        console.log(response)
        return response.data;
    } catch (error) {
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
