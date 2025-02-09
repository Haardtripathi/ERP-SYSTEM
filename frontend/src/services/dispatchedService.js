
import axiosInstance from '../axiosInstance'


export const getAllDispatched = async () => {
    const response = await axiosInstance.get(`/dispatched/get-dispatched-data`);
    return response;
};

export const dispatchDataFunction = async (value) => {
    const response = await axiosInstance.put(`/dispatched/put-dispatched-data`, { value })
    return response
}