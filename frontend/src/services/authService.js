
import axiosInstance from '../axiosInstance'


export const register = async (userData) => {
    console.log(userData);
    const response = await axiosInstance.post(`/auth/register`, userData);
    return response.data;
};

export const login = async (userData) => {
    // console.log(userData);
    const response = await axiosInstance.post(`/auth/login`, userData);
    return response.data;
};
