
import axiosInstance from '../axiosInstance'


export const getAllConfirmed = async () => {
    const response = await axiosInstance.get(`/confirmed/get-confirmed-data`);
    return response;
};


export const updateAwbNumber = async (id, ref, newAwbNumber) => {
    const response = await axiosInstance.put(`/confirmed/edit-awbnumber`, {
        id,
        ref,
        newAwbNumber
    });
    return response;

}

export const updateRowState = async (id, ref, value) => {
    const response = await axiosInstance.put(`/confirmed/handle-state-change`, {
        id,
        ref,
        value
    });
    return response;
}