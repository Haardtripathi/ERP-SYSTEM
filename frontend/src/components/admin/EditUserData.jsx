

"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from 'react-router-dom';


import { toast } from "react-hot-toast"
import { Mail, Lock, Loader2, Building, MapPin, CreditCard, Image } from "lucide-react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { getEditUserData, editUserData } from '@/services/adminService';
import { register, getAgentList } from "../../services/authService"



// Mock functions for demonstration purposes
// const getEditUserData = async (id: string) => ({
//   user: {
//     /* mock user data */
//   },
// })
// const editUserData = async (id, data) => {
//   /* mock edit function */
// }
// const getAgentList = async () => ({ agentList: [{ values: ["Agent 1", "Agent 2"] }] })

const EditUserData = () => {
    const { id } = useParams()
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [photo, setPhoto] = useState(null)
    const [agentList, setAgentList] = useState([])
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
        aadharNumber: "",
        bankName: "",
        bankBranch: "",
        IFSC_Code: "",
        accountNumber: "",
    })

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getEditUserData(id)
                if (data.user) {
                    setUserData(data.user)
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

    // const handleSubmit = async (e) => {
    //     e.preventDefault()
    //     setLoading(true)

    //     const formDataToSend = new FormData()

    //     Object.entries(formData).forEach(([key, value]) => {
    //         console.log(key, value)
    //         if (value !== undefined && value !== null) {
    //             formDataToSend.append(key, value)
    //         }
    //     })
    //     console.log(formDataToSend)

    //     if (photo) {
    //         formDataToSend.append("photo", photo)
    //     }

    //     try {
    //         await editUserData(id, formDataToSend)
    //         toast.success("User updated successfully")
    //     } catch (error) {
    //         console.error("Update failed:", error)
    //         toast.error("Failed to update user")
    //     } finally {
    //         setLoading(false)
    //     }
    // }
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
        <div className="container mx-auto py-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Edit User</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email field */}
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

                        {/* Agent Name field */}
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

                        {/* Password field */}
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
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Company and Phone Number fields */}
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

                        {/* Address fields */}
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

                        {/* Bank details fields */}
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

                        {/* Photo upload field */}
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
                                    required
                                />
                            </div>
                        </div>
                        <img
                            src={`data:image/png;base64,${userData?.photo?.data}`}
                            alt="User Photo"
                            className="h-44 w-44 rounded-full object-cover mt-2"
                        />

                        {/* Submit button */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating account...
                                </>
                            ) : (
                                "Update User"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default EditUserData

