import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../axiosInstance'

const useAuthStore = create((set) => ({
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
        } catch {
            localStorage.removeItem('token');
            set({ user: null, token: null, loading: false });
        }
    },
    setUser: (token) => {
        const decodedUser = jwtDecode(token);
        localStorage.setItem('token', token);
        set({ user: decodedUser, token, loading: false });
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, loading: false });
    },
}));

export default useAuthStore;
