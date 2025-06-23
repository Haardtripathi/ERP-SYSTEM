// import React, { useState, useEffect } from "react";
// import { toast, Toaster } from "react-hot-toast";
// import { create } from "zustand";
// import { getAddIncoming, updateEditIncoming, getEditIncoming } from "../../../services/incomingService";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { Loader2, UserCircle, Phone, MapPin, MessageSquare, Languages, Activity, User2, Building2 } from 'lucide-react';
// import { useParams } from "react-router-dom";

// const useStore = create((set) => ({
//     loading: false,
//     setLoading: (loading) => set({ loading }),
// }));

// const EditIncomingData = () => {
//     const { id } = useParams();
//     const { loading, setLoading } = useStore();
//     const [dropdowns, setDropdowns] = useState({});
//     const [formData, setFormData] = useState({
//         source: { dropdown_data: "", value: "" },
//         cm_first_name: "",
//         cm_last_name: "",
//         cm_phone: "",
//         alternate_phone: "",
//         agent_name: { dropdown_data: "", value: "" },
//         language: { dropdown_data: "", value: "" },
//         disease: { dropdown_data: "", value: "" },
//         age: "",
//         height: "",
//         weight: "",
//         state: { dropdown_data: "", value: "" },
//         city: "",
//         remark: { dropdown_data: "", value: "" },
//         comment: "",
//     });
//     const navigate = useNavigate();


//     useEffect(() => {
//         const fetchDropdowns = async () => {
//             setLoading(true);
//             try {
//                 // Fetch dropdown data
//                 const response = await getAddIncoming();
//                 setDropdowns(response.dropdowns);

//                 // Fetch edit data using the id
//                 const editDataForm = await getEditIncoming(id);
//                 const editData = editDataForm.data.data

//                 if (editData.is_sent_to_pending) {
//                     navigate(`/incoming`)

//                 }

//                 // Map response to formData structure
//                 const mappedFormData = {
//                     source: editData.source || { dropdown_data: "", value: "" },
//                     cm_first_name: editData.cm_first_name || "",
//                     cm_last_name: editData.cm_last_name || "",
//                     cm_phone: editData.cm_phone || "",
//                     alternate_phone: editData.alternate_phone || "",
//                     agent_name: editData.agent_name || { dropdown_data: "", value: "" },
//                     language: editData.language || { dropdown_data: "", value: "" },
//                     disease: editData.disease || { dropdown_data: "", value: "" },
//                     age: editData.age || "",
//                     height: editData.height || "",
//                     weight: editData.weight || "",
//                     state: editData.state || { dropdown_data: "", value: "" },
//                     city: editData.city || "",
//                     remark: editData.remark || { dropdown_data: "", value: "" },
//                     comment: editData.comment || "",
//                     is_sent_to_pending: editData.is_sent_to_pending || false

//                 };

//                 // Set formData with mapped values
//                 setFormData(mappedFormData);
//             } catch (error) {
//                 toast.error("Failed to load data");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchDropdowns();
//     }, [id, setLoading]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleDropdownChange = (e, key) => {
//         const value = e.target.value;

//         setFormData(prev => ({
//             ...prev,
//             [key]: {
//                 dropdown_data: dropdowns[key]?.id || "",
//                 value
//             }
//         }));
//     };

//     const validateForm = () => {
//         let isValid = true;
//         const phoneRegex = /^\d{10}$/;

//         Object.entries(formData).forEach(([key, value]) => {
//             if (key !== "alternate_phone" && typeof value === "object" && (value.value === null || value.value === "")) {
//                 toast.error(`${key.replace(/_/g, " ")} is required`)
//                 isValid = false
//             } else if (key !== "alternate_phone" && typeof value === "string" && value.trim() === "") {
//                 toast.error(`${key.replace(/_/g, " ")} is required`)
//                 isValid = false
//             }
//         })

//         if (!phoneRegex.test(formData.cm_phone)) {
//             toast.error('Phone number must be 10 digits');
//             isValid = false;
//         }

//         if (formData.alternate_phone && !phoneRegex.test(formData.alternate_phone)) {
//             toast.error('Alternate phone number must be 10 digits');
//             isValid = false;
//         }

