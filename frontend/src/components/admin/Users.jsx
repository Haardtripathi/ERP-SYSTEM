

// import React, { useEffect, useState } from 'react';
// import { getAllUserData } from '@/services/adminService';

// const Users = () => {
//     const [userData, setUserData] = useState([]);

//     useEffect(() => {
//         const fetchUserData = async () => {
//             const data = await getAllUserData();
//             setUserData(data.users);
//         };
//         fetchUserData();
//     }, []);

//     if (!userData.length) return <div>Loading...</div>;

//     return (
//         <div className="container mx-auto p-8 bg-gray-50 min-h-screen max-w-full">
//             <h1 className="text-3xl font-semibold text-gray-800 mb-6">Users</h1>
//             <div className="bg-white shadow-md rounded-lg overflow-hidden">
//                 <div className="overflow-x-auto max-w-full">
//                     <table className="w-full border-collapse border border-gray-200">
//                         <thead className="bg-gray-100">
//                             <tr>
//                                 <th className="border border-gray-200 px-4 py-2">Photo</th>
//                                 <th className="border border-gray-200 px-4 py-2">Aadhar Number</th>
//                                 <th className="border border-gray-200 px-4 py-2">Agent Name</th>
//                                 <th className="border border-gray-200 px-4 py-2">Company Number</th>
//                                 <th className="border border-gray-200 px-4 py-2">Phone Number</th>
//                                 <th className="border border-gray-200 px-4 py-2">Email</th>
//                                 <th className="border border-gray-200 px-4 py-2">Address</th>
//                                 <th className="border border-gray-200 px-4 py-2">Local Address</th>
//                                 <th className="border border-gray-200 px-4 py-2">Bank Name</th>
//                                 <th className="border border-gray-200 px-4 py-2">Branch Name</th>
//                                 <th className="border border-gray-200 px-4 py-2">Account Number</th>
//                                 <th className="border border-gray-200 px-4 py-2">IFSC Code</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {userData.map((user, index) => (
//                                 <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
//                                     <td className="border border-gray-200 px-4 py-2">
//                                         <img
//                                             src={`data:image/png;base64,${user.photo?.data}`}
//                                             alt="User Photo"
//                                             className="h-24 w-44 rounded-full object-cover"
//                                         />
//                                     </td>
//                                     <td className="border border-gray-200 px-4 py-2">{user.aadhar_number}</td>
//                                     <td className="border border-gray-200 px-4 py-2">{user.agent_name}</td>
//                                     <td className="border border-gray-200 px-4 py-2">{user.company_number}</td>
//                                     <td className="border border-gray-200 px-4 py-2">{user.phone_number}</td>
//                                     <td className="border border-gray-200 px-4 py-2">{user.email}</td>
//                                     <td className="border border-gray-200 px-4 py-2">{user.address}</td>
//                                     <td className="border border-gray-200 px-4 py-2">{user.local_address}</td>
//                                     <td className="border border-gray-200 px-4 py-2">{user.bank_name}</td>
//                                     <td className="border border-gray-200 px-4 py-2">{user.branch_name}</td>
//                                     <td className="border border-gray-200 px-4 py-2">{user.account_number}</td>
//                                     <td className="border border-gray-200 px-4 py-2">{user.ifsc_code}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Users;

import React, { useEffect, useState } from 'react';
import { getAllUserData } from '@/services/adminService';
import { useNavigate } from 'react-router-dom';

const Users = () => {
    const [userData, setUserData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const data = await getAllUserData();
            setUserData(data.users);
        };
        fetchUserData();
    }, []);

    if (!userData.length) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen max-w-full">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Users</h1>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-w-full">
                    <table className="w-full border-collapse border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-200 px-4 py-2">Photo</th>
                                <th className="border border-gray-200 px-4 py-2">Aadhar Number</th>
                                <th className="border border-gray-200 px-4 py-2">Agent Name</th>
                                <th className="border border-gray-200 px-4 py-2">Company Number</th>
                                <th className="border border-gray-200 px-4 py-2">Phone Number</th>
                                <th className="border border-gray-200 px-4 py-2">Email</th>
                                <th className="border border-gray-200 px-4 py-2">Address</th>
                                <th className="border border-gray-200 px-4 py-2">Local Address</th>
                                <th className="border border-gray-200 px-4 py-2">Bank Name</th>
                                <th className="border border-gray-200 px-4 py-2">Branch Name</th>
                                <th className="border border-gray-200 px-4 py-2">Account Number</th>
                                <th className="border border-gray-200 px-4 py-2">IFSC Code</th>
                                <th className="border border-gray-200 px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userData.map((user, index) => (
                                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                    <td className="border border-gray-200 px-4 py-2">
                                        <img
                                            src={`data:image/png;base64,${user.photo?.data}`}
                                            alt="User Photo"
                                            className="h-24 w-44 rounded-full object-cover"
                                        />
                                    </td>
                                    <td className="border border-gray-200 px-4 py-2">{user.aadhar_number}</td>
                                    <td className="border border-gray-200 px-4 py-2">{user.agent_name}</td>
                                    <td className="border border-gray-200 px-4 py-2">{user.company_number}</td>
                                    <td className="border border-gray-200 px-4 py-2">{user.phone_number}</td>
                                    <td className="border border-gray-200 px-4 py-2">{user.email}</td>
                                    <td className="border border-gray-200 px-4 py-2">{user.address}</td>
                                    <td className="border border-gray-200 px-4 py-2">{user.local_address}</td>
                                    <td className="border border-gray-200 px-4 py-2">{user.bank_name}</td>
                                    <td className="border border-gray-200 px-4 py-2">{user.branch_name}</td>
                                    <td className="border border-gray-200 px-4 py-2">{user.account_number}</td>
                                    <td className="border border-gray-200 px-4 py-2">{user.ifsc_code}</td>
                                    <td className="border border-gray-200 px-4 py-2">
                                        <button
                                            onClick={() => navigate(`/edit-user-data/${user._id}`)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Update
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
