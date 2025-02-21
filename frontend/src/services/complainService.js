import axiosInstance from '../axiosInstance'


export const getAllComplain = async () => {
    // console.log('abc')
    const response = await axiosInstance.get(`/complain/get-complain-data`);
    console.log(response)
    return response;
};


export const editComplainId = async (data) => {
    const response = await axiosInstance.put(`/complain/edit-complain-id`, { data });
    return response
}