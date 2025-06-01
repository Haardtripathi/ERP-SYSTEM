import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../axiosInstance'

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    loading: true, // Initially, the app is in the loading state
    isAdmin: false,
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
            const isAdmin = data.user.agent_name == "Panchved";
            set({ user: data, token, loading: false, isAdmin });
        } catch {
            console.log('authStore: checkAuth - Error checking auth, removing token and setting user to null');
            localStorage.removeItem('token');
            set({ user: null, token: null, loading: false });
        }
        finally {
            set({ loading: false })
        }
    },


    // setUser: (token) => {
    //     const decodedUser = jwtDecode(token);
    //     localStorage.setItem('token', token);
    //     set({ user: decodedUser, token, loading: false });
    // },
    setUser: (token) => {
        try {
            const decodedUser = jwtDecode(token);
            const userIsAdmin = decodedUser.isAdmin === true;

            localStorage.setItem("token", token); // ✅ Save the token
            console.log('authStore: setUser - Setting user from token:', decodedUser);
            set({ user: decodedUser, token, loading: false, isAdmin: userIsAdmin });

            // ✅ Ensure checkAuth() runs to persist session
            useAuthStore.getState().checkAuth();
        } catch (error) {
            console.error("Token decode error:", error);
        }
    },
    // setUser: (token) => {
    //     try {
    //         const decodedUser = jwtDecode(token);

    //         localStorage.setItem("token", token);
    //         set({ user: decodedUser, token, loading: false });

    //         useAuthStore.getState().checkAuth(); // ✅ Ensure session persists
    //     } catch (error) {
    //         console.error("Token decode error:", error);
    //     }
    // },


    logout: () => {
        console.log('authStore: logout - Setting user to null');
        localStorage.removeItem('token');
        set({ user: null, token: null, loading: false });
    },
}));

export default useAuthStore;
