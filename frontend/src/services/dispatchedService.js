/* eslint-disable no-useless-catch */

import axiosInstance from '../axiosInstance'


export const getAllDispatched = async (queryString = "") => {
    const response = await axiosInstance.get(`/dispatched/get-dispatched-data?${queryString}`);
    return response;
};

export const dispatchDataFunction = async (value) => {
    const response = await axiosInstance.put(`/dispatched/put-dispatched-data`, { value })
    return response
}

export const updatePositionAndDate = async (itemId, position, date, locationHistory) => {
    try {
        const response = await axiosInstance.put(`/dispatched/update-position/${itemId}`, { position, date, locationHistory })
        return response
    } catch (error) {
        throw error
    }
}

export const raiseComplain = async (value) => {
    const response = await axiosInstance.post(`/dispatched/raise-complain`, { value })
    return response
}


export const delivered = async (id) => {
    const response = await axiosInstance.post(`/dispatched/delivered`, { id })
    return response

}