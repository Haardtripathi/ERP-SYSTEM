import axiosInstance from '../axiosInstance'

export const getAllSheetsGenerator = async () => {
    const response = await axiosInstance.get(`/sheets/get-sheet-data`);
    return response;
};