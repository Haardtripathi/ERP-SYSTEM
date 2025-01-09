
import axiosInstance from '../axiosInstance'


export const getAllWorkbook = async () => {
    const response = await axiosInstance.get(`/workbook/get-workbook-data`);
    return response;
};