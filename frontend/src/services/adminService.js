import axiosInstance from '../axiosInstance';


export const getAllUserData = async () => {
    const response = await axiosInstance.get(`/admin/get-all-user-data`);
    return response.data;
};



export const getEditUserData = async (id) => {
    const response = await axiosInstance.get(`/admin/edit-user-data/${id}`);
    return response.data;
}

export const editUserData = async (data, formData) => {
    const response = await axiosInstance.post(`/admin/edit-user`, { data, formData });
    return response.data;
}