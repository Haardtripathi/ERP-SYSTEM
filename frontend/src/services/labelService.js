
import axiosInstance from '../axiosInstance'


export const getAllLabel = async (queryString = "") => {
    const response = await axiosInstance.get(`/label/get-label-data?${queryString}`);
    return response;
};
