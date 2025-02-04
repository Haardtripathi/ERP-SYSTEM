import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../axiosInstance'

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    loading: true, // Initially, the app is in the loading state
    setLoading: (loading) => set({ loading }),
    checkAuth: async () => {
        set({ loading: true });
        const token = localStorage.getItem('token');
        if (!token) {
            set({ user: null, token: null, loading: false });
            return;
        }
        try {
            const { data } = await axiosInstance.get('/auth/checkAuth', {
                headers: { Authorization: token },
            });
            set({ user: data, token, loading: false });
            console.log(useAuthStore.getState().user);
        } catch {
            localStorage.removeItem('token');
            set({ user: null, token: null, loading: false });
        }
    },

    // checkAuth: async () => {
    //     if (get().loading === false) return; // ✅ Prevent unnecessary calls

    //     set({ loading: true });
    //     const token = localStorage.getItem('token');

    //     if (!token) {
    //         set({ user: null, token: null, loading: false });
    //         return;
    //     }

    //     try {
    //         const { data } = await axiosInstance.get('/auth/checkAuth', {
    //             headers: { Authorization: token },
    //         });

    //         if (get().user !== data) { // ✅ Only update if user changes
    //             set({ user: data, token, loading: false });
    //         } else {
    //             set({ loading: false });
    //         }
    //     } catch (error) {
    //         console.error("Auth check failed:", error);
    //         localStorage.removeItem('token');
    //         set({ user: null, token: null, loading: false });
    //     }
    // },

    setUser: (token) => {
        const decodedUser = jwtDecode(token);
        localStorage.setItem('token', token);
        set({ user: decodedUser, token, loading: false });
    },
    setUser: (token) => {
        try {
            const decodedUser = jwtDecode(token);
            console.log("Decoded User:", decodedUser);

            localStorage.setItem("token", token); // ✅ Save the token
            set({ user: decodedUser, token, loading: false });

            // ✅ Ensure checkAuth() runs to persist session
            useAuthStore.getState().checkAuth();
        } catch (error) {
            console.error("Token decode error:", error);
        }
    },
    // setUser: (token) => {
    //     try {
    //         const decodedUser = jwtDecode(token);
    //         console.log("Decoded User:", decodedUser);

    //         localStorage.setItem("token", token);
    //         set({ user: decodedUser, token, loading: false });

    //         useAuthStore.getState().checkAuth(); // ✅ Ensure session persists
    //     } catch (error) {
    //         console.error("Token decode error:", error);
    //     }
    // },


    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, loading: false });
    },
}));

export default useAuthStore;
