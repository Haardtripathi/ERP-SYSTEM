import axiosInstance from '../axiosInstance';


export const getAllUserData = async () => {
    const response = await axiosInstance.get(`/admin/get-all-user-data`);
    return response.data;
};


