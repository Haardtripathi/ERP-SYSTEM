import axiosInstance from '../axiosInstance'

export const getAllPending = async () => {
    const response = await axiosInstance.get(`/pending/get-pending-data`);
    return response;
};

export const getEditPending = async (id) => {
    const response = await axiosInstance.get(`/pending/get-edit-pending-data/${id}`);
    console.log(response)
    return response;
};