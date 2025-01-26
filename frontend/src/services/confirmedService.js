
import axiosInstance from '../axiosInstance'


export const getAllConfirmed = async () => {
    const response = await axiosInstance.get(`/confirmed/get-confirmed-data`);
    return response;
};
