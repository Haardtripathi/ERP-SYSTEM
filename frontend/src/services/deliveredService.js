/* eslint-disable no-useless-catch */

import axiosInstance from '../axiosInstance'


export const delivered = async () => {
    const response = await axiosInstance.get(`/delivered/delivered-data`);
    return response;
};
