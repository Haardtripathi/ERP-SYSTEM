/* eslint-disable no-useless-catch */

import axiosInstance from '../axiosInstance'


export const delivered = async (queryString = "") => {
    const response = await axiosInstance.get(`/delivered/delivered-data?${queryString}`);
    return response;
};
