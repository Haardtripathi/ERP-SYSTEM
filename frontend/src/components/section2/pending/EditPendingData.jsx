import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { create } from "zustand"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import {
    Loader2,
    UserCircle,
    Phone,
    MapPin,
    MessageSquare,
    Package2,
    Building2,
    CreditCard,
    Trash2,
    Plus,
} from "lucide-react"
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
        amount: {
            dropdown_data: "",
            value: "",
            isManual: false, // Add flag to track input method
        },
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
        products: { dropdown_data: "", value: [{ product: "", quantity: "", product_id: "" }], total: 0 },
        ref: "",
        remark: { dropdown_data: "", value: "" },
        sale_type: { dropdown_data: "", value: "" },
        shipment_type: { dropdown_data: "", value: "", hub_id: "" },
        source: { dropdown_data: "", value: "" },
        status: { dropdown_data: "", value: "" },
        district: "",
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
                    products: editData.products || { dropdown_data: "", value: [{ product: "", quantity: "", product_id: "" }], total: 0 },
                    ref: editData.ref || "",
                    remark: editData.remark || { dropdown_data: "", value: "" },
                    sale_type: editData.sale_type || { dropdown_data: "", value: "" },
                    shipment_type: editData.shipment_type || { dropdown_data: "", value: "", hub_id: "" },
                    source: editData.source || { dropdown_data: "", value: "" },
                    status: editData.status || { dropdown_data: "", value: "" },
                    district: editData.district || "",
                }
                // (mappedFormData)
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

    const handleDropdownChange = (e, field) => {
        const value = e.target.value

        setFormData((prevData) => {
            const updatedData = {
                ...prevData,
                [field]: {
                    dropdown_data: dropdowns[field]?.id || "",
                    value,
                },
            }

            if (field === "shipment_type") {
                if (value == "Indian Post") {
                    updatedData.shipment_type.hub_id = "54558"

                }
                if (value == "Bluedart" || value == "Delhivery") {
                    updatedData.shipment_type.hub_id = "171228"

                }
                if (value == "F2F") {
                    updatedData.shipment_type.hub_id = "-"

                }
            }

            // Reset post_type and post if shipment_type is not "Indian Post"
            if (field === "shipment_type" && value !== "Indian Post") {
                updatedData.post_type = null
                updatedData.post = null
            }

            return updatedData
        })
    }

    const addProduct = () => {
        setFormData((prevState) => ({
            ...prevState,
            products: {
                ...prevState.products,
                value: [...prevState.products.value, { product: "", quantity: "", product_id: "" }],
            },
        }))
    }

    const removeProduct = (index) => {
        const updatedProducts = formData.products.value.filter((_, i) => i !== index)
        setFormData((prevState) => ({
            ...prevState,
            products: {
                ...prevState.products,
                value: updatedProducts,
            },
        }))
    }

    const validateForm = () => {
        let isValid = true
        const phoneRegex = /^\d{10}$/
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        Object.entries(formData).forEach(([key, value]) => {
            if (
                key !== "alternate_phone" &&
                key !== "email" &&
                typeof value === "object" &&
                (value.value === null || value.value === "")
            ) {
                toast.error(`${key.replace(/_/g, " ")} is required`)
                isValid = false
            } else if (key !== "alternate_phone" && key !== "email" && typeof value === "string" && value.trim() === "") {
                toast.error(`${key.replace(/_/g, " ")} is required`)
                isValid = false
            }
        })

        if (
            formData.products.value.length === 0 ||
            formData.products.value.some((product) => !product.product || !product.quantity)
        ) {
            toast.error("Please fill in all product details")
            isValid = false
        }

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

    const handleAmountChange = (e) => {
        const value = e.target.value

        if (e.target.type === "select-one") {
            if (value === "manual") {
                setFormData((prev) => ({
                    ...prev,
                    amount: {
                        dropdown_data: "",
                        value: "",
                        isManual: true,
                    },
                }))
            } else {
                setFormData((prev) => ({
                    ...prev,
                    amount: {
                        dropdown_data: dropdowns.amount?.id || "",
                        value: value,
                        isManual: false,
                    },
                }))
            }
        } else {
            // Handle manual input
            setFormData((prev) => ({
                ...prev,
                amount: {
                    dropdown_data: dropdowns.amount?.id || "",
                    value: value,
                    isManual: true,
                },
            }))
        }
    }

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...formData.products.value];

        // Update the field value
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]: value,
        };

        // Find product details from productExtra
        const selectedProduct = updatedProducts[index].product;
        if (selectedProduct && dropdowns.products?.productExtra[selectedProduct]) {
            updatedProducts[index].product_id = dropdowns.products?.productExtra[selectedProduct].product_id;
            updatedProducts[index].price = dropdowns.products?.productExtra[selectedProduct].price;
        }

        // Calculate total
        const total = updatedProducts.reduce((acc, product) => {
            const quantity = Number(product.quantity) || 0;
            const price = Number(product.price) || 0;
            return acc + quantity * price;
        }, 0);

        // Update formData state
        setFormData((prev) => ({
            ...prev,
            products: {
                dropdown_data: dropdowns.products?.id || "",
                value: updatedProducts,
                total: total, // Update total price
            },
        }));

    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        // if (!validateForm()) {
        //     return
        // }
        setLoading(true)
        try {
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
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="mt-1.5 bg-stone-50 border-stone-300"
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
                                            City/Town/Village *
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
                                        <Label htmlFor="district" className="text-stone-600">
                                            District *
                                        </Label>
                                        <Input
                                            id="district"
                                            name="district"
                                            value={formData.district}
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

                            {/* Product Information */}
                            <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
                                    <Package2 className="w-5 h-5 mr-2 text-stone-500" />
                                    Product Information
                                </h2>
                                <div className="space-y-4">
                                    {formData.products.value.map((product, index) => (
                                        <div key={index} className="grid sm:grid-cols-3 gap-6 items-end">
                                            <div>
                                                <Label htmlFor={`product-${index}`}>Product *</Label>
                                                <select
                                                    id={`product-${index}`}
                                                    value={product.product}
                                                    onChange={(e) => handleProductChange(index, "product", e.target.value)}
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
                                                <Label htmlFor={`quantity-${index}`} className="text-stone-600">
                                                    Quantity *
                                                </Label>
                                                <Input
                                                    id={`quantity-${index}`}
                                                    value={product.quantity}
                                                    onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                                                    className="mt-1.5 bg-stone-50 border-stone-300"
                                                    required
                                                />
                                            </div>
                                            {index > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => removeProduct(index)}
                                                    className="h-10 w-10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addProduct} className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" /> Add Product
                                    </Button>
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
                                        <Label htmlFor="amount">Amount *</Label>
                                        <div className="w-full mt-1.5">
                                            {dropdowns.amount?.values?.length > 0 && !formData.amount.isManual ? (
                                                <select
                                                    id="amount"
                                                    value={formData.amount.value}
                                                    onChange={handleAmountChange}
                                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-md"
                                                    required
                                                >
                                                    <option value="">Select amount</option>
                                                    {dropdowns.amount.values.map((item) => (
                                                        <option key={item} value={item}>
                                                            {item}
                                                        </option>
                                                    ))}
                                                    <option value="manual">Enter manually</option>
                                                </select>
                                            ) : (
                                                <Input
                                                    type="number"
                                                    id="amount"
                                                    value={formData.amount.value}
                                                    onChange={handleAmountChange}
                                                    className="w-full mt-2 px-3 py-2 bg-stone-50 border border-stone-300"
                                                    placeholder="Enter amount"
                                                    required
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Details */}
                            <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-stone-600 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2 text-stone-500" />
                                    Shipping Details
                                </h2>
                                <div className="grid sm:grid-cols-3 gap-6">
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
                                    {formData.shipment_type.value === "Indian Post" && (
                                        <>
                                            <div>
                                                <Label htmlFor="post_type" className="text-stone-600">
                                                    Post Type *
                                                </Label>
                                                <select
                                                    id="post_type"
                                                    value={formData.post_type?.value || ""}
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
                                                    value={formData.post || ""}
                                                    onChange={handleChange}
                                                    className="mt-1.5 bg-stone-50 border-stone-300"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
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
                                            disabled
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
                                            disabled
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

