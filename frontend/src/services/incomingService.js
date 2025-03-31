
import axiosInstance from '../axiosInstance'


export const getAddIncoming = async () => {
    const response = await axiosInstance.get(`/incoming/get-add-incoming-data`);
    return response.data;
};

export const postAddIncoming = async (data) => {
    const response = await axiosInstance.post(`/incoming/add-incoming-data`, data);
    return response;
};

export const getAllIncoming = async (queryString = "") => {
    const response = await axiosInstance.get(`/incoming/get-incoming-data?${queryString}`,);
    return response;
};

export const getEditIncoming = async (id) => {
    const response = await axiosInstance.get(`/incoming/edit-incoming-data/${id}`);
    return response;
};

export const updateEditIncoming = async (id, data) => {
    const response = await axiosInstance.put(`/incoming/edit-incoming-data/${id}`, data);
    return response;
};


export const deleteIncoming = async (id) => {
    const response = await axiosInstance.put(`/incoming/delete-incoming-data/${id}`);
    return response;
};


export const sendIncomingToPending = async (id) => {
    const response = await axiosInstance.post(`/incoming/send-incoming-data-to-pending/${id}`);
    return response;
}