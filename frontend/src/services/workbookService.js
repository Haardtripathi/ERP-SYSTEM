
import axiosInstance from '../axiosInstance'


export const getAllWorkbook = async (queryString = "") => {
    const response = await axiosInstance.get(`/workbook/get-workbook-data?${queryString}`);
    // const response = await axiosInstance.get(`/workbook/get-workbook-data?page=${page}&limit=${limit}`);

    return response;
};