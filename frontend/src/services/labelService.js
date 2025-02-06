
import axiosInstance from '../axiosInstance'


export const getAllLabel = async (page, limit) => {
    const response = await axiosInstance.get(`/label/get-label-data`);
    return response;
};
