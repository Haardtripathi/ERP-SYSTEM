import axiosInstance from '../axiosInstance'

export const getAllPending = async () => {
    const response = await axiosInstance.get(`/pending/get-pending-data`);
    return response;
};