import axiosInstance from '../axiosInstance'

export const getAllPending = async () => {
    const response = await axiosInstance.get(`/pending/get-pending-data`);
    return response;
};

export const getEditPending = async (id) => {
    const response = await axiosInstance.get(`/pending/get-edit-pending-data/${id}`);
    return response;
};


export const getDropdownData = async (id) => {
    const response = await axiosInstance.get(`/pending/get-dropdown-data`);
    return response;
};


export const updateEditPending = async (id, data) => {
    const response = await axiosInstance.put(`/pending/edit-pending-data/${id}`, data);
    return response;
};

export const deletePending = async (id, dataId, data) => {
    const response = await axiosInstance.post(`/pending/delete-pending-data/${id}`, { dataId, data });
    return response;
};

export const issuePending = async (id, dataId, data) => {
    const response = await axiosInstance.post(`/pending/issue-pending-data/${id}`, { dataId, data });
    return response;
};

export const sendToConfirmed = async (id, dataId, data) => {
    const response = await axiosInstance.post(`/pending/send-pending-data-to-confirmed/${id}`, { dataId, data });
    return response;
}