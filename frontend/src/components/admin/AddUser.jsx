

"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { register, getAgentList } from "../../services/authService"
import { toast } from "react-hot-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Lock, Loader2, Building, MapPin, CreditCard, Image } from "lucide-react"

const AddUser = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        agentName: "",
        companyNumber: "",
        phoneNumber: "",
        address: "",
        localAddress: "",
        aadharNumber: "",
    })
    const [photo, setPhoto] = useState(null)
    const [agentList, setAgentList] = useState([])
    const [loading, setLoading] = useState(false)
    const [sameAsAddress, setSameAsAddress] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchAgentList = async () => {
            try {
                const data = await getAgentList()
                if (data && data.agentList && data.agentList.length > 0 && data.agentList[0].values) {
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

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
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
            formDataToSend.append(key, value)
        })
        if (photo) {
            formDataToSend.append("photo", photo)
        }

        try {
            await register(formDataToSend)
            toast.success("Signup successful")
            navigate("/add-user")
        } catch (error) {
            console.error("Signup failed:", error) //Added error logging
            toast.error("Signup failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
            <Card className="w-[500px] mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Add User</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                                required
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
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                            <Label htmlFor="companyNumber">Company Number</Label>
                            <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="companyNumber"
                                    name="companyNumber"
                                    type="text"
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
                                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="text"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Enter company number"
                                    required
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="address"
                                    name="address"
                                    type="text"
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
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="localAddress"
                                    name="localAddress"
                                    type="text"
                                    value={formData.localAddress}
                                    onChange={handleChange}
                                    placeholder="Enter your local address"
                                    required
                                    disabled={sameAsAddress}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="aadharNumber">Aadhar Number</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="aadharNumber"
                                    name="aadharNumber"
                                    type="text"
                                    value={formData.aadharNumber}
                                    onChange={handleChange}
                                    placeholder="Enter your Aadhar number"
                                    required
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="photo">Photo</Label>
                            <div className="relative">
                                <Image className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="photo"
                                    name="photo"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/jpeg,image/png,image/jpg"
                                    required
                                    className="pl-10"
                                />
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

export default AddUser

