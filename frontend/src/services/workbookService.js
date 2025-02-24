
import axiosInstance from '../axiosInstance'


export const getAllWorkbook = async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/workbook/get-workbook-data`);
    // const response = await axiosInstance.get(`/workbook/get-workbook-data?page=${page}&limit=${limit}`);

    return response;
};