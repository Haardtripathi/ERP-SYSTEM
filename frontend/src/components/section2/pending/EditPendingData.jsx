// import React, { useState, useEffect } from "react"
// import { getEditPending } from "@/services/pendingService"
// import { useParams } from "react-router-dom";

// const EditPendingData = () => {
//     const { id } = useParams();

//     useEffect(() => {
//         const fetchData = async () => {
//             await getEditPending(id)

//         }

//         fetchData()
//     })
//     return (
//         <div>
//             EditPendingData
//         </div>
//     )
// }

// export default EditPendingData

import React, { useState, useEffect } from "react"
import { toast, Toaster } from "react-hot-toast"
import { create } from "zustand"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { Loader2, UserCircle, Phone, MapPin, MessageSquare, Package2, Building2, CreditCard } from "lucide-react"
import { useParams } from "react-router-dom"
import { getEditPending, getDropdownData, updateEditPending } from "@/services/pendingService"

const useStore = create((set) => ({
    loading: false,
    setLoading: (loading) => set({ loading }),
}))

export default function EditPendingData() {
    const { id } = useParams()
    const { loading, setLoading } = useStore()
    const [dropdowns, setDropdowns] = useState({})
    const [formData, setFormData] = useState({
        data: "",
        dataId: "",
        address: "",
        agent_name: { dropdown_data: "", value: "" },
        alternate_phone: "",
        amount: "",
        city: "",
        state: { dropdown_data: "", value: "" },

        cm_first_name: "",
        cm_last_name: "",
        cm_phone: "",
        comment: "",
        disease: { dropdown_data: "", value: "" },
        email: "",
        payment_type: { dropdown_data: "", value: "" },
        pincode: "",
        post: "",
        post_type: { dropdown_data: "", value: "" },
        products: { dropdown_data: "", value: "" },
        quantity: "",
        ref: "",
        remark: { dropdown_data: "", value: "" },
        sale_type: { dropdown_data: "", value: "" },
        shipment_type: { dropdown_data: "", value: "" },
        source: { dropdown_data: "", value: "" },
        status: { dropdown_data: "", value: "" },
        sub_district_taluka: "",
    })
    const navigate = useNavigate()

    useEffect(() => {
        const fetchDropdowns = async () => {
            setLoading(true)
            try {
                // Fetch dropdown data
                const response = await getDropdownData()
                setDropdowns(response.data.dropdowns)

                // Fetch edit data using the id
                const editDataForm = await getEditPending(id)
                const editData = editDataForm.data.data

                // Map response to formData structure
                const mappedFormData = {
                    data: editData.data || "",
                    dataId: editData.dataId || "",
                    address: editData.address || "",
                    agent_name: editData.agent_name || { dropdown_data: "", value: "" },
                    alternate_phone: editData.alternate_phone || "",
                    amount: editData.amount || { dropdown_data: "", value: "" },
                    city: editData.city || "",
                    state: editData.state || { dropdown_data: "", value: "" },

                    cm_first_name: editData.cm_first_name || "",
                    cm_last_name: editData.cm_last_name || "",
                    cm_phone: editData.cm_phone || "",
                    comment: editData.comment || "",
                    disease: editData.disease || { dropdown_data: "", value: "" },
                    email: editData.email || "",
                    payment_type: editData.payment_type || { dropdown_data: "", value: "" },
                    pincode: editData.pincode || "",
                    post: editData.post || "",
                    post_type: editData.post_type || { dropdown_data: "", value: "" },
                    products: editData.products || { dropdown_data: "", value: "" },
                    quantity: editData.quantity || "",
                    ref: editData.ref || "",
                    remark: editData.remark || { dropdown_data: "", value: "" },
                    sale_type: editData.sale_type || { dropdown_data: "", value: "" },
                    shipment_type: editData.shipment_type || { dropdown_data: "", value: "" },
                    source: editData.source || { dropdown_data: "", value: "" },
                    status: editData.status || { dropdown_data: "", value: "" },
                    sub_district_taluka: editData.sub_district_taluka || "",
                }

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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        Object.entries(formData).forEach(([key, value]) => {
            console.log(key, value, typeof value)
            if (key !== "alternate_phone" && typeof value === "object" && (value.value === null || value.value === "")) {
                toast.error(`${key.replace(/_/g, " ")} is required`)
                isValid = false
            } else if (key !== "alternate_phone" && typeof value === "string" && value.trim() === "") {
                toast.error(`${key.replace(/_/g, " ")} is required`)
                isValid = false
            }
        })

        if (!phoneRegex.test(formData.cm_phone)) {
            toast.error("Phone number must be 10 digits")
            isValid = false
        }

        if (formData.alternate_phone && !phoneRegex.test(formData.alternate_phone)) {
            toast.error("Alternate phone number must be 10 digits")
            isValid = false
        }

        if (formData.email && !emailRegex.test(formData.email)) {
            toast.error("Invalid email format")
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
            console.log("ABC")
            const response = await updateEditPending(id, formData)
            toast.success("Data updated successfully!")
            navigate("/pending")
        } catch (error) {
            toast.error("Error submitting form")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
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
                            <h1 className="text-2xl font-bold text-stone-700">Edit Pending Data</h1>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Information Section */}
                            <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
                                    <UserCircle className="w-5 h-5 mr-2 text-stone-500" />
                                    Personal Information
                                </h2>
                                <div className="grid sm:grid-cols-3 gap-6">
                                    <div>
                                        <Label htmlFor="cm_first_name" className="text-stone-600">
                                            First Name *
                                        </Label>
                                        <Input
                                            id="cm_first_name"
                                            name="cm_first_name"
                                            value={formData.cm_first_name}
                                            onChange={handleChange}
                                            className="mt-1.5 bg-stone-50 border-stone-300"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="cm_last_name" className="text-stone-600">
                                            Last Name *
                                        </Label>
                                        <Input
                                            id="cm_last_name"
                                            name="cm_last_name"
                                            value={formData.cm_last_name}
                                            onChange={handleChange}
                                            className="mt-1.5 bg-stone-50 border-stone-300"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="text-stone-600">
                                            Email *
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="mt-1.5 bg-stone-50 border-stone-300"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
                                    <Phone className="w-5 h-5 mr-2 text-stone-500" />
                                    Contact Information
                                </h2>
                                <div className="grid sm:grid-cols-3 gap-6">
                                    <div>
                                        <Label htmlFor="cm_phone" className="text-stone-600">
                                            Phone *
                                        </Label>
                                        <Input
                                            id="cm_phone"
                                            name="cm_phone"
                                            value={formData.cm_phone}
                                            onChange={handleChange}
                                            className="mt-1.5 bg-stone-50 border-stone-300"
                                            required
                                            pattern="\d{10}"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="alternate_phone" className="text-stone-600">
                                            Alternate Phone
                                        </Label>
                                        <Input
                                            id="alternate_phone"
                                            name="alternate_phone"
                                            value={formData.alternate_phone}
                                            onChange={handleChange}
                                            className="mt-1.5 bg-stone-50 border-stone-300"
                                            pattern="\d{10}"

                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="pincode" className="text-stone-600">
                                            Pincode *
                                        </Label>
                                        <Input
                                            id="pincode"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="mt-1.5 bg-stone-50 border-stone-300"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-stone-500" />
                                    Address Details
                                </h2>
                                <div className="grid sm:grid-cols-3 gap-6">
                                    <div className="sm:col-span-3">
                                        <Label htmlFor="address" className="text-stone-600">
                                            Address *
                                        </Label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="city" className="text-stone-600">
                                            City *
                                        </Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="mt-1.5 bg-stone-50 border-stone-300"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="sub_district_taluka" className="text-stone-600">
                                            Sub District/Taluka *
                                        </Label>
                                        <Input
                                            id="sub_district_taluka"
                                            name="sub_district_taluka"
                                            value={formData.sub_district_taluka}
                                            onChange={handleChange}
                                            className="mt-1.5 bg-stone-50 border-stone-300"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="state" className="text-stone-600">
                                            State *
                                        </Label>
                                        <select
                                            id="state"
                                            value={formData.state.value}
                                            onChange={(e) => handleDropdownChange(e, "state")}
                                            className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
                                            required
                                        >
                                            <option value="">Select State</option>
                                            {dropdowns.state?.values?.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Product Information */}
                            <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
                                    <Package2 className="w-5 h-5 mr-2 text-stone-500" />
                                    Product Information
                                </h2>
                                <div className="grid sm:grid-cols-3 gap-6">
                                    <div>
                                        <Label htmlFor="products" className="text-stone-600">
                                            Products *
                                        </Label>
                                        <select
                                            id="products"
                                            value={formData.products.value}
                                            onChange={(e) => handleDropdownChange(e, "products")}
                                            className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
                                            required
                                        >
                                            <option value="">Select product</option>
                                            {dropdowns.products?.values?.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="quantity" className="text-stone-600">
                                            Quantity *
                                        </Label>
                                        <Input
                                            id="quantity"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className="mt-1.5 bg-stone-50 border-stone-300"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="amount" className="text-stone-600">
                                            Amount *
                                        </Label>
                                        <select
                                            id="amount"
                                            value={formData.amount.value}
                                            onChange={(e) => handleDropdownChange(e, "amount")}
                                            className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
                                            required
                                        >
                                            <option value="">Select amount</option>
                                            {dropdowns.amount?.values?.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>


                                    {/* <div>
                                        <Label htmlFor="amount" className="text-stone-600">
                                            Amount *
                                        </Label>
                                        <Input
                                            id="amount"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            className="mt-1.5 bg-stone-50 border-stone-300"
                                            type="number"
                                            required
                                        />
                                    </div> */}
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2 text-stone-500" />
                                    Order Details
                                </h2>
                                <div className="grid sm:grid-cols-3 gap-6">
                                    <div>
                                        <Label htmlFor="post_type" className="text-stone-600">
                                            Post Type *
                                        </Label>
                                        <select
                                            id="post_type"
                                            value={formData.post_type.value}
                                            onChange={(e) => handleDropdownChange(e, "post_type")}
                                            className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
                                            required
                                        >
                                            <option value="">Select Post Type</option>
                                            {dropdowns.post_type?.values?.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="post" className="text-stone-600">
                                            Post *
                                        </Label>
                                        <Input
                                            id="post"
                                            name="post"
                                            value={formData.post}
                                            onChange={handleChange}
                                            className="mt-1.5 bg-stone-50 border-stone-300"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="payment_type" className="text-stone-600">
                                            Payment Type *
                                        </Label>
                                        <select
                                            id="payment_type"
                                            value={formData.payment_type.value}
                                            onChange={(e) => handleDropdownChange(e, "payment_type")}
                                            className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
                                            required
                                        >
                                            <option value="">Select payment type</option>
                                            {dropdowns.payment_type?.values?.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="sale_type" className="text-stone-600">
                                            Sale Type *
                                        </Label>
                                        <select
                                            id="sale_type"
                                            value={formData.sale_type.value}
                                            onChange={(e) => handleDropdownChange(e, "sale_type")}
                                            className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
                                            required
                                        >
                                            <option value="">Select sale type</option>
                                            {dropdowns.sale_type?.values?.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="shipment_type" className="text-stone-600">
                                            Shipment Type *
                                        </Label>
                                        <select
                                            id="shipment_type"
                                            value={formData.shipment_type.value}
                                            onChange={(e) => handleDropdownChange(e, "shipment_type")}
                                            className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
                                            required
                                        >
                                            <option value="">Select shipment type</option>
                                            {dropdowns.shipment_type?.values?.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
                                    <Building2 className="w-5 h-5 mr-2 text-stone-500" />
                                    Additional Information
                                </h2>
                                <div className="grid sm:grid-cols-3 gap-6">
                                    <div>
                                        <Label htmlFor="agent_name" className="text-stone-600">
                                            Agent Name *
                                        </Label>
                                        <select
                                            id="agent_name"
                                            value={formData.agent_name.value}
                                            onChange={(e) => handleDropdownChange(e, "agent_name")}
                                            className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
                                            required
                                        >
                                            <option value="">Select agent</option>
                                            {dropdowns.agent_name?.values?.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="source" className="text-stone-600">
                                            Source *
                                        </Label>
                                        <select
                                            id="source"
                                            value={formData.source.value}
                                            onChange={(e) => handleDropdownChange(e, "source")}
                                            className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
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
                                    <div>
                                        <Label htmlFor="status" className="text-stone-600">
                                            Status *
                                        </Label>
                                        <select
                                            id="status"
                                            value={formData.status.value}
                                            onChange={(e) => handleDropdownChange(e, "status")}
                                            className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
                                            required
                                        >
                                            <option value="">Select status</option>
                                            {dropdowns.status?.values?.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="disease" className="text-stone-600">
                                            Disease *
                                        </Label>
                                        <select
                                            id="disease"
                                            value={formData.disease.value}
                                            onChange={(e) => handleDropdownChange(e, "disease")}
                                            className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
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
                                    <div>
                                        <Label htmlFor="remark" className="text-stone-600">
                                            Remark *
                                        </Label>
                                        <select
                                            id="remark"
                                            value={formData.remark.value}
                                            onChange={(e) => handleDropdownChange(e, "remark")}
                                            className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
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
                                </div>
                            </div>

                            {/* Comments Section */}
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
                                    className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-md resize-none"
                                    placeholder="Add your comments here..."
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-stone-600 hover:bg-stone-700 text-white font-semibold py-3 text-lg"
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

