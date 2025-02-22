// import React, { useEffect, useState } from 'react';
// import { getProfileData } from "@/services/profileService";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { User, Mail, Building2, MapPin, Home, Hash } from "lucide-react";

// const ProfilePage = () => {
//     const [profile, setProfile] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [imageError, setImageError] = useState(false);

//     useEffect(() => {
//         const fetchProfile = async () => {
//             try {
//                 const data = await getProfileData();
//                 setProfile(data.data.user);
//             } catch (error) {
//                 console.error('Error fetching profile:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProfile();
//     }, []);




//     const getImageSrc = (photoData) => {
//         try {
//             if (!photoData?.photo?.data) return null

//             // Get the base64 string and content type
//             const base64String = photoData.photo.data
//             const contentType = photoData.photo.contentType || "image/png"

//             // If it's already a complete data URL, return it
//             if (base64String.startsWith("data:")) {
//                 return base64String
//             }

//             // Otherwise construct the data URL
//             return `data:${contentType};base64,${base64String}`
//         } catch (error) {
//             console.error("Error processing image:", error)
//             return null
//         }
//     }

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <p className="text-lg">Loading profile...</p>
//             </div>
//         );
//     }

//     if (!profile) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <p className="text-lg text-red-500">Error loading profile data</p>
//             </div>
//         );
//     }

//     return (
//         <div className="container mx-auto px-4 py-8">
//             <Card className="max-w-4xl mx-auto">
//                 <CardHeader>
//                     <CardTitle className="text-2xl font-bold text-center">Agent Profile</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                         {/* Profile Image */}
//                         <div className="flex justify-center md:justify-start">
//                             <div className="relative w-48 h-48 rounded-full overflow-hidden bg-gray-100">
//                                 {!imageError ? (
//                                     <img
//                                         src={getImageSrc(profile) || "/placeholder.svg"}
//                                         alt="Profile"
//                                         className="w-full h-full object-cover"
//                                         onError={() => setImageError(true)}
//                                     />
//                                 ) : (
//                                     <div className="w-full h-full flex items-center justify-center bg-gray-200">
//                                         <User className="w-16 h-16 text-gray-400" />
//                                     </div>
//                                 )}
//                             </div>
//                         </div >

//                         {/* Profile Information */}
//                         <div className="space-y-4">
//                             <div className="flex items-center gap-3">
//                                 <User className="w-5 h-5 text-gray-500" />
//                                 <div>
//                                     <p className="text-sm text-gray-500">Agent Name</p>
//                                     <p className="font-medium">{profile.agent_name}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-3">
//                                 <Mail className="w-5 h-5 text-gray-500" />
//                                 <div>
//                                     <p className="text-sm text-gray-500">Email</p>
//                                     <p className="font-medium">{profile.email}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-3">
//                                 <Building2 className="w-5 h-5 text-gray-500" />
//                                 <div>
//                                     <p className="text-sm text-gray-500">Company Number</p>
//                                     <p className="font-medium">{profile.company_number}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-3">
//                                 <MapPin className="w-5 h-5 text-gray-500" />
//                                 <div>
//                                     <p className="text-sm text-gray-500">Address</p>
//                                     <p className="font-medium">{profile.address}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-3">
//                                 <Home className="w-5 h-5 text-gray-500" />
//                                 <div>
//                                     <p className="text-sm text-gray-500">Local Address</p>
//                                     <p className="font-medium">{profile.local_address}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-3">
//                                 <Hash className="w-5 h-5 text-gray-500" />
//                                 <div>
//                                     <p className="text-sm text-gray-500">Aadhar Number</p>
//                                     <p className="font-medium">{profile.aadhar_number}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-3">
//                                 <Hash className="w-5 h-5 text-gray-500" />
//                                 <div>
//                                     <p className="text-sm text-gray-500">Bank Name</p>
//                                     <p className="font-medium">{profile.bank_name}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-3">
//                                 <Hash className="w-5 h-5 text-gray-500" />
//                                 <div>
//                                     <p className="text-sm text-gray-500">Branch Name</p>
//                                     <p className="font-medium">{profile.branch_name}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-3">
//                                 <Hash className="w-5 h-5 text-gray-500" />
//                                 <div>
//                                     <p className="text-sm text-gray-500">Account Number</p>
//                                     <p className="font-medium">{profile.account_number}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-3">
//                                 <Hash className="w-5 h-5 text-gray-500" />
//                                 <div>
//                                     <p className="text-sm text-gray-500">IFSC Code</p>
//                                     <p className="font-medium">{profile.ifsc_code}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Additional Details */}
//                     <div className="mt-8 pt-6 border-t border-gray-200">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <p className="text-sm text-gray-500">Created At</p>
//                                 <p className="font-medium">
//                                     {new Date(profile.createdAt).toLocaleDateString()}
//                                 </p>
//                             </div>
//                             <div>
//                                 <p className="text-sm text-gray-500">Last Updated</p>
//                                 <p className="font-medium">
//                                     {new Date(profile.updatedAt).toLocaleDateString()}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

// export default ProfilePage;



"use client"

import { useEffect, useState } from "react"
import { getProfileData } from "@/services/profileService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Building2, MapPin, Home, Hash, Phone } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const ProfilePage = () => {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [imageError, setImageError] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfileData()
                setProfile(data.data.user)
            } catch (error) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    const getImageSrc = (photoData) => {
        try {
            if (!photoData?.photo?.data) return null
            const base64String = photoData.photo.data
            const contentType = photoData.photo.contentType || "image/png"
            return base64String.startsWith("data:") ? base64String : `data:${contentType};base64,${base64String}`
        } catch (error) {
            console.error("Error processing image:", error)
            return null
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading profile...</p>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-red-500">Error loading profile data</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-6xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">Agent Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Top Section - Photo and Primary Info */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Profile Image - Larger Size */}
                        <div className="relative w-64 h-64 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {!imageError ? (
                                <img
                                    src={getImageSrc(profile) || "/placeholder.svg"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <User className="w-20 h-20 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Primary Information */}
                        <div className="flex-grow space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Agent Name</p>
                                        <p className="text-lg font-semibold">{profile.agent_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-lg font-semibold">{profile.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="text-lg font-semibold">{profile.phone_number || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-8" />

                    {/* Details Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Company & Address Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Company & Address Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Building2 className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Company Number</p>
                                        <p className="font-medium">{profile.company_number}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium">{profile.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Home className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Local Address</p>
                                        <p className="font-medium">{profile.local_address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bank Details Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Bank Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Hash className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Bank Name</p>
                                        <p className="font-medium">{profile.bank_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Hash className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Branch Name</p>
                                        <p className="font-medium">{profile.branch_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Hash className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Account Number</p>
                                        <p className="font-medium">{profile.account_number}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Hash className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">IFSC Code</p>
                                        <p className="font-medium">{profile.ifsc_code}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Details Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Additional Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Hash className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Aadhar Number</p>
                                        <p className="font-medium">{profile.aadhar_number}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timestamps Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Timestamps</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Created At</p>
                                    <p className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Updated</p>
                                    <p className="font-medium">{new Date(profile.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ProfilePage

