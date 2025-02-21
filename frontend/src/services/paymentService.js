
import axiosInstance from '../axiosInstance'


export const addPayment = async (data) => {
    console.log(data)
    const response = await axiosInstance.post(`/payment/add-payment`, { data });
    return response;
};

export const getAllPayments = async () => {
    const response = await axiosInstance.get(`/payment/get-payment-data`);
    return response;
};