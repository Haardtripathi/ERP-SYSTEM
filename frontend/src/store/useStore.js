import { create } from 'zustand';

const useStore = create((set) => ({
    loading: false,
    setLoading: (loading) => set({ loading }),
}));