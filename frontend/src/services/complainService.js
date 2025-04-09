import axiosInstance from '../axiosInstance'


export const getAllComplain = async (queryString = "") => {
    const response = await axiosInstance.get(`/complain/get-complain-data?${queryString}`);
    return response;
};


export const editComplainId = async (data) => {
    const response = await axiosInstance.put(`/complain/edit-complain-id`, { data });
    return response
}