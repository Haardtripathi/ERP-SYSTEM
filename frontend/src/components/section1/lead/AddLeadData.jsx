
// import React, { useEffect, useState } from 'react';
// import { uploadLeadFile } from '@/services/leadService';
// import { Upload, FileText, Loader, Download } from 'lucide-react';
// import { Toaster } from 'react-hot-toast';
// import { useNavigate } from "react-router-dom";

// const AddLeadData = () => {
//     const navigate = useNavigate();
//     const [file, setFile] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [uploadSuccess, setUploadSuccess] = useState(false);

//     useEffect(() => {
//         if (uploadSuccess) {
//             navigate('/lead');
//             setTimeout(() => setUploadSuccess(false), 500);
//         }
//     }, [uploadSuccess, navigate]);

//     const handleFileChange = (e) => {
//         const uploadedFile = e.target.files?.[0];
//         if (uploadedFile) {
//             setFile(uploadedFile);
//         }
//     };

//     const handleUpload = async () => {
//         if (!file) return;
//         setIsLoading(true);
//         try {
//             await uploadLeadFile(file);
//             setUploadSuccess(true);
//         } catch (error) {
//             console.error('File upload failed:', error);
//         }
//         setIsLoading(false);
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
//                 onClick={handleUpload}
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


import React, { useEffect, useState } from 'react'
import { uploadLeadFile } from '@/services/leadService'
import { Upload, FileText, Loader, Download } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

// shadcn/ui imports
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'

// Reusable table components (mirroring your styling)
const Table = ({ children }) => (
    <table className="w-full border-collapse">{children}</table>
)

const TableHeader = ({ children }) => (
    <thead className="bg-gray-200">{children}</thead>
)

const TableRow = ({ children, className }) => (
    <tr className={className}>{children}</tr>
)

const TableHead = ({ children, className }) => (
    <th
        className={`${className} p-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-300`}
    >
        {children}
    </th>
)

const TableBody = ({ children }) => (
    <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
)

const TableCell = ({ children, className }) => (
    <td className={`${className} p-3 text-sm text-gray-700`}>{children}</td>
)

const AddLeadData = () => {
    const navigate = useNavigate()
    const [file, setFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)

    // State for CSV preview
    const [previewData, setPreviewData] = useState([])
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    useEffect(() => {
        if (uploadSuccess) {
            navigate('/lead')
            setTimeout(() => setUploadSuccess(false), 500)
        }
    }, [uploadSuccess, navigate])

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files?.[0]
        if (uploadedFile) {
            setFile(uploadedFile)

            // If it's a CSV, parse & open preview automatically
            if (
                uploadedFile.type === 'text/csv' ||
                uploadedFile.name.toLowerCase().endsWith('.csv')
            ) {
                const reader = new FileReader()
                reader.onload = (event) => {
                    const text = event.target.result
                    // Simple CSV parsing: split lines, then split each line by comma
                    const rows = text.split('\n').map((row) => row.split(','))
                    setPreviewData(rows)
                    setIsPreviewOpen(true)
                }
                reader.readAsText(uploadedFile)
            }
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setIsLoading(true)
        try {
            await uploadLeadFile(file)
            setUploadSuccess(true)
        } catch (error) {
            console.error('File upload failed:', error)
        }
        setIsLoading(false)
    }

    const handleDownloadTemplate = () => {
        const headers = [
            'Source',
            'CM First Name',
            'CM Last Name',
            'CM Phone',
            'Agent Name',
            'Alternate Phone'
        ]
        const csvContent = headers.join(',')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'lead_data_template.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

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
            {/* Buttons for Upload & Preview */}
            <div className="flex gap-2">
                {file && (
                    <button
                        onClick={() => setIsPreviewOpen(true)}
                        className="w-full flex items-center justify-center px-4 py-2 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Preview
                    </button>
                )}
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

            {/* CSV Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-5xl p-6 rounded-lg shadow-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">CSV Preview</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Here’s a quick look at your CSV data before you upload it.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Show table if there's data */}
                    {previewData && previewData.length > 0 ? (
                        <div className="overflow-auto max-h-96 mt-4 rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {previewData[0].map((header, index) => (
                                            <TableHead key={index}>{header}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.slice(1).map((row, rowIndex) => (
                                        <TableRow
                                            key={rowIndex}
                                            className={rowIndex % 2 === 0 ? 'bg-gray-50' : ''}
                                        >
                                            {row.map((cell, cellIndex) => (
                                                <TableCell key={cellIndex}>{cell}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-gray-500">
                            No data to preview. Please upload a valid CSV file.
                        </p>
                    )}

                    <DialogFooter className="mt-4">
                        <button
                            onClick={() => setIsPreviewOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Close
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddLeadData
