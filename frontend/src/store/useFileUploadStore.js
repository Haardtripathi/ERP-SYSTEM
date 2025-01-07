import { create } from 'zustand'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export const useFileUploadStore = create((set, get) => ({
    file: null,
    preview: '',
    isLoading: false,
    uploadSuccess: false,
    setFile: (file) => set({ file }),
    resetUploadState: () => set({ file: null, preview: '', uploadSuccess: false }),
    uploadFile: async () => {
        const { file } = get();
        if (!file) {
            toast.error('Please select a file first!');
            return;
        }

        set({ isLoading: true });
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');

        try {
            const response = await axios.post('http://localhost:5001/api/lead/add-lead-data', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });
            set({ isLoading: false, uploadSuccess: true });
            toast.success('File uploaded successfully!');
        } catch (error) {
            console.error('Error uploading the file:', error);
            toast.error('Failed to upload file. Please try again.');
            set({ isLoading: false });
        }
    },
}));
