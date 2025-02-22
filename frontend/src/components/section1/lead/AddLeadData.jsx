// import { useEffect } from 'react';
// import { useFileUploadStore } from '../../../store/useFileUploadStore';

// import { Upload, FileText, Loader, Download } from 'lucide-react';
// import { Toaster } from 'react-hot-toast';
// import { useNavigate } from "react-router-dom";

// const AddLeadData = () => {
//     const navigate = useNavigate();
//     const { file, isLoading, setFile, uploadFile, uploadSuccess, resetUploadState } = useFileUploadStore();

//     useEffect(() => {
//         if (uploadSuccess) {
//             navigate('/lead');
//             setTimeout(() => resetUploadState(), 500);
//         }
//     }, [uploadSuccess, navigate, resetUploadState]);

//     useEffect(() => {
//         resetUploadState();
//     }, [resetUploadState]);

//     const handleFileChange = (e) => {
//         const uploadedFile = e.target.files?.[0];
//         if (uploadedFile) {
//             setFile(uploadedFile);
//         }
//     };

//     const handleDownloadTemplate = () => {
//         const headers = [
//             'Source',
//             'CM First Name',
//             'CM Last Name',
//             'CM Phone',
//             'Agent Name',
//             'Alternate Phone'
//         ];
//         const csvContent = headers.join(',');
//         const blob = new Blob([csvContent], { type: 'text/csv' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'lead_data_template.csv';
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         window.URL.revokeObjectURL(url);
//     };

//     return (
//         <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
//             <Toaster position="top-right" />
//             <div className="flex justify-between items-center mb-6">
//                 <h1 className="text-2xl font-bold">Lead Data Upload</h1>
//                 <button
//                     onClick={handleDownloadTemplate}
//                     className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                 >
//                     <Download className="h-4 w-4 mr-1" />
//                     Template
//                 </button>
//             </div>
//             <div className="mb-4">
//                 <label
//                     htmlFor="file-upload"
//                     className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
//                 >
//                     <Upload className="mr-2 h-5 w-5 text-gray-400" />
//                     {file ? file.name : 'Select a file'}
//                 </label>
//                 <input
//                     id="file-upload"
//                     name="file-upload"
//                     type="file"
//                     className="sr-only"
//                     onChange={handleFileChange}
//                 />
//             </div>
//             <button
//                 onClick={uploadFile}
//                 disabled={!file || isLoading}
//                 className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
//             >
//                 {isLoading ? (
//                     <Loader className="animate-spin h-5 w-5 mr-2" />
//                 ) : (
//                     <FileText className="h-5 w-5 mr-2" />
//                 )}
//                 {isLoading ? 'Uploading...' : 'Upload'}
//             </button>
//         </div>
//     );
// };

// export default AddLeadData;
import React, { useEffect, useState } from 'react';
import { uploadLeadFile } from '@/services/leadService';
import { Upload, FileText, Loader, Download } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const AddLeadData = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    useEffect(() => {
        if (uploadSuccess) {
            navigate('/lead');
            setTimeout(() => setUploadSuccess(false), 500);
        }
    }, [uploadSuccess, navigate]);

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files?.[0];
        if (uploadedFile) {
            setFile(uploadedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsLoading(true);
        try {
            await uploadLeadFile(file);
            setUploadSuccess(true);
        } catch (error) {
            console.error('File upload failed:', error);
        }
        setIsLoading(false);
    };

    const handleDownloadTemplate = () => {
        const headers = [
            'Source',
            'CM First Name',
            'CM Last Name',
            'CM Phone',
            'Agent Name',
            'Alternate Phone'
        ];
        const csvContent = headers.join(',');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lead_data_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <Toaster position="top-right" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Lead Data Upload</h1>
                <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Download className="h-4 w-4 mr-1" />
                    Template
                </button>
            </div>
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
                onClick={handleUpload}
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