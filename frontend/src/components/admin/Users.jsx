
// import React, { useEffect, useState } from "react";
// import { getAllUserData } from "@/services/adminService";
// import { useNavigate } from "react-router-dom";
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Card, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";

// const Users = () => {
//     const [userData, setUserData] = useState([]);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchUserData = async () => {
//             const data = await getAllUserData();
//             setUserData(data.users);
//         };
//         fetchUserData();
//     }, []);

//     if (!userData.length) return <div className="flex items-center justify-center h-screen text-lg">Loading...</div>;

//     return (
//         <div className="container mx-auto p-8 bg-gray-50 min-h-screen max-w-full">
//             <h1 className="text-3xl font-bold text-gray-800 mb-6">Users</h1>
//             <Card className="shadow-lg">
//                 <CardContent className="p-6">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Photo</TableHead>
//                                 <TableHead>Agent Name</TableHead>
//                                 <TableHead>Company Number</TableHead>
//                                 <TableHead>Phone Number</TableHead>
//                                 <TableHead className="text-center">Actions</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {userData.map((user, index) => (
//                                 <TableRow key={index}>
//                                     <TableCell>
//                                         <img
//                                             src={`data:image/png;base64,${user.photo?.data}`}
//                                             alt="User Photo"
//                                             className="h-14 w-14 rounded-full object-cover border"
//                                         />
//                                     </TableCell>
//                                     <TableCell>{user.agent_name}</TableCell>
//                                     <TableCell>{user.company_number}</TableCell>
//                                     <TableCell>{user.phone_number}</TableCell>
//                                     <TableCell className="flex space-x-2 justify-center">
//                                         <Button
//                                             variant="default"
//                                             className="bg-blue-500 hover:bg-blue-700"
//                                             onClick={() => navigate(`/edit-user-data/${user._id}`)}
//                                         >
//                                             Update
//                                         </Button>

//                                         <Dialog>
//                                             <DialogTrigger asChild>
//                                                 <Button variant="outline">Show More</Button>
//                                             </DialogTrigger>
//                                             <DialogContent className="max-w-md">
//                                                 <DialogTitle className="text-lg font-bold">User Details</DialogTitle>
//                                                 <DialogDescription>
//                                                     <div className="mt-4 space-y-3">
//                                                         <div className="flex items-center gap-3">
//                                                             <img
//                                                                 src={`data:image/png;base64,${user.photo?.data}`}
//                                                                 alt="User Photo"
//                                                                 className="h-16 w-16 rounded-full object-cover border"
//                                                             />
//                                                             <div>
//                                                                 <p className="font-semibold text-lg">{user.agent_name}</p>
//                                                                 <p className="text-gray-500 text-sm">{user.email}</p>
//                                                             </div>
//                                                         </div>

//                                                         <Separator />

//                                                         <div className="space-y-2">
//                                                             <p><strong>Company Number:</strong> {user.company_number}</p>
//                                                             <p><strong>Phone Number:</strong> {user.phone_number}</p>
//                                                             <p><strong>Aadhar Number:</strong> {user.aadhar_number}</p>
//                                                             <p><strong>Address:</strong> {user.address}</p>
//                                                             <p><strong>Local Address:</strong> {user.local_address}</p>
//                                                             <p><strong>Bank:</strong> {user.bank_name} ({user.branch_name})</p>
//                                                             <p><strong>Account:</strong> {user.account_number} (IFSC: {user.ifsc_code})</p>
//                                                         </div>
//                                                     </div>
//                                                 </DialogDescription>
//                                             </DialogContent>
//                                         </Dialog>
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

// export default Users;


import React, { useEffect, useState } from "react";
import { getAllUserData } from "@/services/adminService";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

    if (!userData.length) return <div className="flex items-center justify-center h-screen text-2xl font-bold">Loading...</div>;

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen max-w-full">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Users</h1>
            <Card className="shadow-lg">
                <CardContent className="p-6">
                    <Table>
                        <TableHeader>
                            <TableRow className="text-l">
                                <TableHead>Photo</TableHead>
                                <TableHead>Agent Name</TableHead>
                                <TableHead>Company Number</TableHead>
                                <TableHead>Phone Number</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userData.map((user, index) => (
                                <TableRow key={index} className="text-lg">
                                    <TableCell>
                                        <img
                                            src={`data:image/png;base64,${user.photo?.data}`}
                                            alt="User Photo"
                                            className="h-24 w-24 rounded-full object-cover border-2 border-gray-400"
                                        />
                                    </TableCell>
                                    <TableCell className="font-semibold">{user.agent_name}</TableCell>
                                    <TableCell className="font-semibold">{user.company_number}</TableCell>
                                    <TableCell className="font-semibold">{user.phone_number}</TableCell>
                                    <TableCell className="flex space-x-3 justify-center">
                                        <Button
                                            variant="default"
                                            className="bg-blue-500 hover:bg-blue-700 text-lg px-4 py-2"
                                            onClick={() => navigate(`/edit-user-data/${user._id}`)}
                                        >
                                            Update
                                        </Button>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="text-lg px-4 py-2">Show More</Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-lg">
                                                <DialogTitle className="text-2xl font-bold">User Details</DialogTitle>
                                                <DialogDescription>
                                                    <div className="mt-4 space-y-4">
                                                        {/* Profile Image */}
                                                        <div className="flex flex-col items-center">
                                                            <img
                                                                src={`data:image/png;base64,${user.photo?.data}`}
                                                                alt="User Photo"
                                                                className="h-36 w-36 rounded-full object-cover border-4 border-gray-500"
                                                            />
                                                            <p className="mt-2 text-xl font-semibold">{user.agent_name}</p>
                                                            <p className="text-gray-500 text-lg">{user.email}</p>
                                                        </div>

                                                        <Separator />

                                                        {/* Details Section */}
                                                        <div className="space-y-4 text-lg">
                                                            <div><strong>Company Number:</strong> {user.company_number}</div>
                                                            <div><strong>Phone Number:</strong> {user.phone_number}</div>

                                                            <Separator />

                                                            <div><strong>Aadhar Number:</strong> {user.aadhar_number}</div>
                                                            <div><strong>Address:</strong> {user.address}</div>
                                                            <div><strong>Local Address:</strong> {user.local_address}</div>

                                                            <Separator />

                                                            <div><strong>Bank Name:</strong> {user.bank_name}</div>
                                                            <div><strong>Branch Name:</strong> {user.branch_name}</div>
                                                            <div><strong>Account Number:</strong> {user.account_number}</div>
                                                            <div><strong>IFSC Code:</strong> {user.ifsc_code}</div>
                                                        </div>
                                                    </div>
                                                </DialogDescription>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Users;
