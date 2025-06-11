import axiosInstance from '../axiosInstance'

export const getAllSheetsGenerator = async (queryString = "") => {
    const response = await axiosInstance.get(`/sheets/get-sheet-data?${queryString}`);
    return response;
};