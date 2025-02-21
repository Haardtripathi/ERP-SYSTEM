
import axiosInstance from '../axiosInstance'


export const addPayment = async (data) => {
    console.log(data)
    const response = await axiosInstance.get(`/payment/add-payment`, { data });
    return response;
};
