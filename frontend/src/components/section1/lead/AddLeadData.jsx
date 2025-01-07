
import { useEffect } from 'react';
import { useFileUploadStore } from '../../../store/useFileUploadStore';
import { Upload, FileText, Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const AddLeadData = () => {
    const navigate = useNavigate();
    const { file, isLoading, setFile, uploadFile, uploadSuccess, resetUploadState } = useFileUploadStore();

    useEffect(() => {
        if (uploadSuccess) {
            navigate('/lead');
            setTimeout(() => resetUploadState(), 500); // Reset state after navigation
        }
    }, [uploadSuccess, navigate, resetUploadState]);

    useEffect(() => {
        resetUploadState(); // Reset state on page load
    }, [resetUploadState]);

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files?.[0];
        if (uploadedFile) {
            setFile(uploadedFile);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <Toaster position="top-right" />
            <h1 className="text-2xl font-bold mb-6 text-center">Lead Data Upload</h1>
            <div className="mb-4">
                <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                    <Upload className="mr-2 h-5 w-5 text-gray-400" />
                    {file ? file.name : 'Select a file'}
                </label>
                <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                />
            </div>
            <button
                onClick={uploadFile}
                disabled={!file || isLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                ) : (
                    <FileText className="h-5 w-5 mr-2" />
                )}
                {isLoading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
};

export default AddLeadData;
