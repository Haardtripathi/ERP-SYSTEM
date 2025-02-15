import axiosInstance from '../axiosInstance'


export const getAllReturn = async () => {
    // console.log('abc')
    const response = await axiosInstance.get(`/return/get-return-data`);
    // console.log(response)
    return response;
};

export const returnDataFunction = async (value) => {
    const response = await axiosInstance.put(`/dispatched/return-data`, { value })
    return response
}