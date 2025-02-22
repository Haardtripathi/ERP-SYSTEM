
import axiosInstance from '../axiosInstance'


export const getAllLead = async (page, limit) => {
    const response = await axiosInstance.get(`/lead/get-lead-data`,);
    return response;
};

export const deleteLead = async (id) => {
    const response = await axiosInstance.put(`/lead/delete-lead-data/${id}`);
    return response;
}

export const getAddLead = async () => {
    const response = await axiosInstance.get(`/lead/get-lead-dropdown-data`);
    return response;
};

export const getEditLead = async (id) => {
    const response = await axiosInstance.get(`/lead/get-edit-lead-data/${id}`);
    return response;
};

export const updateEditLead = async (id, data) => {
    const response = await axiosInstance.put(`/lead/edit-lead-data/${id}`, data);
    return response;
};

export const sendLeadToPending = async (id) => {
    const response = await axiosInstance.post(`/lead/send-lead-data-to-pending/${id}`);
    return response;
}


export const uploadLeadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axiosInstance.post('lead/add-lead-data', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};