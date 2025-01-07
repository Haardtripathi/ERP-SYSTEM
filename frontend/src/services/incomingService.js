
import axiosInstance from '../axiosInstance'


export const getAddIncoming = async () => {
    const response = await axiosInstance.get(`/incoming/get-add-incoming-data`);
    // console.log(response);
    return response.data;
};

export const postAddIncoming = async (data) => {
    console.log(data)
    const response = await axiosInstance.post(`/incoming/add-incoming-data`, data);
    console.log(response)
    return response;
};


export const getAllIncoming = async () => {
    // console.log(data)
    const response = await axiosInstance.get(`/incoming/get-incoming-data`);
    // console.log(response)
    return response;
};
