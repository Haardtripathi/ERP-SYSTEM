import axiosInstance from '../axiosInstance'


export const getAllComplain = async () => {
    const response = await axiosInstance.get(`/complain/get-complain-data`);
    return response;
};


export const editComplainId = async (data) => {
    const response = await axiosInstance.put(`/complain/edit-complain-id`, { data });
    return response
}