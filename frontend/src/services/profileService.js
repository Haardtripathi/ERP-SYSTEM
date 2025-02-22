import axiosInstance from '../axiosInstance'


export const getProfileData = async () => {
    const response = await axiosInstance.get(`/get-profile-data`);

    return response


};