//         return isValid;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validateForm()) {
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await updateEditIncoming(id, formData)
//             toast.success("Data updated successfully!");
//             navigate('/incoming');
//         } catch (error) {
//             toast.error("Error submitting form");
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100">
//                 <div className="flex flex-col items-center space-y-4">
//                     <Loader2 className="h-12 w-12 animate-spin text-stone-600" />
//                     <p className="text-lg font-medium text-stone-700">Loading your content...</p>
//                     <p className="text-sm text-stone-500">This may take a few moments</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-stone-100 text-stone-700 p-4">
//             <div className="max-w-7xl mx-auto">
//                 <Card className="bg-stone-50 shadow-sm border-t-4 border-t-stone-300">
//                     <div className="p-6 sm:p-8">
//                         <div className="flex items-center space-x-2 mb-8">
//                             <UserCircle className="w-8 h-8 text-stone-500" />
//                             <h1 className="text-2xl font-bold text-stone-700">Edit Incoming Data</h1>
//                         </div>

//                         <form onSubmit={handleSubmit} className="space-y-8">
//                             {/* Personal Information Section */}
//                             <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
//                                 <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
//                                     <User2 className="w-5 h-5 mr-2 text-stone-500" />
//                                     Personal Information
//                                 </h2>
//                                 <div className="grid sm:grid-cols-3 gap-6">
//                                     <div>
//                                         <Label htmlFor="cm_first_name" className="text-stone-600">First Name *</Label>
//                                         <Input
//                                             id="cm_first_name"
//                                             name="cm_first_name"
//                                             value={formData.cm_first_name}
//                                             onChange={handleChange}
//                                             className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
//                                             required
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="cm_last_name" className="text-stone-600">Last Name *</Label>
//                                         <Input
//                                             id="cm_last_name"
//                                             name="cm_last_name"
//                                             value={formData.cm_last_name}
//                                             onChange={handleChange}
//                                             className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
//                                             required
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="age" className="text-stone-600">Age *</Label>
//                                         <Input
//                                             id="age"
//                                             name="age"
//                                             value={formData.age}
//                                             onChange={handleChange}
//                                             className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
//                                             type="number"
//                                             required
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="height" className="text-stone-600">Height *</Label>
//                                         <Input
//                                             id="height"
//                                             name="height"
//                                             value={formData.height}
//                                             onChange={handleChange}
//                                             className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
//                                             type="number"
//                                             required
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="weight" className="text-stone-600">Weight *</Label>
//                                         <Input
//                                             id="weight"
//                                             name="weight"
//                                             value={formData.weight}
//                                             onChange={handleChange}
//                                             className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
//                                             type="number"
//                                             required
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Contact Information Section */}
//                             <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
//                                 <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
//                                     <Phone className="w-5 h-5 mr-2 text-stone-500" />
//                                     Contact Information
//                                 </h2>
//                                 <div className="grid sm:grid-cols-3 gap-6">
//                                     <div>
//                                         <Label htmlFor="cm_phone" className="text-stone-600">Phone *</Label>
//                                         <Input
//                                             id="cm_phone"
//                                             name="cm_phone"
//                                             value={formData.cm_phone}
//                                             onChange={handleChange}
//                                             className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
//                                             required
//                                             pattern="\d{10}"
//                                             title="Phone number must be 10 digits"
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="alternate_phone" className="text-stone-600">Alternate Number</Label>
//                                         <Input
//                                             id="alternate_phone"
//                                             name="alternate_phone"
//                                             value={formData.alternate_phone}
//                                             onChange={handleChange}
//                                             className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
//                                             pattern="\d{10}"
//                                             title="Alternate phone number must be 10 digits"
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="state" className="text-stone-600">State *</Label>
//                                         <select
//                                             id="state"
//                                             value={formData.state.value}
//                                             onChange={(e) => handleDropdownChange(e, 'state')}
//                                             className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 text-stone-700"
//                                             required
//                                         >
//                                             <option value="">Select state</option>
//                                             {dropdowns.state?.values?.map((item) => (
//                                                 <option key={item} value={item}>
//                                                     {item}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="city" className="text-stone-600">City/Town/Village *</Label>
//                                         <Input
//                                             id="city"
//                                             name="city"
//                                             value={formData.city}
//                                             onChange={handleChange}
//                                             className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
//                                             required
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Additional Information Section */}
//                             <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
//                                 <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
//                                     <Building2 className="w-5 h-5 mr-2 text-stone-500" />
//                                     Additional Information
//                                 </h2>
//                                 <div className="grid sm:grid-cols-3 gap-6">
//                                     <div>
//                                         <Label htmlFor="source" className="text-stone-600">Source *</Label>
//                                         <select
//                                             id="source"
//                                             value={formData.source.value}
//                                             onChange={(e) => handleDropdownChange(e, 'source')}
//                                             className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 text-stone-700"
//                                             required
//                                         >
//                                             <option value="">Select source</option>
//                                             {dropdowns.source?.values?.map((item) => (
//                                                 <option key={item} value={item}>
//                                                     {item}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="agent_name" className="text-stone-600">Agent Name *</Label>
//                                         <select
//                                             id="agent_name"
//                                             value={formData.agent_name.value}
//                                             onChange={(e) => handleDropdownChange(e, 'agent_name')}
//                                             className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 text-stone-700"
//                                             required
//                                         >
//                                             <option value="">Select agent</option>
//                                             {dropdowns["agent_name"]?.values?.map((item) => (
//                                                 <option key={item} value={item}>
//                                                     {item}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="language" className="text-stone-600">Language *</Label>
//                                         <select
//                                             id="language"
//                                             value={formData.language.value}
//                                             onChange={(e) => handleDropdownChange(e, 'language')}
//                                             className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 text-stone-700"
//                                             required
//                                         >
//                                             <option value="">Select language</option>
//                                             {dropdowns.language?.values?.map((item) => (
//                                                 <option key={item} value={item}>
//                                                     {item}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="disease" className="text-stone-600">Disease *</Label>
//                                         <select
//                                             id="disease"
//                                             value={formData.disease.value}
//                                             onChange={(e) => handleDropdownChange(e, 'disease')}
//                                             className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 text-stone-700"
//                                             required
//                                         >
//                                             <option value="">Select disease</option>
//                                             {dropdowns.disease?.values?.map((item) => (
//                                                 <option key={item} value={item}>
//                                                     {item}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="remark" className="text-stone-600">Remark *</Label>
//                                         <select
//                                             id="remark"
//                                             value={formData.remark.value}
//                                             onChange={(e) => handleDropdownChange(e, 'remark')}
//                                             className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 text-stone-700"
//                                             required
//                                         >
//                                             <option value="">Select remark</option>
//                                             {dropdowns.remark?.values?.map((item) => (
//                                                 <option key={item} value={item}>
//                                                     {item}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Comments Section */}
//                             <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
//                                 <Label htmlFor="comment" className="text-lg font-semibold text-stone-600 flex items-center">
//                                     <MessageSquare className="w-5 h-5 mr-2 text-stone-500" />
//                                     Comments *
//                                 </Label>
//                                 <textarea
//                                     id="comment"
//                                     name="comment"
//                                     value={formData.comment}
//                                     onChange={handleChange}
//                                     rows={4}
//                                     className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 resize-none text-stone-700"
//                                     placeholder="Add your comments here..."
//                                     required
//                                 />
//                             </div>

