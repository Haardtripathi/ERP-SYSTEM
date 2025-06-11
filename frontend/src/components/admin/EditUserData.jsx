import React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from "react-hot-toast"
import { Mail, Lock, Loader2, Building, MapPin, CreditCard, Image, User, Phone, Building2 } from "lucide-react"
import { getAllRoles } from "../../services/adminService"; // Fetch roles

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { getEditUserData, editUserData } from '@/services/adminService'
import { register, getAgentList } from "../../services/authService"



const EditUserData = () => {
    const { id } = useParams()
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [photo, setPhoto] = useState(null)
    const [sameAsAddress, setSameAsAddress] = useState(false)
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        email: "",
        password: "",
        agentName: "",
        companyNumber: "",
        phoneNumber: "",
        address: "",
        localAddress: "",
        role: "",

        aadharNumber: "",
        bankName: "",
        bankBranch: "",
        IFSC_Code: "",
        accountNumber: "",
    })
    const [roles, setRoles] = useState([]); // State to store roles

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getEditUserData(id)
                console.log(data)
                if (data.user) {
                    setUserData(data.user)
                    setFormData({
                        email: data.user.email || "",
                        password: "",
                        agentName: data.user.agent_name || "",
                        companyNumber: data.user.company_number || "",
                        role: data.user.role || "",
                        phoneNumber: data.user.phone_number || "",
                        address: data.user.address || "",
                        localAddress: data.user.local_address || "",
                        aadharNumber: data.user.aadhar_number || "",
                        bankName: data.user.bank_name || "",
                        bankBranch: data.user.branch_name || "",
                        IFSC_Code: data.user.ifsc_code || "",
                        accountNumber: data.user.account_number || "",
                    })
                }
            } catch (error) {
                console.error("Error fetching user data:", error)
            }
            setLoading(false)
        }

        fetchUserData()
    }, [id])

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
            setFormData((prev) => ({ ...prev, localAddress: prev.address }))
        }
    }, [sameAsAddress, formData.address])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const jsonData = {
            ...formData,
            photo: photo // This will now be the base64 string
        };

        // Remove any undefined or null values
        Object.keys(jsonData).forEach(key => {
            if (jsonData[key] === undefined || jsonData[key] === null) {
                delete jsonData[key];
            }
        });

        console.log('Data being sent:', jsonData); // For debugging

        try {
            await editUserData(id, jsonData);
            toast.success("User updated successfully");
            navigate("/users");

        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Failed to update user");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Convert file to base64
            const base64 = await convertToBase64(file);
            setPhoto(base64);
        }

    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };


    if (loading) return <div>Loading...</div>
    if (!userData) return <div>User not found</div>

    return (
        <div className="container mx-auto py-6">
            <Card className="w-full">
                <CardHeader className="pb-6">
                    <CardTitle className="text-2xl">Edit User Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-8">
                                {/* Basic Information */}
                                <div className="bg-slate-50 p-6 rounded-lg">
                                    <div className="flex items-center mb-4">
                                        <User className="h-5 w-5 mr-2" />
                                        <h3 className="text-lg font-semibold">Basic Information</h3>
                                    </div>
                                    <Separator className="mb-6" />

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                            <div className="relative mt-1">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                            <div className="relative mt-1">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Agent Information */}
                                <div className="bg-slate-50 p-6 rounded-lg">
                                    <div className="flex items-center mb-4">
                                        <Building2 className="h-5 w-5 mr-2" />
                                        <h3 className="text-lg font-semibold">Agent Information</h3>
                                    </div>
                                    <Separator className="mb-6" />

                                    <div className="space-y-4">
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
                                                onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))} // This updates the formData.role to the _id of the role
                                                required
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role._id} value={role._id}>  {/* The value is the role._id */}
                                                            {role.name}  {/* Display the role name */}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>


                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="companyNumber" className="text-sm font-medium">Company Number</Label>
                                                <Input
                                                    id="companyNumber"
                                                    name="companyNumber"
                                                    value={formData.companyNumber}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                                                <Input
                                                    id="phoneNumber"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Photo */}
                                <div className="bg-slate-50 p-6 rounded-lg">
                                    <div className="flex items-center mb-4">
                                        <Image className="h-5 w-5 mr-2" />
                                        <h3 className="text-lg font-semibold">Profile Photo</h3>
                                    </div>
                                    <Separator className="mb-6" />

                                    <div className="flex items-center space-x-6">
                                        <div className="flex-1">
                                            <Label htmlFor="photo" className="text-sm font-medium">Upload Photo</Label>
                                            <Input
                                                id="photo"
                                                name="photo"
                                                type="file"
                                                onChange={handleFileChange}
                                                accept="image/jpeg,image/png,image/jpg"
                                                className="mt-1"
                                            />
                                        </div>
                                        {userData?.photo?.data && (
                                            <img
                                                src={`data:image/png;base64,${userData.photo.data}`}
                                                alt="User Photo"
                                                className="h-20 w-20 rounded-full object-cover"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8">
                                {/* Address Information */}
                                <div className="bg-slate-50 p-6 rounded-lg">
                                    <div className="flex items-center mb-4">
                                        <MapPin className="h-5 w-5 mr-2" />
                                        <h3 className="text-lg font-semibold">Address Information</h3>
                                    </div>
                                    <Separator className="mb-6" />

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="address" className="text-sm font-medium">Permanent Address</Label>
                                            <Input
                                                id="address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="sameAsAddress"
                                                checked={sameAsAddress}
                                                onCheckedChange={(checked) => setSameAsAddress(checked)}
                                            />
                                            <Label htmlFor="sameAsAddress" className="text-sm">
                                                Local address same as permanent
                                            </Label>
                                        </div>

                                        <div>
                                            <Label htmlFor="localAddress" className="text-sm font-medium">Local Address</Label>
                                            <Input
                                                id="localAddress"
                                                name="localAddress"
                                                value={formData.localAddress}
                                                onChange={handleChange}
                                                disabled={sameAsAddress}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Details */}
                                <div className="bg-slate-50 p-6 rounded-lg">
                                    <div className="flex items-center mb-4">
                                        <CreditCard className="h-5 w-5 mr-2" />
                                        <h3 className="text-lg font-semibold">Bank Details</h3>
                                    </div>
                                    <Separator className="mb-6" />

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="aadharNumber" className="text-sm font-medium">Aadhar Number</Label>
                                            <Input
                                                id="aadharNumber"
                                                name="aadharNumber"
                                                value={formData.aadharNumber}
                                                onChange={handleChange}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="bankName" className="text-sm font-medium">Bank Name</Label>
                                                <Input
                                                    id="bankName"
                                                    name="bankName"
                                                    value={formData.bankName}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="bankBranch" className="text-sm font-medium">Bank Branch</Label>
                                                <Input
                                                    id="bankBranch"
                                                    name="bankBranch"
                                                    value={formData.bankBranch}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="accountNumber" className="text-sm font-medium">Account Number</Label>
                                                <Input
                                                    id="accountNumber"
                                                    name="accountNumber"
                                                    value={formData.accountNumber}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="IFSC_Code" className="text-sm font-medium">IFSC Code</Label>
                                                <Input
                                                    id="IFSC_Code"
                                                    name="IFSC_Code"
                                                    value={formData.IFSC_Code}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button type="submit" size="lg" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default EditUserData

