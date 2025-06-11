// useAuthStore.js
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../axiosInstance';

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    loading: true,
    isAdmin: false,
    role: null,
    permissions: [],

    setLoading: (loading) => set({ loading }),

    checkAuth: async () => {
        set({ loading: true });

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('authStore: checkAuth - No token found, setting user to null');
            set({ user: null, token: null, loading: false });
            return;
        }

        try {
            const { data } = await axiosInstance.get('/auth/checkAuth', {
                headers: { Authorization: token },
            });

            const isAdmin = data.user.agent_name === 'Panchved';
            set({ user: data, token, isAdmin });

            // 🔥 Fetch permissions for this role
            const { data: permissionData } = await axiosInstance.get(`/admin/permissions?role=${data.user.role}`);
            console.log(permissionData)
            set({
                role: permissionData.role, // Optional if you want role.name
                permissions: permissionData.permissions,
            });

        } catch (err) {
            console.error('Auth check failed:', err);
            const isAdmin = data.user.agent_name == "Panchved";
            set({ user: data, token, loading: false, isAdmin });
        } finally {
            set({ loading: false });
        }
    },

    setUser: (token) => {
        try {
            const decodedUser = jwtDecode(token);
            useAuthStore.getState().checkAuth(); // Re-fetch full user + permission info
            const userIsAdmin = decodedUser.isAdmin === true;

            localStorage.setItem("token", token); // ✅ Save the token
            console.log('authStore: setUser - Setting user from token:', decodedUser);
            set({ user: decodedUser, token, loading: false, isAdmin: userIsAdmin });

            // ✅ Ensure checkAuth() runs to persist session
            useAuthStore.getState().checkAuth();
        } catch (error) {
            console.error('Token decode error:', error);
        }
    },

    logout: () => {
        console.log('authStore: logout - Setting user to null');
        localStorage.removeItem('token');
        set({ user: null, token: null, loading: false, permissions: [], role: null });
    },

    // ✅ Helpers
    hasPageAccess: (page) =>
        get().permissions.some((perm) => perm.page === page),

    getPageColumns: (page) => {
        const perm = get().permissions.find((p) => p.page === page);
        return perm ? perm.columns : [];
    },

    hasColumnAccess: (page, column) => {
        const columns = get().permissions.find((p) => p.page === page)?.columns;
        return columns?.includes(column);
    },
}));

export default useAuthStore;
