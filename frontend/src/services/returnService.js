import axiosInstance from '../axiosInstance'


export const getAllReturn = async (queryString = "") => {
    const response = await axiosInstance.get(`/return/get-return-data?${queryString}`);
    return response;
};

export const returnDataFunction = async (value) => {
    const response = await axiosInstance.put(`/dispatched/return-data`, { value })
    return response
}