
import axiosInstance from '../axiosInstance'


// export const getAllWorkbook = async (page, limit) => {
//     console.log(page, limit)
//     const response = await axiosInstance.get(`/workbook/get-workbook-data`, {
//         page,
//         limit
//     });
//     // const response = await axiosInstance.get(`/workbook/get-workbook-data?page=${page}&limit=${limit}`);

//     return response;
// };

export const getAllWorkbook = async (page, limit) => {

    const response = await axiosInstance.get(`/workbook/get-workbook-data`, {
        params: { page, limit }, // ✅ Correct way to send query parameters in GET request
    });

    return response;
};