//                             <Button
//                                 type="submit"
//                                 className="w-full bg-stone-600 hover:bg-stone-700 text-white font-semibold py-3 text-lg flex items-center justify-center"
//                                 disabled={loading}
//                             >
//                                 {loading ? "Submitting..." : "Submit Information"}
//                             </Button>
//                         </form>
//                     </div>
//                 </Card>
//             </div>
//         </div>
//     );
// };

// export default EditIncomingData;


"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { create } from "zustand"
import { getAddIncoming, updateEditIncoming, getEditIncoming } from "../../../services/incomingService"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Loader2, UserCircle, Phone, MessageSquare, User2, Building2 } from "lucide-react"
import { useParams } from "react-router-dom"
import useAccessControl from "../../AccessControl"

const useStore = create((set) => ({
    loading: false,
    setLoading: (loading) => set({ loading }),
}))

const EditIncomingData = () => {
    const { id } = useParams()
    const { loading, setLoading } = useStore()
    const [dropdowns, setDropdowns] = useState({})
    const [formData, setFormData] = useState({
        source: { dropdown_data: "", value: "" },
        cm_first_name: "",
        cm_last_name: "",
        cm_phone: "",
        alternate_phone: "",
        agent_name: { dropdown_data: "", value: "" },
        language: { dropdown_data: "", value: "" },
        disease: { dropdown_data: "", value: "" },
        age: "",
        height: "",
        weight: "",
        state: { dropdown_data: "", value: "" },
        city: "",
        remark: { dropdown_data: "", value: "" },
        comment: "",
    })
    const navigate = useNavigate()
    const { permissions, loading: permissionsLoading } = useAccessControl("/edit-incoming-data/:id")
    const [columnPermissions, setColumnPermissions] = useState([])

    // Function to check if user has permission for a specific column
    const hasColumnPermission = (columnName) => {
        if (!columnPermissions || !Array.isArray(columnPermissions) || columnPermissions.length === 0) {
            return false
        }
        return columnPermissions.includes(columnName)
    }

    useEffect(() => {
        if (permissionsLoading) return // Wait until permissions loading is complete

        // Ensure permissions exist
        if (!permissions) {
            navigate("/dashboard") // Redirect if no permissions
            return
        }

        // Check if user has access to this page
        if (!permissions.page || permissions.page !== "/edit-incoming-data/:id") {
            navigate("/dashboard") // Redirect if no access to this page
            return
        }

        // Store column permissions for later use
        if (permissions.columns && Array.isArray(permissions.columns)) {
            setColumnPermissions(permissions.columns)
        } else {
            console.error("Invalid column permissions format:", permissions.columns)
            setColumnPermissions([])
        }
    }, [permissions, permissionsLoading, navigate])

    useEffect(() => {
        const fetchDropdowns = async () => {
            setLoading(true)
            try {
                // Fetch dropdown data
                const response = await getAddIncoming()
                setDropdowns(response.dropdowns)

                // Fetch edit data using the id
                const editDataForm = await getEditIncoming(id)
                const editData = editDataForm.data.data

                if (editData.is_sent_to_pending) {
                    navigate(`/incoming`)
                }

                // Map response to formData structure
                const mappedFormData = {
                    source: editData.source || { dropdown_data: "", value: "" },
                    cm_first_name: editData.cm_first_name || "",
                    cm_last_name: editData.cm_last_name || "",
                    cm_phone: editData.cm_phone || "",
                    alternate_phone: editData.alternate_phone || "",
                    agent_name: editData.agent_name || { dropdown_data: "", value: "" },
                    language: editData.language || { dropdown_data: "", value: "" },
                    disease: editData.disease || { dropdown_data: "", value: "" },
                    age: editData.age || "",
                    height: editData.height || "",
                    weight: editData.weight || "",
                    state: editData.state || { dropdown_data: "", value: "" },
                    city: editData.city || "",
                    remark: editData.remark || { dropdown_data: "", value: "" },
                    comment: editData.comment || "",
                    is_sent_to_pending: editData.is_sent_to_pending || false,
                }

                // Set formData with mapped values
                setFormData(mappedFormData)
            } catch (error) {
                toast.error("Failed to load data")
            } finally {
                setLoading(false)
            }
        }

        fetchDropdowns()
    }, [id, setLoading])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleDropdownChange = (e, key) => {
        const value = e.target.value

        setFormData((prev) => ({
            ...prev,
            [key]: {
                dropdown_data: dropdowns[key]?.id || "",
                value,
            },
        }))
    }

    const validateForm = () => {
        let isValid = true
        const phoneRegex = /^\d{10}$/

        // Only validate fields that the user has permission to edit
        Object.entries(formData).forEach(([key, value]) => {
            if (
                key !== "alternate_phone" &&
                hasColumnPermission(key) &&
                typeof value === "object" &&
                (value.value === null || value.value === "")
            ) {
                toast.error(`${key.replace(/_/g, " ")} is required`)
                isValid = false
            } else if (
                key !== "alternate_phone" &&
                hasColumnPermission(key) &&
                typeof value === "string" &&
                value.trim() === ""
            ) {
                toast.error(`${key.replace(/_/g, " ")} is required`)
                isValid = false
            }
        })

        if (hasColumnPermission("cm_phone") && !phoneRegex.test(formData.cm_phone)) {
            toast.error("Phone number must be 10 digits")
            isValid = false
        }

        if (
            hasColumnPermission("alternate_phone") &&
            formData.alternate_phone &&
            !phoneRegex.test(formData.alternate_phone)
        ) {
            toast.error("Alternate phone number must be 10 digits")
            isValid = false
        }

        return isValid
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) {
            return
        }

        setLoading(true)
        try {
            const response = await updateEditIncoming(id, formData)
            toast.success("Data updated successfully!")
            navigate("/incoming")
        } catch (error) {
            toast.error("Error submitting form")
        } finally {
            setLoading(false)
        }
    }

    if (loading || permissionsLoading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-stone-600" />
                    <p className="text-lg font-medium text-stone-700">Loading your content...</p>
                    <p className="text-sm text-stone-500">This may take a few moments</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-stone-100 text-stone-700 p-4">
            <div className="max-w-7xl mx-auto">
                <Card className="bg-stone-50 shadow-sm border-t-4 border-t-stone-300">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center space-x-2 mb-8">
                            <UserCircle className="w-8 h-8 text-stone-500" />
                            <h1 className="text-2xl font-bold text-stone-700">Edit Incoming Data</h1>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Information Section */}
                            {(hasColumnPermission("cm_first_name") ||
                                hasColumnPermission("cm_last_name") ||
                                hasColumnPermission("age") ||
                                hasColumnPermission("height") ||
                                hasColumnPermission("weight")) && (
                                    <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
                                        <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
                                            <User2 className="w-5 h-5 mr-2 text-stone-500" />
                                            Personal Information
                                        </h2>
                                        <div className="grid sm:grid-cols-3 gap-6">
                                            {hasColumnPermission("cm_first_name") && (
                                                <div>
                                                    <Label htmlFor="cm_first_name" className="text-stone-600">
                                                        First Name *
                                                    </Label>
                                                    <Input
                                                        id="cm_first_name"
                                                        name="cm_first_name"
                                                        value={formData.cm_first_name}
                                                        onChange={handleChange}
                                                        className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
                                                        required
                                                    />
                                                </div>
                                            )}
                                            {hasColumnPermission("cm_last_name") && (
                                                <div>
                                                    <Label htmlFor="cm_last_name" className="text-stone-600">
                                                        Last Name *
                                                    </Label>
                                                    <Input
                                                        id="cm_last_name"
                                                        name="cm_last_name"
                                                        value={formData.cm_last_name}
                                                        onChange={handleChange}
                                                        className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
                                                        required
                                                    />
                                                </div>
                                            )}
                                            {hasColumnPermission("age") && (
                                                <div>
                                                    <Label htmlFor="age" className="text-stone-600">
                                                        Age *
                                                    </Label>
                                                    <Input
                                                        id="age"
                                                        name="age"
                                                        value={formData.age}
                                                        onChange={handleChange}
                                                        className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
                                                        type="number"
                                                        required
                                                    />
                                                </div>
                                            )}
                                            {hasColumnPermission("height") && (
                                                <div>
                                                    <Label htmlFor="height" className="text-stone-600">
                                                        Height *
                                                    </Label>
                                                    <Input
                                                        id="height"
                                                        name="height"
                                                        value={formData.height}
                                                        onChange={handleChange}
                                                        className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
                                                        type="number"
                                                        required
                                                    />
                                                </div>
                                            )}
                                            {hasColumnPermission("weight") && (
                                                <div>
                                                    <Label htmlFor="weight" className="text-stone-600">
                                                        Weight *
                                                    </Label>
                                                    <Input
                                                        id="weight"
                                                        name="weight"
                                                        value={formData.weight}
                                                        onChange={handleChange}
                                                        className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
                                                        type="number"
                                                        required
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Contact Information Section */}
                            {(hasColumnPermission("cm_phone") ||
                                hasColumnPermission("alternate_phone") ||
                                hasColumnPermission("state") ||
                                hasColumnPermission("city")) && (
                                    <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
                                        <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
                                            <Phone className="w-5 h-5 mr-2 text-stone-500" />
                                            Contact Information
                                        </h2>
                                        <div className="grid sm:grid-cols-3 gap-6">
                                            {hasColumnPermission("cm_phone") && (
                                                <div>
                                                    <Label htmlFor="cm_phone" className="text-stone-600">
                                                        Phone *
                                                    </Label>
                                                    <Input
                                                        id="cm_phone"
                                                        name="cm_phone"
                                                        value={formData.cm_phone}
                                                        onChange={handleChange}
                                                        className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
                                                        required
                                                        pattern="\d{10}"
                                                        title="Phone number must be 10 digits"
                                                    />
                                                </div>
                                            )}
                                            {hasColumnPermission("alternate_phone") && (
                                                <div>
                                                    <Label htmlFor="alternate_phone" className="text-stone-600">
                                                        Alternate Number
                                                    </Label>
                                                    <Input
                                                        id="alternate_phone"
                                                        name="alternate_phone"
                                                        value={formData.alternate_phone}
                                                        onChange={handleChange}
                                                        className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
                                                        pattern="\d{10}"
                                                        title="Alternate phone number must be 10 digits"
                                                    />
                                                </div>
                                            )}
                                            {hasColumnPermission("state") && (
                                                <div>
                                                    <Label htmlFor="state" className="text-stone-600">
                                                        State *
                                                    </Label>
                                                    <select
                                                        id="state"
                                                        value={formData.state.value}
                                                        onChange={(e) => handleDropdownChange(e, "state")}
                                                        className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 text-stone-700"
                                                        required
                                                    >
                                                        <option value="">Select state</option>
                                                        {dropdowns.state?.values?.map((item) => (
                                                            <option key={item} value={item}>
                                                                {item}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            {hasColumnPermission("city") && (
                                                <div>
                                                    <Label htmlFor="city" className="text-stone-600">
                                                        City/Town/Village *
                                                    </Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        className="mt-1.5 bg-stone-50 border-stone-300 text-stone-700"
                                                        required
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Additional Information Section */}
                            {(hasColumnPermission("source") ||
                                hasColumnPermission("agent_name") ||
                                hasColumnPermission("language") ||
                                hasColumnPermission("disease") ||
                                hasColumnPermission("remark")) && (
                                    <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
                                        <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
                                            <Building2 className="w-5 h-5 mr-2 text-stone-500" />
                                            Additional Information
                                        </h2>
                                        <div className="grid sm:grid-cols-3 gap-6">
                                            {hasColumnPermission("source") && (
                                                <div>
                                                    <Label htmlFor="source" className="text-stone-600">
                                                        Source *
                                                    </Label>
                                                    <select
                                                        id="source"
                                                        value={formData.source.value}
                                                        onChange={(e) => handleDropdownChange(e, "source")}
                                                        className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 text-stone-700"
                                                        required
                                                    >
                                                        <option value="">Select source</option>
                                                        {dropdowns.source?.values?.map((item) => (
                                                            <option key={item} value={item}>
                                                                {item}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            {hasColumnPermission("agent_name") && (
                                                <div>
                                                    <Label htmlFor="agent_name" className="text-stone-600">
                                                        Agent Name *
                                                    </Label>
                                                    <select
                                                        id="agent_name"
                                                        value={formData.agent_name.value}
                                                        onChange={(e) => handleDropdownChange(e, "agent_name")}
                                                        className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 text-stone-700"
                                                        required
                                                    >
                                                        <option value="">Select agent</option>
                                                        {dropdowns["agent_name"]?.values?.map((item) => (
                                                            <option key={item} value={item}>
                                                                {item}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            {hasColumnPermission("language") && (
                                                <div>
                                                    <Label htmlFor="language" className="text-stone-600">
                                                        Language *
                                                    </Label>
                                                    <select
                                                        id="language"
                                                        value={formData.language.value}
                                                        onChange={(e) => handleDropdownChange(e, "language")}
                                                        className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 text-stone-700"
                                                        required
                                                    >
                                                        <option value="">Select language</option>
                                                        {dropdowns.language?.values?.map((item) => (
                                                            <option key={item} value={item}>
                                                                {item}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            {hasColumnPermission("disease") && (
                                                <div>
                                                    <Label htmlFor="disease" className="text-stone-600">
                                                        Disease *
                                                    </Label>
                                                    <select
                                                        id="disease"
                                                        value={formData.disease.value}
                                                        onChange={(e) => handleDropdownChange(e, "disease")}
                                                        className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 text-stone-700"
                                                        required
                                                    >
                                                        <option value="">Select disease</option>
                                                        {dropdowns.disease?.values?.map((item) => (
                                                            <option key={item} value={item}>
                                                                {item}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            {hasColumnPermission("remark") && (
                                                <div>
                                                    <Label htmlFor="remark" className="text-stone-600">
                                                        Remark *
                                                    </Label>
                                                    <select
                                                        id="remark"
                                                        value={formData.remark.value}
                                                        onChange={(e) => handleDropdownChange(e, "remark")}
                                                        className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 text-stone-700"
                                                        required
                                                    >
                                                        <option value="">Select remark</option>
                                                        {dropdowns.remark?.values?.map((item) => (
                                                            <option key={item} value={item}>
                                                                {item}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Comments Section */}
                            {hasColumnPermission("comment") && (
                                <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
                                    <Label htmlFor="comment" className="text-lg font-semibold text-stone-600 flex items-center">
                                        <MessageSquare className="w-5 h-5 mr-2 text-stone-500" />
                                        Comments *
                                    </Label>
                                    <textarea
                                        id="comment"
                                        name="comment"
                                        value={formData.comment}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400/50 resize-none text-stone-700"
                                        placeholder="Add your comments here..."
                                        required
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-stone-600 hover:bg-stone-700 text-white font-semibold py-3 text-lg flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : "Submit Information"}
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default EditIncomingData
