
import axiosInstance from '../axiosInstance';


export const getAllRoles = async () => {
    const response = await axiosInstance.get("/admin/roles");
    console.log(response)
    return response.data;
};

export const getAuthUserAccessPages = async () => {
    const response = await axiosInstance.get("/admin/get-user-access-pages");
    console.log(response)
    return response.data;
}

export const getEditRoleData = async (id) => {
    const response = await axiosInstance.get(`/admin/edit-role-data/${id}`);
    return response.data;
}

export const deleteRole = async (id) => {

    const response = await axiosInstance.delete(`/admin/delete-role`, {
        data: { roleID: id }, // ✅ This sends the body correctly
    });
    console.log(response)
    return response.data;
};

export const updateRole = async (id, data) => {
    console.log(data)
    const response = await axiosInstance.post(`/admin/edit-role-data`, { id, data });
    return response.data;
}

// Fetch available pages and columns
export const getPagesAndColumns = async () => {
    try {
        const response = await axiosInstance.get(`/admin/pages`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to fetch pages and columns");
    }
};

// Add a new role
export const addRole = async (roleData) => {
    try {
        console.log(roleData)
        const response = await axiosInstance.post(`/admin/add-role`, roleData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to add role");
    }
};


export const getAllUserData = async () => {
    const response = await axiosInstance.get(`/admin/get-all-user-data`);
    return response.data;
};



export const getEditUserData = async (id) => {
    const response = await axiosInstance.get(`/admin/edit-user-data/${id}`);
    return response.data;
}

export const editUserData = async (data, formData) => {
    const response = await axiosInstance.post(`/admin/edit-user`, { data, formData });
    return response.data;
}