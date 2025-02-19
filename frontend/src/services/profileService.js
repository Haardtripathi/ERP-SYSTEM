import axiosInstance from '../axiosInstance'


export const getProfileData = async () => {
    // console.log('abc')
    const response = await axiosInstance.get(`/get-profile-data`);

    return response


};
