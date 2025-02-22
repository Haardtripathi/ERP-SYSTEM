import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEditUserData, editUserData } from '@/services/adminService';

import { toast } from "react-hot-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { register, getAgentList } from "../../services/authService"

import { Mail, Lock, Loader2, Building, MapPin, CreditCard, Image } from "lucide-react"


const EditUserData = () => {
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [photo, setPhoto] = useState(null)
    const [agentList, setAgentList] = useState([])

    const [sameAsAddress, setSameAsAddress] = useState(false)

    const [formData, setFormData] = useState({
        email: "",
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

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getEditUserData(id);
                console.log("Fetched User Data:", data);

                if (data.user) {
                    setUserData(data.user);

                    setFormData({
                        email: data.user.email || "",
                        password: "",
                        agentName: data.user.agent_name || "",
                        companyNumber: data.user.company_number || "",
                        phoneNumber: data.user.phone_number || "",
                        address: data.user.address || "",
                        localAddress: data.user.local_address || "",
                        aadharNumber: data.user.aadhar_number || "",
                        bankName: data.user.bank_name || "",
                        bankBranch: data.user.branch_name || "",
                        IFSC_Code: data.user.ifsc_code || "",
                        accountNumber: data.user.account_number || "",
                    });

                    if (data.user.photo?.data) {
                        setPhoto(data.user.photo.data); // Set the current photo
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
            setLoading(false);
        };

        fetchUserData();
    }, [id]);







    useEffect(() => {
        const fetchAgentList = async () => {
            try {
                const data = await getAgentList()

                if (data?.agentList?.[0]?.values) {
                    setAgentList(data.agentList[0].values)
                } else {
                    toast.error("No agents found")
                }
            } catch (error) {
                toast.error("Failed to fetch agent list")
            }
        }

        fetchAgentList()
    }, [])

    useEffect(() => {
        if (sameAsAddress) {
            setFormData((prev) => ({ ...prev, localAddress: prev.address }))
        }
    }, [sameAsAddress, formData.address])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formDataToSend = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formDataToSend.append(key, value);
            }
        });

        // If the photo is unchanged, append existing photo
        if (photo && typeof photo !== "string") {
            formDataToSend.append("photo", photo);
        }

        // Debugging: Check what is being sent
        for (let pair of formDataToSend.entries()) {
            console.log(pair[0], pair[1]);
        }

        try {
            await editUserData(id, formDataToSend);
            toast.success("User updated successfully");
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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]); // Update photo when changed
        }
    };



    if (loading) return <div>Loading...</div>;
    if (!userData) return <div>User not found</div>;





    return (
        <div className="container mx-auto py-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Add User</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            <Label htmlFor="agentName">Agent Name</Label>
                            <Select
                                value={formData.agentName}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, agentName: value }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Agent Name" />
                                </SelectTrigger>
                                <SelectContent>
                                    {agentList.map((agent) => (
                                        <SelectItem key={agent} value={agent}>
                                            {agent}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
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


                            <img
                                src={`data:image/png;base64,${userData?.photo?.data}`}
                                alt="User Photo"
                                className="h-44 w-44 rounded-full object-cover mt-2"
                            />

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
};

export default EditUserData;