"use client"

import { useState, useEffect } from "react"
import { getAllRoles } from "../../services/adminService"; // Fetch roles

import { toast } from "react-hot-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { register, getAgentList } from "../../services/authService"
import { Mail, Lock, Loader2, Building, MapPin, CreditCard, Image, User } from "lucide-react"

export default function AddUser() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        agentName: "",
        companyNumber: "",
        phoneNumber: "",
        role: "",
        address: "",
        localAddress: "",
        aadharNumber: "",
        bankName: "",
        bankBranch: "",
        IFSC_Code: "",
        accountNumber: "",
        isRemote: false // <-- add this
    })
    const [photo, setPhoto] = useState(null)
    const [roles, setRoles] = useState([]); // State to store roles

    const [loading, setLoading] = useState(false)
    const [sameAsAddress, setSameAsAddress] = useState(false)

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await getAllRoles();
                setRoles(data);
            } catch (error) {
                toast.error("Failed to fetch roles");
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        if (sameAsAddress) {
            setFormData((prev) => ({ ...prev, localAddress: formData.address }))
        }
    }, [sameAsAddress, formData.address])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0])
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const formDataToSend = new FormData()
        Object.entries(formData).forEach(([key, value]) => {
            // Convert boolean to string for FormData
            formDataToSend.append(key, typeof value === 'boolean' ? String(value) : value)
        })
        if (photo) {
            formDataToSend.append("photo", photo)
        }

        try {
            await register(formDataToSend)
            toast.success("User added successfully")
            // Reset form
            setFormData({
                email: "",
                role: "",
                password: "",
                agentName: "",
                companyNumber: "",
                phoneNumber: "",
                address: "",
                localAddress: "",
                aadharNumber: "",
                bankName: "",
                bankBranch: "",
                IFSC_Code: "",
                accountNumber: "",
            })
            setPhoto(null)
            document.getElementById("photo").value = "";
        } catch (error) {
            console.error("Registration failed:", error)
            toast.error("Failed to add user")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Add User</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-secondary p-4 rounded-lg">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <User className="mr-2" /> Personal Information
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="agentName">Agent Name</Label>
                                    <Input
                                        id="agentName"
                                        name="agentName"
                                        value={formData.agentName}
                                        onChange={handleChange}
                                        placeholder="Enter agent name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role._id} value={role._id}>  {/* Send ID instead of name */}
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="photo">Photo</Label>
                                    <div className="relative">
                                        <Image className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="photo"
                                            name="photo"
                                            type="file"
                                            onChange={handleFileChange}
                                            accept="image/jpeg,image/png,image/jpg"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="isRemote">Remote User</Label>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isRemote"
                                            name="isRemote"
                                            checked={formData.isRemote}
                                            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isRemote: checked }))}
                                        />
                                        <span className="text-muted-foreground text-sm">Check if this user should only see their own data (remote user)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="bg-secondary p-4 rounded-lg">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <Building className="mr-2" /> Company Details
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="companyNumber">Company Number</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="companyNumber"
                                            name="companyNumber"
                                            value={formData.companyNumber}
                                            onChange={handleChange}
                                            placeholder="Enter company number"
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="bg-secondary p-4 rounded-lg">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <MapPin className="mr-2" /> Address Information
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Enter your address"
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="sameAsAddress"
                                        checked={sameAsAddress}
                                        onCheckedChange={(checked) => setSameAsAddress(checked)}
                                    />
                                    <Label htmlFor="sameAsAddress">Local address same as address</Label>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="localAddress">Local Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="localAddress"
                                            name="localAddress"
                                            value={formData.localAddress}
                                            onChange={handleChange}
                                            placeholder="Enter your local address"
                                            required
                                            disabled={sameAsAddress}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="bg-secondary p-4 rounded-lg">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <CreditCard className="mr-2" /> Bank Details
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="aadharNumber">Aadhar Number</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="aadharNumber"
                                            name="aadharNumber"
                                            value={formData.aadharNumber}
                                            onChange={handleChange}
                                            placeholder="Enter Aadhar number"
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bankName">Bank Name</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="bankName"
                                            name="bankName"
                                            value={formData.bankName}
                                            onChange={handleChange}
                                            placeholder="Enter bank name"
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bankBranch">Bank Branch</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="bankBranch"
                                            name="bankBranch"
                                            value={formData.bankBranch}
                                            onChange={handleChange}
                                            placeholder="Enter bank branch"
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">Account Number</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="accountNumber"
                                            name="accountNumber"
                                            value={formData.accountNumber}
                                            onChange={handleChange}
                                            placeholder="Enter account number"
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="IFSC_Code">IFSC Code</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="IFSC_Code"
                                            name="IFSC_Code"
                                            value={formData.IFSC_Code}
                                            onChange={handleChange}
                                            placeholder="Enter IFSC code"
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Add User"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
































// "use client";

// import { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { register } from "../../services/authService";
// import { getAllRoles } from "../../services/adminService"; // Fetch roles
// import { Mail, Lock, Loader2, Building, MapPin, CreditCard, Image, User } from "lucide-react";

