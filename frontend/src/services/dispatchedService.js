/* eslint-disable no-useless-catch */

import axiosInstance from '../axiosInstance'


export const getAllDispatched = async () => {
    console.log('abc')
    const response = await axiosInstance.get(`/dispatched/get-dispatched-data`);
    console.log(response)
    return response;
};

export const dispatchDataFunction = async (value) => {
    const response = await axiosInstance.put(`/dispatched/put-dispatched-data`, { value })
    return response
}
export const updatePositionAndDate = async (itemId, position, date, locationHistory) => {
    try {
        console.log(itemId, position, date, locationHistory)
        const response = await axiosInstance.put(`/dispatched/update-position/${itemId}`, { position, date, locationHistory })
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}


export const raiseComplain = async (value) => {
    console.log(value)
    const response = await axiosInstance.post(`/dispatched/raise-complain`, { value })
    return response
}