// export default function AddUser() {
//     const [formData, setFormData] = useState({
//         email: "",
//         password: "",
//         agentName: "",
//         role: "", // Added role
//         companyNumber: "",
//         phoneNumber: "",
//         address: "",
//         localAddress: "",
//         aadharNumber: "",
//         bankName: "",
//         bankBranch: "",
//         IFSC_Code: "",
//         accountNumber: "",
//     });

//     const [photo, setPhoto] = useState(null);
//     const [roles, setRoles] = useState([]); // State to store roles
//     const [loading, setLoading] = useState(false);
//     const [sameAsAddress, setSameAsAddress] = useState(false);

//     useEffect(() => {
//         const fetchRoles = async () => {
//             try {
//                 const data = await getAllRoles();
//                 setRoles(data);
//             } catch (error) {
//                 toast.error("Failed to fetch roles");
//             }
//         };
//         fetchRoles();
//     }, []);

//     useEffect(() => {
//         if (sameAsAddress) {
//             setFormData((prev) => ({ ...prev, localAddress: formData.address }));
//         }
//     }, [sameAsAddress, formData.address]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleFileChange = (e) => {
//         if (e.target.files && e.target.files[0]) {
//             setPhoto(e.target.files[0]);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         const formDataToSend = new FormData();
//         Object.entries(formData).forEach(([key, value]) => {
//             formDataToSend.append(key, value);
//         });
//         if (photo) {
//             formDataToSend.append("photo", photo);
//         }

//         try {
//             await register(formDataToSend);
//             toast.success("User added successfully");
//             setFormData({
//                 email: "",
//                 password: "",
//                 agentName: "",
//                 role: "",
//                 companyNumber: "",
//                 phoneNumber: "",
//                 address: "",
//                 localAddress: "",
//                 aadharNumber: "",
//                 bankName: "",
//                 bankBranch: "",
//                 IFSC_Code: "",
//                 accountNumber: "",
//             });
//             setPhoto(null);
//         } catch (error) {
//             console.error("Registration failed:", error);
//             toast.error("Failed to add user");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="container mx-auto py-8">
//             <Card className="max-w-4xl mx-auto">
//                 <CardHeader>
//                     <CardTitle className="text-2xl font-bold text-center">Add User</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         {/* Personal Information */}
//                         <div className="bg-secondary p-4 rounded-lg">
//                             <h2 className="text-lg font-semibold mb-4 flex items-center">
//                                 <User className="mr-2" /> Personal Information
//                             </h2>
//                             <div className="grid gap-4 md:grid-cols-2">
//                                 <div className="space-y-2">
//                                     <Label htmlFor="email">Email</Label>
//                                     <Input
//                                         id="email"
//                                         name="email"
//                                         type="email"
//                                         value={formData.email}
//                                         onChange={handleChange}
//                                         placeholder="Enter your email"
//                                         required
//                                     />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="password">Password</Label>
//                                     <Input
//                                         id="password"
//                                         name="password"
//                                         type="password"
//                                         value={formData.password}
//                                         onChange={handleChange}
//                                         placeholder="Enter your password"
//                                         required
//                                     />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="agentName">Agent Name</Label>
//                                     <Input
//                                         id="agentName"
//                                         name="agentName"
//                                         value={formData.agentName}
//                                         onChange={handleChange}
//                                         placeholder="Enter agent name"
//                                         required
//                                     />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="role">Role</Label>
//                                     <Select
//                                         value={formData.role}
//                                         onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
//                                     >
//                                         <SelectTrigger className="w-full">
//                                             <SelectValue placeholder="Select Role" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {roles.map((role) => (
//                                                 <SelectItem key={role._id} value={role.name}>
//                                                     {role.name}
//                                                 </SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="photo">Photo</Label>
//                                     <Input
//                                         id="photo"
//                                         name="photo"
//                                         type="file"
//                                         onChange={handleFileChange}
//                                         accept="image/jpeg,image/png,image/jpg"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         <Separator />

//                         {/* Address Section */}
//                         <div className="bg-secondary p-4 rounded-lg">
//                             <h2 className="text-lg font-semibold mb-4 flex items-center">
//                                 <MapPin className="mr-2" /> Address Information
//                             </h2>
//                             <div className="space-y-4">
//                                 <div className="space-y-2">
//                                     <Label htmlFor="address">Address</Label>
//                                     <Input
//                                         id="address"
//                                         name="address"
//                                         value={formData.address}
//                                         onChange={handleChange}
//                                         placeholder="Enter your address"
//                                         required
//                                     />
//                                 </div>
//                                 <div className="flex items-center space-x-2">
//                                     <Checkbox
//                                         id="sameAsAddress"
//                                         checked={sameAsAddress}
//                                         onCheckedChange={(checked) => setSameAsAddress(checked)}
//                                     />
//                                     <Label htmlFor="sameAsAddress">Local address same as address</Label>
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="localAddress">Local Address</Label>
//                                     <Input
//                                         id="localAddress"
//                                         name="localAddress"
//                                         value={formData.localAddress}
//                                         onChange={handleChange}
//                                         placeholder="Enter your local address"
//                                         required
//                                         disabled={sameAsAddress}
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         <Separator />

//                         <Button type="submit" className="w-full" disabled={loading}>
//                             {loading ? (
//                                 <>
//                                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                     Creating account...
//                                 </>
//                             ) : (
//                                 "Add User"
//                             )}
//                         </Button>
//                     </form>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
