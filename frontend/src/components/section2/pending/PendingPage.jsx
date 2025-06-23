

// "use client"

// import React, { useState, useEffect, useCallback } from "react"
// import { getAllPending, deletePending, issuePending, sendToConfirmed } from "@/services/pendingService"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { toast } from "react-hot-toast"
// import { RotateCw, SendHorizontal } from "lucide-react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"
// import {
//     Pagination,
//     PaginationContent,
//     PaginationItem,
//     PaginationLink,
//     PaginationNext,
//     PaginationPrevious,
//     PaginationEllipsis,
// } from "@/components/ui/pagination"
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogFooter,
// } from "@/components/ui/dialog"
// import { Loader2, Search, Trash2, Forward, RefreshCcw } from "lucide-react"
// import { useNavigate } from "react-router-dom"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// const Table = ({ children }) => (
//     <div className="overflow-x-auto">
//         <table className="w-full border-collapse min-w-max">{children}</table>
//     </div>
// )

// const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

// const TableRow = ({ children, className }) => <tr className={`${className} hover:bg-gray-100`}>{children}</tr>

// const TableHead = ({ children, className }) => (
//     <th
//         className={`${className} p-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-300 bg-gray-200 sticky top-0 z-10`}
//     >
//         {children}
//     </th>
// )

// const TableBody = ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>

// const TableCell = ({ children, className }) => (
//     <td className={`${className} p-3 text-sm text-gray-700 break-words max-w-[200px]`}>{children}</td>
// )

// const PendingPage = () => {
//     const [pendingData, setPendingData] = useState([])
//     const [filteredData, setFilteredData] = useState([])
//     const [currentPage, setCurrentPage] = useState(1)
//     const [itemsPerPage] = useState(10)
//     const [totalPages, setTotalPages] = useState(1)
//     const [isLoading, setIsLoading] = useState(true)
//     const [error, setError] = useState(null)
//     const [searchTerm, setSearchTerm] = useState("")
//     const [selectedItem, setSelectedItem] = useState(null)
//     const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
//     const [paginatedData, setPaginatedData] = useState([])
//     const [searchColumn, setSearchColumn] = useState("all")
//     const [goToPage, setGoToPage] = useState("")
//     const [refreshing, setRefreshing] = useState(false)


//     const navigate = useNavigate()

//     const fetchData = useCallback(async () => {
//         try {
//             setIsLoading(true)
//             const response = await getAllPending()
//             setPendingData(response.data.data)
//             setFilteredData(response.data.data)
//             setTotalPages(Math.ceil(response.data.data.length / itemsPerPage))
//         } catch (error) {
//             console.error("Error fetching pending data:", error)
//             setError("Failed to fetch data. Please try again later.")
//         } finally {
//             setIsLoading(false)
//         }
//     }, [itemsPerPage])

//     useEffect(() => {
//         fetchData()
//     }, [fetchData])
//     const refreshData = async () => {
//         setRefreshing(true)
//         await fetchData()
//         setRefreshing(false)
//         toast.success("Data refreshed successfully")
//     }


//     // const applyFiltersAndPaginate = useCallback(() => {
//     //     const results = pendingData.filter((item) => {
//     //         if (searchColumn === "all") {
//     //             return Object.values(item).some(
//     //                 (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()),
//     //             )
//     //         } else {
//     //             const value = item[searchColumn]
//     //             if (typeof value === "string") {
//     //                 return value.toLowerCase().includes(searchTerm.toLowerCase())
//     //             } else if (typeof value === "object" && value !== null && "value" in value) {
//     //                 return value.value.toLowerCase().includes(searchTerm.toLowerCase())
//     //             }
//     //             return false
//     //         }
//     //     })
//     //     setFilteredData(results)
//     //     const newTotalPages = Math.ceil(results.length / itemsPerPage)
//     //     setTotalPages(newTotalPages)

//     //     const startIndex = (currentPage - 1) * itemsPerPage
//     //     setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
//     // }, [pendingData, searchTerm, searchColumn, itemsPerPage, currentPage])
//     const applyFiltersAndPaginate = useCallback(() => {
//         const results = pendingData.filter((item) => {
//             if (searchColumn === "all") {
//                 return Object.values(item).some(
//                     (val) =>
//                         val !== null &&
//                         val !== undefined &&
//                         typeof val === "string" &&
//                         val.toLowerCase().includes(searchTerm.toLowerCase()),
//                 )
//             } else {
//                 const value = item[searchColumn]
//                 if (value === null || value === undefined) return false // Handle null/undefined

//                 if (typeof value === "string") {
//                     return value.toLowerCase().includes(searchTerm.toLowerCase())
//                 } else if (typeof value === "object" && "value" in value && typeof value.value === "string") {
//                     return value.value.toLowerCase().includes(searchTerm.toLowerCase())
//                 }
//                 return false
//             }
//         })

//         setFilteredData(results)
//         const newTotalPages = Math.ceil(results.length / itemsPerPage)
//         setTotalPages(newTotalPages)

//         const startIndex = (currentPage - 1) * itemsPerPage
//         setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
//     }, [pendingData, searchTerm, searchColumn, itemsPerPage, currentPage])


//     useEffect(() => {
//         applyFiltersAndPaginate()
//     }, [applyFiltersAndPaginate])

//     const handleDelete = async (id, dataId, data) => {
//         try {
//             await deletePending(id, dataId, data)
//             toast.success("Data deleted successfully")
//             setPendingData((prevData) => prevData.filter((item) => item._id !== id))
//             applyFiltersAndPaginate()
//         } catch (error) {
//             console.error("Error deleting item:", error)
//             setError("Failed to delete item. Please try again.")
//         }
//     }

//     const handleGoToPage = () => {
//         const pageNumber = Number.parseInt(goToPage, 10)
//         if (pageNumber >= 1 && pageNumber <= totalPages) {
//             setCurrentPage(pageNumber)
//             setGoToPage("")
//         } else {
//             toast.error(`Please enter a valid page number between 1 and ${totalPages}`)
//         }
//     }
//     const handleUpdateClick = async (id) => {
//         navigate(`/edit-pending-data/${id}`)
//     }

//     const handleSendToConfirmed = async (id, dataId, data) => {
//         const item = pendingData.find((item) => item._id === id)
//         setSelectedItem(item)
//         setIsReviewDialogOpen(true)
//     }




//     const validateForm = (formData) => {
//         let isValid = true;
//         const phoneRegex = /^\d{10}$/;
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//         // Helper function to check if a value is empty
//         const isEmpty = (value) => {
//             if (value === null || value === undefined) return true;
//             if (typeof value === "string") return value.trim() === "";
//             if (Array.isArray(value)) return value.length === 0;
//             if (typeof value === "object") return Object.keys(value).length === 0;
//             return false;
//         };

//         // Helper function to validate nested object values
//         const validateNestedValue = (obj) => {
//             if (!obj || typeof obj !== "object") return false;
//             if (obj.value === undefined || obj.value === null) return false;
//             if (typeof obj.value === "string") return obj.value.trim() !== "";
//             if (Array.isArray(obj.value)) return obj.value.length > 0;
//             return true;
//         };

//         // Check if shipment type is Indian Post
//         const isIndianPost = formData.shipment_type?.value === "Indian Post";

//         // Validate all required fields except email and alternate_phone
//         for (const [key, value] of Object.entries(formData)) {
//             // Skip optional fields
//             if (key === "alternate_phone" || key === "email") {
//                 continue;
//             }

//             // Skip post and post_type validation if shipment_type is not Indian Post
//             if ((key === "post" || key === "post_type") && !isIndianPost) {
//                 continue;
//             }

//             // Handle products array specially
//             if (key === "products") {
//                 if (!value || !value.value || !Array.isArray(value.value) || value.value.length === 0) {
//                     isValid = false;
//                     break;
//                 }
//                 // Validate each product in the array
//                 const hasInvalidProduct = value.value.some(product =>
//                     isEmpty(product) || Object.values(product).some(val => isEmpty(val))
//                 );
//                 if (hasInvalidProduct) {
//                     isValid = false;
//                     break;
//                 }
//                 continue;
//             }

//             // Handle nested objects with 'value' property
//             if (value && typeof value === "object" && 'value' in value) {
//                 if (!validateNestedValue(value)) {
//                     isValid = false;
//                     break;
//                 }
//                 continue;
//             }

//             // Handle direct string values
//             if (isEmpty(value)) {
//                 isValid = false;
//                 break;
//             }
//         }

//         // Validate required phone number
//         if (!formData.cm_phone || !phoneRegex.test(formData.cm_phone.toString())) {
//             isValid = false;
//         }

//         // Validate optional alternate phone if provided
//         if (formData.alternate_phone &&
//             !phoneRegex.test(formData.alternate_phone)) {
//             isValid = false;
//         }

//         // Validate optional email if provided
//         if (formData.email &&
//             formData.email.trim() !== "" &&
//             !emailRegex.test(formData.email)) {
//             isValid = false;
//         }

//         // Additional validation for Indian Post shipment type
//         if (isIndianPost) {
//             if (!formData.post_type?.value || formData.post_type.value.trim() === "") {
//                 isValid = false;
//             }
//             if (!formData.post?.value || formData.post.value.trim() === "") {
//                 isValid = false;
//             }
//         }

//         if (!isValid) {
//             let errorMessage = "Please fill all required fields correctly before sending to confirmed.";
//             if (isIndianPost) {
//                 errorMessage = "Please fill all required fields including post details for Indian Post shipment.";
//             }
//             toast.error(errorMessage);
//         }

//         return isValid;
//     };

//     const confirmSendToConfirmed = async () => {
//         if (selectedItem) {
//             // const isValid = validateForm(selectedItem)
//             // if (!isValid) {
//             //     setIsReviewDialogOpen(false)
//             //     return
//             // }
//             try {
//                 await sendToConfirmed(selectedItem._id)
//                 toast.success("Data sent to confirmed successfully")

//                 const updatedPendingData = pendingData.filter((item) => item._id !== selectedItem._id)
//                 setPendingData(updatedPendingData)

//                 const updatedFilteredData = filteredData.filter((item) => item._id !== selectedItem._id)
//                 setFilteredData(updatedFilteredData)

//                 const newTotalPages = Math.ceil(updatedFilteredData.length / itemsPerPage)
//                 setTotalPages(newTotalPages)

//                 // Adjust current page if necessary
//                 if (currentPage > newTotalPages) {
//                     setCurrentPage(newTotalPages || 1)
//                 } else if (
//                     currentPage === newTotalPages &&
//                     updatedFilteredData.length % itemsPerPage === 0 &&
//                     currentPage > 1
//                 ) {
//                     setCurrentPage(currentPage - 1)
//                 }

//                 applyFiltersAndPaginate()
//                 setIsReviewDialogOpen(false)
//             } catch (error) {
//                 console.error("Error sending to confirmed:", error)
//                 toast.error("Failed to send data to confirmed")
//             }
//         }
//     }

//     const handleIssuePending = async (id) => {
//         const item = pendingData.find((item) => item._id === id)
//         setSelectedItem(item)
//         setIsReviewDialogOpen(true)
//     }

//     const handlePageChange = (page) => {
//         if (page >= 1 && page <= totalPages) {
//             setCurrentPage(page)
//         }
//     }

//     const handleIssue = async (id, dataId, data) => {
//         try {
//             await issuePending(id, dataId, data)
//             toast.success("Issue sent successfully")

//             const updatedPendingData = pendingData.filter((item) => item._id !== id)
//             setPendingData(updatedPendingData)

//             const updatedFilteredData = filteredData.filter((item) => item._id !== id)
//             setFilteredData(updatedFilteredData)

//             const newTotalPages = Math.ceil(updatedFilteredData.length / itemsPerPage)
//             setTotalPages(newTotalPages)

//             // Adjust current page if necessary
//             if (currentPage > newTotalPages) {
//                 setCurrentPage(newTotalPages || 1)
//             } else if (currentPage === newTotalPages && updatedFilteredData.length % itemsPerPage === 0 && currentPage > 1) {
//                 setCurrentPage(currentPage - 1)
//             }

//             applyFiltersAndPaginate()
//         } catch (error) {
//             console.error("Error issuing item:", error)
//             toast.error("Failed to issue item")
//         }
//     }

//     const handleSearch = (e) => {
//         setSearchTerm(e.target.value)
//         setCurrentPage(1)
//     }

//     const handleColumnSelect = (value) => {
//         setSearchColumn(value)
//         setCurrentPage(1)
//     }

//     const startIndex = (currentPage - 1) * itemsPerPage
//     // const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

//     if (isLoading) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//             </div>
//         )
//     }

//     if (error) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <p className="text-red-500">{error}</p>
//             </div>
//         )
//     }

//     return (
//         <div className="container mx-auto p-8 bg-gray-50 min-h-screen max-w-full">



//             {/* <div className="mb-6 flex items-center justify-between">
//                 <h1 className="text-3xl font-semibold text-gray-800">Pending Page</h1>

//                 <div className="flex items-center space-x-2">
//                     <Select onValueChange={handleColumnSelect} defaultValue="all">
//                         <SelectTrigger className="w-[180px]">
//                             <SelectValue placeholder="Select column" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="all">All Columns</SelectItem>
//                             <SelectItem value="ref">Reference</SelectItem>
//                             <SelectItem value="date">Date</SelectItem>
//                             <SelectItem value="time">Time</SelectItem>
//                             <SelectItem value="source">Source</SelectItem>
//                             <SelectItem value="payment_type">Payment Type</SelectItem>
//                             <SelectItem value="sale_type">Sale Type</SelectItem>
//                             <SelectItem value="agent_name">Agent</SelectItem>
//                             <SelectItem value="cm_first_name">First Name</SelectItem>
//                             <SelectItem value="cm_last_name">Last Name</SelectItem>
//                             <SelectItem value="cm_phone">Phone</SelectItem>
//                             <SelectItem value="alternate_phone">Alternate Number</SelectItem>
//                             <SelectItem value="email">Email</SelectItem>
//                             <SelectItem value="status">Status</SelectItem>
//                             <SelectItem value="shipment_type">Shipment Type</SelectItem>
//                             <SelectItem value="address">Address</SelectItem>
//                             <SelectItem value="post_type">Post Type</SelectItem>
//                             <SelectItem value="post">Post</SelectItem>
//                             <SelectItem value="district">District</SelectItem>
//                             <SelectItem value="city">City/Town/Village</SelectItem>
//                             <SelectItem value="pincode">Pincode</SelectItem>
//                             <SelectItem value="state">State</SelectItem>
//                             <SelectItem value="disease">Disease</SelectItem>
//                             <SelectItem value="amount">Amount</SelectItem>
//                             <SelectItem value="products">Products</SelectItem>
//                         </SelectContent>
//                     </Select>
//                     <Input
//                         type="text"
//                         placeholder="Search..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="max-w-sm"
//                     />
//                 </div>
//             </div>
//             <div className="mb-4 flex justify-between items-center">
//                 <div className="flex space-x-2">
//                     <TooltipProvider>
//                         <Tooltip>
//                             <TooltipTrigger asChild>
//                                 <Button variant="outline" size="icon" onClick={refreshData} disabled={refreshing}>
//                                     <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
//                                 </Button>
//                             </TooltipTrigger>
//                             <TooltipContent>
//                                 <p>Refresh data</p>
//                             </TooltipContent>
//                         </Tooltip>
//                     </TooltipProvider>
//                 </div>
//             </div> */}

//             <Card className="mb-6">
//                 {/* Header Section */}
//                 <CardHeader className="flex flex-row items-center justify-between">
//                     <CardTitle className="text-3xl font-bold">Pending Page</CardTitle>

//                     {/* Right Side Controls */}
//                     <div className="flex items-center space-x-4">
//                         {/* Refresh Label */}
//                         {/* <span className="text-l font-semibold">Refresh:</span>x` */}

//                         {/* Refresh Button */}
//                         <TooltipProvider>
//                             <Tooltip>
//                                 <TooltipTrigger asChild>
//                                     <Button
//                                         variant="outline"
//                                         size="lg"
//                                         className="px-4 py-2 flex items-center space-x-2"
//                                         onClick={refreshData}
//                                         disabled={refreshing}
//                                     >
//                                         <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
//                                         Refresh
//                                     </Button>
//                                 </TooltipTrigger>
//                                 <TooltipContent>
//                                     <p>Click to refresh the data</p>
//                                 </TooltipContent>
//                             </Tooltip>
//                         </TooltipProvider>

//                         {/* Column Selection Dropdown */}
//                         <Select onValueChange={handleColumnSelect} defaultValue="all">
//                             <SelectTrigger className="w-[200px]">
//                                 <SelectValue placeholder="Select column" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="all">All Columns</SelectItem>
//                                 <SelectItem value="data">Data</SelectItem>
//                                 <SelectItem value="source">Source</SelectItem>
//                                 <SelectItem value="cm_first_name">First Name</SelectItem>
//                                 <SelectItem value="cm_last_name">Last Name</SelectItem>
//                                 <SelectItem value="cm_phone">Phone</SelectItem>
//                                 <SelectItem value="agent_name">Agent</SelectItem>
//                                 <SelectItem value="language">Language</SelectItem>


//                                 <SelectItem value="disease">Disease</SelectItem>
//                                 <SelectItem value="state">State</SelectItem>
//                                 <SelectItem value="city">City</SelectItem>
//                                 <SelectItem value="remark">Remark</SelectItem>
//                                 <SelectItem value="comment">Comment</SelectItem>
//                                 <SelectItem value="date">Date</SelectItem>
//                             </SelectContent>
//                         </Select>

//                         {/* Search Input */}
//                         <Input
//                             type="text"
//                             placeholder="Search..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="max-w-sm"
//                         />
//                     </div>
//                 </CardHeader>


//             </Card>
//             <div className="bg-white shadow-md rounded-lg overflow-hidden">

//                 {/* <div className="max-w-full">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Send</TableHead>

//                                 <TableHead>Issue</TableHead>
//                                 <TableHead>Ref</TableHead>
//                                 <TableHead>Date</TableHead>
//                                 <TableHead>Time</TableHead>
//                                 <TableHead>Source</TableHead>

//                                 <TableHead>Payment Type</TableHead>
//                                 <TableHead>Sale Type</TableHead>
//                                 <TableHead>Agent</TableHead>

//                                 <TableHead>First Name</TableHead>
//                                 <TableHead>Last Name</TableHead>
//                                 <TableHead>Phone</TableHead>
//                                 <TableHead>Alternate Number</TableHead>
//                                 <TableHead>Email</TableHead>
//                                 <TableHead>Status</TableHead>
//                                 <TableHead>Comment</TableHead>
//                                 <TableHead>Shipment Type</TableHead>
//                                 <TableHead>Address</TableHead>
//                                 <TableHead>Post Type</TableHead>
//                                 <TableHead>Post</TableHead>

//                                 <TableHead>District</TableHead>
//                                 <TableHead>City/Town/Village</TableHead>
//                                 <TableHead>Pincode</TableHead>

//                                 <TableHead>State</TableHead>

//                                 <TableHead>Disease</TableHead>
//                                 <TableHead>Amount</TableHead>
//                                 <TableHead>Products</TableHead>

//                                 <TableHead>City</TableHead>
//                                 <TableHead>Update</TableHead>
//                                 <TableHead>Actions</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {paginatedData.map((item, index) => (
//                                 <TableRow key={item._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
//                                     <TableCell>
//                                         <Forward
//                                             size={25}
//                                             color="green"
//                                             strokeWidth={2}
//                                             style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
//                                             onClick={() => handleSendToConfirmed(item._id, item.dataId, item.data)}
//                                         />
//                                     </TableCell>
//                                     <TableCell>
//                                         <SendHorizontal
//                                             size={20}
//                                             color="red"
//                                             strokeWidth={2}
//                                             style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
//                                             onClick={() => handleIssue(item._id, item.dataId, item.data)}
//                                         />
//                                     </TableCell>
//                                     <TableCell>{item.ref}</TableCell>
//                                     <TableCell>{item.date}</TableCell>
//                                     <TableCell>{item.time}</TableCell>
//                                     <TableCell>{item.source?.value}</TableCell>

//                                     <TableCell>{item.payment_type?.value}</TableCell>
//                                     <TableCell>{item.sale_type?.value}</TableCell>

//                                     <TableCell>{item.agent_name?.value}</TableCell>
//                                     <TableCell>{item.cm_first_name}</TableCell>
//                                     <TableCell>{item.cm_last_name}</TableCell>
//                                     <TableCell>{item.cm_phone}</TableCell>
//                                     <TableCell>{item.alternate_phone}</TableCell>
//                                     <TableCell>{item.email}</TableCell>
//                                     <TableCell>{item.status?.value}</TableCell>
//                                     <TableCell>{item.comment}</TableCell>
//                                     <TableCell>{item.shipment_type?.value}</TableCell>
//                                     <TableCell>{item.address}</TableCell>
//                                     <TableCell>{item.post_type?.value}</TableCell>
//                                     <TableCell>{item.post}</TableCell>
//                                     <TableCell>{item.district}</TableCell>
//                                     <TableCell>{item.city}</TableCell>
//                                     <TableCell>{item.pincode}</TableCell>

//                                     <TableCell>{item.state?.value}</TableCell>

//                                     <TableCell>{item.disease?.value}</TableCell>
//                                     <TableCell>{item.amount?.value}</TableCell>
//                                     <TableCell>
//                                         {Array.isArray(item.products?.value)
//                                             ? item.products.value.map((product, index) => (

//                                                 <div key={index}>

//                                                     {product.product} : {product.quantity}
//                                                 </div>
//                                             ))
//                                             : null}
//                                     </TableCell>

//                                     <TableCell>{item.city}</TableCell>
//                                     <TableCell>
//                                         <RotateCw
//                                             size={20}
//                                             color="#007BFF"
//                                             strokeWidth={2}
//                                             style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
//                                             onClick={() => handleUpdateClick(item._id)}
//                                             onMouseOver={(e) => (e.currentTarget.style.transform = "rotate(90deg)")}
//                                             onMouseOut={(e) => (e.currentTarget.style.transform = "rotate(0deg)")}
//                                         />
//                                     </TableCell>
//                                     <TableCell>
//                                         <AlertDialog>
//                                             <AlertDialogTrigger asChild>
//                                                 <Button
//                                                     variant="ghost"
//                                                     className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
//                                                 >
//                                                     <Trash2 className="h-5 w-5 text-red-500" />
//                                                 </Button>
//                                             </AlertDialogTrigger>
//                                             <AlertDialogContent>
//                                                 <AlertDialogHeader>
//                                                     <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                                                     <AlertDialogDescription>
//                                                         This action cannot be undone. This will permanently delete the selected record.
//                                                     </AlertDialogDescription>
//                                                 </AlertDialogHeader>
//                                                 <AlertDialogFooter>
//                                                     <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                                     <AlertDialogAction onClick={() => handleDelete(item._id, item.dataId, item.data)}>
//                                                         Delete
//                                                     </AlertDialogAction>
//                                                 </AlertDialogFooter>
//                                             </AlertDialogContent>
//                                         </AlertDialog>
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </div> */}
//                 <div className="max-w-full">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Send</TableHead>
//                                 <TableHead>Issue</TableHead>
//                                 <TableHead>Ref</TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Date</span>
//                                         <br />
//                                         <span>Time</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Sale Type</span>
//                                         <br />
//                                         <span>Source</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Agent Name</span>
//                                         <br />
//                                         <span>Payment Type</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>First Name</span>
//                                         <br />
//                                         <span>Last Name</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Phone</span>
//                                         <br />
//                                         <span>Alternate Number</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Status</span>
//                                         <br />
//                                         <span>Comment</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>State</span>
//                                         <br />
//                                         <span>City</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>Product</TableHead>
//                                 <TableHead>Amount</TableHead>
//                                 <TableHead>Update</TableHead>
//                                 <TableHead>Actions</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {paginatedData.map((item, index) => (
//                                 <TableRow
//                                     key={item._id}
//                                     className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
//                                 >
//                                     {/* Send */}
//                                     <TableCell>
//                                         <Forward
//                                             size={25}
//                                             color="green"
//                                             strokeWidth={2}
//                                             style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
//                                             onClick={() =>
//                                                 handleSendToConfirmed(item._id, item.dataId, item.data)
//                                             }
//                                         />
//                                     </TableCell>
//                                     {/* Issue */}
//                                     <TableCell>
//                                         <SendHorizontal
//                                             size={20}
//                                             color="red"
//                                             strokeWidth={2}
//                                             style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
//                                             onClick={() => handleIssue(item._id, item.dataId, item.data)}
//                                         />
//                                     </TableCell>
//                                     {/* Ref */}
//                                     <TableCell>{item.ref}</TableCell>
//                                     {/* Date & Time */}
//                                     <TableCell>
//                                         <div>
//                                             {item.date}
//                                             <br />
//                                             {item.time}
//                                         </div>
//                                     </TableCell>
//                                     {/* Sale Type & Source */}
//                                     <TableCell>
//                                         <div>
//                                             {item.sale_type?.value}
//                                             <br />
//                                             {item.source?.value}
//                                         </div>
//                                     </TableCell>
//                                     {/* Agent Name & Payment Type */}
//                                     <TableCell>
//                                         <div>
//                                             {item.agent_name?.value}
//                                             <br />
//                                             {item.payment_type?.value}
//                                         </div>
//                                     </TableCell>
//                                     {/* First Name & Last Name */}
//                                     <TableCell>
//                                         <div>
//                                             {item.cm_first_name}
//                                             <br />
//                                             {item.cm_last_name}
//                                         </div>
//                                     </TableCell>
//                                     {/* Phone & Alternate Number */}
//                                     <TableCell>
//                                         <div>
//                                             {item.cm_phone}
//                                             <br />
//                                             {item.alternate_phone}
//                                         </div>
//                                     </TableCell>
//                                     {/* Status & Comment */}
//                                     <TableCell>
//                                         <div>
//                                             {item.status?.value}
//                                             <br />
//                                             {item.comment}
//                                         </div>
//                                     </TableCell>
//                                     {/* State & City */}
//                                     <TableCell>
//                                         <div>
//                                             {item.state?.value}
//                                             <br />
//                                             {item.city}
//                                         </div>
//                                     </TableCell>
//                                     {/* Product */}
//                                     <TableCell>
//                                         {Array.isArray(item.products?.value)
//                                             ? item.products.value.map((product, idx) => (
//                                                 <div key={idx}>
//                                                     {product.product} : {product.quantity}
//                                                 </div>
//                                             ))
//                                             : null}
//                                     </TableCell>
//                                     {/* Amount */}
//                                     <TableCell>{item.amount?.value}</TableCell>
//                                     {/* Update */}
//                                     <TableCell>
//                                         <RotateCw
//                                             size={20}
//                                             color="#007BFF"
//                                             strokeWidth={2}
//                                             style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
//                                             onClick={() => handleUpdateClick(item._id)}
//                                             onMouseOver={(e) =>
//                                                 (e.currentTarget.style.transform = "rotate(90deg)")
//                                             }
//                                             onMouseOut={(e) =>
//                                                 (e.currentTarget.style.transform = "rotate(0deg)")
//                                             }
//                                         />
//                                     </TableCell>
//                                     {/* Actions */}
//                                     <TableCell>
//                                         <AlertDialog>
//                                             <AlertDialogTrigger asChild>
//                                                 <Button
//                                                     variant="ghost"
//                                                     className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
//                                                 >
//                                                     <Trash2 className="h-5 w-5 text-red-500" />
//                                                 </Button>
//                                             </AlertDialogTrigger>
//                                             <AlertDialogContent>
//                                                 <AlertDialogHeader>
//                                                     <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                                                     <AlertDialogDescription>
//                                                         This action cannot be undone. This will permanently delete the
//                                                         selected record.
//                                                     </AlertDialogDescription>
//                                                 </AlertDialogHeader>
//                                                 <AlertDialogFooter>
//                                                     <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                                     <AlertDialogAction
//                                                         onClick={() =>
//                                                             handleDelete(item._id, item.dataId, item.data)
//                                                         }
//                                                     >
//                                                         Delete
//                                                     </AlertDialogAction>
//                                                 </AlertDialogFooter>
//                                             </AlertDialogContent>
//                                         </AlertDialog>
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </div>

//             </div>
//             <Pagination className="mt-4 flex justify-center">
//                 <PaginationContent>
//                     <PaginationItem>
//                         <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
//                     </PaginationItem>
//                     {[...Array(totalPages)].map((_, index) => {
//                         const pageNumber = index + 1
//                         if (
//                             pageNumber === 1 ||
//                             pageNumber === totalPages ||
//                             (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
//                         ) {
//                             return (
//                                 <PaginationItem key={index}>
//                                     <PaginationLink onClick={() => handlePageChange(pageNumber)} isActive={currentPage === pageNumber}>
//                                         {pageNumber}
//                                     </PaginationLink>
//                                 </PaginationItem>
//                             )
//                         } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
//                             return <PaginationEllipsis key={index} />
//                         }
//                         return null
//                     })}
//                     <PaginationItem>
//                         <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
//                     </PaginationItem>
//                 </PaginationContent>
//             </Pagination>
//             <div className="flex items-center space-x-2">
//                 <Input
//                     type="number"
//                     placeholder="Go to page"
//                     value={goToPage}
//                     onChange={(e) => setGoToPage(e.target.value)}
//                     onKeyDown={(e) => {
//                         if (e.key === "Enter" && goToPage) {
//                             handleGoToPage()
//                         }
//                     }}
//                     className="w-40"
//                     min={1}
//                     max={totalPages}
//                 />
//                 <Button onClick={handleGoToPage} disabled={!goToPage}>
//                     Go
//                 </Button>
//             </div>

//             <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
//                 <DialogContent>
//                     <DialogHeader>
//                         <DialogTitle>Review Pending Data</DialogTitle>
//                         <DialogDescription>Please review the pending data before sending to confirmed.</DialogDescription>
//                     </DialogHeader>

//                     {selectedItem && (
//                         <div className="mt-4">
//                             <dl className="space-y-3">
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Ref:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.ref}</dd>
//                                 </div>

//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Source:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.source?.value}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Name:</dt>
//                                     <dd className="text-sm text-gray-800">
//                                         {selectedItem.cm_first_name} {selectedItem.cm_last_name}
//                                     </dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Phone:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.cm_phone}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Agent:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.agent_name?.value}</dd>
//                                 </div>

//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Disease:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.disease?.value}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">State:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.state?.value}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">City:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.city}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Address:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.address}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Post Type:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.post_type?.value}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Shipment Type:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.shipment_type?.value}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Post:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.post}</dd>
//                                 </div>

//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Remark:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.remark?.value}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Comment:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.comment}</dd>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <dt className="text-sm font-medium text-gray-600">Date:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.date}</dd>
//                                 </div>
//                             </dl>
//                         </div>
//                     )}
//                     <DialogFooter>
//                         <Button onClick={() => setIsReviewDialogOpen(false)}>Cancel</Button>
//                         <Button onClick={confirmSendToConfirmed}>Confirm Send</Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     )
// }

// export default PendingPage


"use client"

import { useState, useEffect } from "react"
import { getAllPending, deletePending, issuePending, sendToConfirmed } from "@/services/pendingService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { RotateCw, SendHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Loader2, Trash2, Forward, RefreshCcw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import useAccessControl from "../../AccessControl"

const Table = ({ children }) => (
    <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">{children}</table>
    </div>
)

const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

const TableRow = ({ children, className }) => <tr className={`${className} hover:bg-gray-100`}>{children}</tr>

const TableHead = ({ children, className }) => (
    <th
        className={`${className} p-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-300 bg-gray-200 sticky top-0 z-10`}
    >
        {children}
    </th>
)

const TableBody = ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>

const TableCell = ({ children, className }) => (
    <td className={`${className} p-3 text-sm text-gray-700 break-words max-w-[200px]`}>{children}</td>
)

const PendingPage = () => {
    const [pendingData, setPendingData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedItem, setSelectedItem] = useState(null)
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
    const [goToPage, setGoToPage] = useState("")
    const [searchColumn, setSearchColumn] = useState("all")
    const [refreshing, setRefreshing] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState(null)
    const [columnPermissions, setColumnPermissions] = useState([])
    const [debugInfo, setDebugInfo] = useState({})

    const { permissions, loading } = useAccessControl("/pending")
    const navigate = useNavigate()

    useEffect(() => {
        if (loading) return // Wait until loading is complete


        // Ensure permissions exist
        if (!permissions) {
            navigate("/dashboard") // Redirect if no permissions
            return
        }

        // Check if user has access to this page
        if (!permissions.page || permissions.page !== "/pending") {
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
    }, [permissions, loading, navigate])

    const hasColumnPermission = (columnName) => {
        if (!columnPermissions || !Array.isArray(columnPermissions) || columnPermissions.length === 0) {
            return false
        }

        const hasPermission = columnPermissions.includes(columnName)
        return hasPermission
    }

    // Update the fetchData function to handle pagination and send query parameters to the backend
    const fetchData = async (page = currentPage, limit = itemsPerPage, search = searchTerm, column = searchColumn) => {
        try {
            setIsLoading(true)

            // Ensure page and limit are numbers
            const pageNum = Number.parseInt(page, 10) || 1
            const limitNum = Number.parseInt(limit, 10) || 10

            // Construct query parameters for the API call
            const queryParams = new URLSearchParams()
            queryParams.append("page", pageNum)
            queryParams.append("limit", limitNum)

            // Add search parameters if provided
            if (search) {
                queryParams.append("search", search)
                if (column !== "all") {
                    queryParams.append("searchColumn", column)
                }
            }

            // Log the full URL that will be called
            const queryString = queryParams.toString()

            // Make the API call with the constructed query parameters
            const response = await getAllPending(queryString)

            // Store debug info
            setDebugInfo({
                requestParams: {
                    page: pageNum,
                    limit: limitNum,
                    search,
                    column,
                    queryString,
                },
                response: response.data,
            })

            if (response.data && response.data.data) {
                setPendingData(response.data.data)

                // Ensure totalCount is a number
                const count = Number.parseInt(response.data.totalCount, 10) || 0
                setTotalCount(count)

                // Calculate total pages based on count and limit
                const pages = Math.ceil(count / limitNum) || 1
                setTotalPages(pages)

                // Ensure current page is valid
                const responsePage = Number.parseInt(response.data.currentPage, 10) || pageNum
                setCurrentPage(responsePage > pages ? 1 : responsePage)


            } else {
                console.error("Invalid response format:", response)
                setPendingData([])
                setError("Invalid data format received from server")
            }
        } catch (error) {
            console.error("Error fetching pending data:", error)
            setError("Failed to fetch data. Please try again later.")
            setPendingData([])
        } finally {
            setIsLoading(false)
        }
    }

    // Initial data fetch when component mounts
    useEffect(() => {
        fetchData(1, itemsPerPage, searchTerm, searchColumn)
    }, []) // Empty dependency array for initial load only

    // Handle search with debounce
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const timeout = setTimeout(() => {
            fetchData(1, itemsPerPage, searchTerm, searchColumn)
        }, 500) // 500ms debounce

        setSearchTimeout(timeout)

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout)
            }
        }
    }, [searchTerm, searchColumn])

    const refreshData = async () => {
        setRefreshing(true)
        await fetchData(currentPage, itemsPerPage, searchTerm, searchColumn)
        setRefreshing(false)
        toast.success("Data refreshed successfully")
    }

    const handleDelete = async (id, dataId, data) => {
        if (!hasColumnPermission("delete")) {
            toast.error("You don't have permission to delete pending items")
            return
        }

        try {
            await deletePending(id, dataId, data)
            toast.success("Data deleted successfully")
            // Refresh the current page after deletion
            fetchData(currentPage, itemsPerPage, searchTerm, searchColumn)
        } catch (error) {
            console.error("Error deleting item:", error)
            setError("Failed to delete item. Please try again.")
        }
    }

    const handleGoToPage = () => {
        const pageNumber = Number.parseInt(goToPage, 10)
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            fetchData(pageNumber, itemsPerPage, searchTerm, searchColumn)
            setGoToPage("")
        } else {
            toast.error(`Please enter a valid page number between 1 and ${totalPages}`)
        }
    }

    const handleUpdateClick = async (id) => {
        if (!hasColumnPermission("update")) {
            toast.error("You don't have permission to update pending items")
            return
        }

        navigate(`/edit-pending-data/${id}`)
    }

    const handleSendToConfirmed = async (id, dataId, data) => {
        if (!hasColumnPermission("send")) {
            toast.error("You don't have permission to send items to confirmed")
            return
        }

        const item = pendingData.find((item) => item._id === id)
        setSelectedItem(item)
        setIsReviewDialogOpen(true)
    }

    const validateForm = (formData) => {
        let isValid = true
        const phoneRegex = /^\d{10}$/
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        // Helper function to check if a value is empty
        const isEmpty = (value) => {
            if (value === null || value === undefined) return true
            if (typeof value === "string") return value.trim() === ""
            if (Array.isArray(value)) return value.length === 0
            if (typeof value === "object") return Object.keys(value).length === 0
            return false
        }

        // Helper function to validate nested object values
        const validateNestedValue = (obj) => {
            if (!obj || typeof obj !== "object") return false
            if (obj.value === undefined || obj.value === null) return false
            if (typeof obj.value === "string") return obj.value.trim() !== ""
            if (Array.isArray(obj.value)) return obj.value.length > 0
            return true
        }

        // Check if shipment type is Indian Post
        const isIndianPost = formData.shipment_type?.value === "Indian Post"

        // Validate all required fields except email and alternate_phone
        for (const [key, value] of Object.entries(formData)) {
            // Skip optional fields
            if (key === "alternate_phone" || key === "email") {
                continue
            }

            // Skip post and post_type validation if shipment_type is not Indian Post
            if ((key === "post" || key === "post_type") && !isIndianPost) {
                continue
            }

            // Handle products array specially
            if (key === "products") {
                if (!value || !value.value || !Array.isArray(value.value) || value.value.length === 0) {
                    isValid = false
                    break
                }
                // Validate each product in the array
                const hasInvalidProduct = value.value.some(
                    (product) => isEmpty(product) || Object.values(product).some((val) => isEmpty(val)),
                )
                if (hasInvalidProduct) {
                    isValid = false
                    break
                }
                continue
            }

            // Handle nested objects with 'value' property
            if (value && typeof value === "object" && "value" in value) {
                if (!validateNestedValue(value)) {
                    isValid = false
                    break
                }
                continue
            }

            // Handle direct string values
            if (isEmpty(value)) {
                isValid = false
                break
            }
        }

        // Validate required phone number
        if (!formData.cm_phone || !phoneRegex.test(formData.cm_phone.toString())) {
            isValid = false
        }

        // Validate optional alternate phone if provided
        if (formData.alternate_phone && !phoneRegex.test(formData.alternate_phone)) {
            isValid = false
        }

        // Validate optional email if provided
        if (formData.email && formData.email.trim() !== "" && !emailRegex.test(formData.email)) {
            isValid = false
        }

        // Additional validation for Indian Post shipment type
        if (isIndianPost) {
            if (!formData.post_type?.value || formData.post_type.value.trim() === "") {
                isValid = false
            }
            if (!formData.post?.value || formData.post.value.trim() === "") {
                isValid = false
            }
        }

        if (!isValid) {
            let errorMessage = "Please fill all required fields correctly before sending to confirmed."
            if (isIndianPost) {
                errorMessage = "Please fill all required fields including post details for Indian Post shipment."
            }
            toast.error(errorMessage)
        }

        return isValid
    }

    const confirmSendToConfirmed = async () => {
        if (!hasColumnPermission("send")) {
            toast.error("You don't have permission to send items to confirmed")
            return
        }

        if (selectedItem) {
            // const isValid = validateForm(selectedItem)
            // if (!isValid) {
            //     setIsReviewDialogOpen(false)
            //     return
            // }
            try {
                await sendToConfirmed(selectedItem._id)
                toast.success("Data sent to confirmed successfully")
                // Refresh the current page after sending to confirmed
                fetchData(currentPage, itemsPerPage, searchTerm, searchColumn)
                setIsReviewDialogOpen(false)
            } catch (error) {
                console.error("Error sending to confirmed:", error)
                toast.error("Failed to send data to confirmed")
            }
        }
    }

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchData(page, itemsPerPage, searchTerm, searchColumn)
        } else {
            console.warn(`Invalid page number: ${page}. Must be between 1 and ${totalPages}`)
        }
    }

    const handleIssue = async (id, dataId, data) => {
        if (!hasColumnPermission("issue")) {
            toast.error("You don't have permission to issue pending items")
            return
        }

        try {
            await issuePending(id, dataId, data)
            toast.success("Issue sent successfully")
            // Refresh the current page after issuing
            fetchData(currentPage, itemsPerPage, searchTerm, searchColumn)
        } catch (error) {
            console.error("Error issuing item:", error)
            toast.error("Failed to issue item")
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    const handleColumnSelect = (value) => {
        setSearchColumn(value)
        // Reset to page 1 when changing search column
        fetchData(1, itemsPerPage, searchTerm, value)
    }

    const handleItemsPerPageChange = (value) => {
        const newItemsPerPage = Number.parseInt(value, 10)
        setItemsPerPage(newItemsPerPage)
        // Reset to page 1 when changing items per page
        fetchData(1, newItemsPerPage, searchTerm, searchColumn)
    }

    // Improved pagination rendering
    const renderPaginationItems = () => {
        const items = []
        const maxVisiblePages = 3 // Only show 3 pages at a time
        const halfVisible = Math.floor(maxVisiblePages / 2)

        // Ensure totalPages is a number and at least 1
        const validTotalPages = Math.max(1, Number.parseInt(totalPages) || 1)

        // Ensure currentPage is valid
        const validCurrentPage = Math.min(Math.max(1, Number.parseInt(currentPage) || 1), validTotalPages)

        // If only one page, just show that page
        if (validTotalPages <= 1) {
            items.push(
                <PaginationItem key="single">
                    <PaginationLink isActive={true}>1</PaginationLink>
                </PaginationItem>,
            )
            return items
        }

        // Calculate start and end pages to show
        let startPage = Math.max(2, validCurrentPage - halfVisible)
        const endPage = Math.min(validTotalPages - 1, startPage + maxVisiblePages - 1)

        // Adjust startPage if we're showing fewer than maxVisiblePages
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(2, endPage - maxVisiblePages + 1)
        }

        // Always show first page
        items.push(
            <PaginationItem key="first">
                <PaginationLink onClick={() => handlePageChange(1)} isActive={validCurrentPage === 1}>
                    1
                </PaginationLink>
            </PaginationItem>,
        )

        // Add ellipsis if needed
        if (startPage > 2) {
            items.push(
                <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                </PaginationItem>,
            )
        }

        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink onClick={() => handlePageChange(i)} isActive={validCurrentPage === i}>
                        {i}
                    </PaginationLink>
                </PaginationItem>,
            )
        }

        // Add ellipsis before the last page if needed
        if (endPage < validTotalPages - 1) {
            items.push(
                <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                </PaginationItem>,
            )
        }

        // Always show the last page if there is more than one page
        if (validTotalPages > 1) {
            items.push(
                <PaginationItem key="last">
                    <PaginationLink
                        onClick={() => handlePageChange(validTotalPages)}
                        isActive={validCurrentPage === validTotalPages}
                    >
                        {validTotalPages}
                    </PaginationLink>
                </PaginationItem>,
            )
        }

        return items
    }

    if (isLoading && pendingData.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen max-w-full">
            <Card className="mb-6">
                {/* Header Section */}
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-3xl font-bold">Pending Page</CardTitle>

                    {/* Right Side Controls */}
                    <div className="flex items-center space-x-4">
                        {/* Refresh Button */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="px-4 py-2 flex items-center space-x-2"
                                        onClick={refreshData}
                                        disabled={refreshing || isLoading}
                                    >
                                        <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                                        Refresh
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Click to refresh the data</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Column Selection Dropdown */}
                        <Select onValueChange={handleColumnSelect} defaultValue="all">
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Columns</SelectItem>
                                {hasColumnPermission("date") && <SelectItem value="date">Date</SelectItem>}
                                {hasColumnPermission("time") && <SelectItem value="time">Time</SelectItem>}
                                {hasColumnPermission("ref") && <SelectItem value="ref">Reference</SelectItem>}
                                {hasColumnPermission("source") && <SelectItem value="source">Source</SelectItem>}
                                {hasColumnPermission("payment_type") && <SelectItem value="payment_type">Payment Type</SelectItem>}
                                {hasColumnPermission("sale_type") && <SelectItem value="sale_type">Sale Type</SelectItem>}
                                {hasColumnPermission("agent_name") && <SelectItem value="agent_name">Agent</SelectItem>}
                                {hasColumnPermission("cm_first_name") && <SelectItem value="cm_first_name">First Name</SelectItem>}
                                {hasColumnPermission("cm_last_name") && <SelectItem value="cm_last_name">Last Name</SelectItem>}
                                {hasColumnPermission("cm_phone") && <SelectItem value="cm_phone">Phone</SelectItem>}
                                {hasColumnPermission("alternate_phone") && (
                                    <SelectItem value="alternate_phone">Alternate Number</SelectItem>
                                )}
                                {hasColumnPermission("email") && <SelectItem value="email">Email</SelectItem>}
                                {hasColumnPermission("status") && <SelectItem value="status">Status</SelectItem>}
                                {hasColumnPermission("shipment_type") && <SelectItem value="shipment_type">Shipment Type</SelectItem>}
                                {hasColumnPermission("address") && <SelectItem value="address">Address</SelectItem>}
                                {hasColumnPermission("post_type") && <SelectItem value="post_type">Post Type</SelectItem>}
                                {hasColumnPermission("post") && <SelectItem value="post">Post</SelectItem>}
                                {hasColumnPermission("district") && <SelectItem value="district">District</SelectItem>}
                                {hasColumnPermission("city") && <SelectItem value="city">City</SelectItem>}
                                {hasColumnPermission("pincode") && <SelectItem value="pincode">Pincode</SelectItem>}
                                {hasColumnPermission("state") && <SelectItem value="state">State</SelectItem>}
                                {hasColumnPermission("disease") && <SelectItem value="disease">Disease</SelectItem>}
                                {hasColumnPermission("amount") && <SelectItem value="amount">Amount</SelectItem>}
                                {hasColumnPermission("products") && <SelectItem value="products">Products</SelectItem>}
                                {hasColumnPermission("comment") && <SelectItem value="comment">Comment</SelectItem>}
                            </SelectContent>
                        </Select>

                        {/* Search Input */}
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end items-center">
                        {/* Items per page selection */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Items per page:</span>
                            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange} defaultValue="10">
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue>{itemsPerPage}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isLoading && pendingData.length > 0 && (
                <div className="flex justify-center my-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="max-w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {hasColumnPermission("send") && <TableHead>Send</TableHead>}
                                {hasColumnPermission("issue") && <TableHead>Issue</TableHead>}
                                {hasColumnPermission("ref") && <TableHead>Ref</TableHead>}
                                {(hasColumnPermission("date") || hasColumnPermission("time")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("date") && <span>Date</span>}
                                            {hasColumnPermission("date") && hasColumnPermission("time") && <br />}
                                            {hasColumnPermission("time") && <span>Time</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {(hasColumnPermission("sale_type") || hasColumnPermission("source")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("sale_type") && <span>Sale Type</span>}
                                            {hasColumnPermission("sale_type") && hasColumnPermission("source") && <br />}
                                            {hasColumnPermission("source") && <span>Source</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {(hasColumnPermission("agent_name") || hasColumnPermission("payment_type")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("agent_name") && <span>Agent Name</span>}
                                            {hasColumnPermission("agent_name") && hasColumnPermission("payment_type") && <br />}
                                            {hasColumnPermission("payment_type") && <span>Payment Type</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {(hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("cm_first_name") && <span>First Name</span>}
                                            {hasColumnPermission("cm_first_name") && hasColumnPermission("cm_last_name") && <br />}
                                            {hasColumnPermission("cm_last_name") && <span>Last Name</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {(hasColumnPermission("cm_phone") || hasColumnPermission("alternate_phone")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("cm_phone") && <span>Phone</span>}
                                            {hasColumnPermission("cm_phone") && hasColumnPermission("alternate_phone") && <br />}
                                            {hasColumnPermission("alternate_phone") && <span>Alternate Number</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {(hasColumnPermission("status") || hasColumnPermission("comment")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("status") && <span>Status</span>}
                                            {hasColumnPermission("status") && hasColumnPermission("comment") && <br />}
                                            {hasColumnPermission("comment") && <span>Comment</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {(hasColumnPermission("state") || hasColumnPermission("city")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("state") && <span>State</span>}
                                            {hasColumnPermission("state") && hasColumnPermission("city") && <br />}
                                            {hasColumnPermission("city") && <span>City</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {hasColumnPermission("products") && <TableHead>Product</TableHead>}
                                {hasColumnPermission("amount") && <TableHead>Amount</TableHead>}
                                {hasColumnPermission("update") && <TableHead>Update</TableHead>}
                                {hasColumnPermission("delete") && <TableHead>Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12} className="text-center py-8">
                                        No data found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pendingData.map((item, index) => (
                                    <TableRow key={item._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                        {/* Send */}
                                        {hasColumnPermission("send") && (
                                            <TableCell>
                                                <Forward
                                                    size={25}
                                                    color="green"
                                                    strokeWidth={2}
                                                    style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
                                                    onClick={() => handleSendToConfirmed(item._id, item.dataId, item.data)}
                                                />
                                            </TableCell>
                                        )}
                                        {/* Issue */}
                                        {hasColumnPermission("issue") && (
                                            <TableCell>
                                                <SendHorizontal
                                                    size={20}
                                                    color="red"
                                                    strokeWidth={2}
                                                    style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
                                                    onClick={() => handleIssue(item._id, item.dataId, item.data)}
                                                />
                                            </TableCell>
                                        )}
                                        {/* Ref */}
                                        {hasColumnPermission("ref") && <TableCell>{item.ref}</TableCell>}
                                        {/* Date & Time */}
                                        {(hasColumnPermission("date") || hasColumnPermission("time")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("date") && item.date}
                                                    {hasColumnPermission("date") && hasColumnPermission("time") && <br />}
                                                    {hasColumnPermission("time") && item.time}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Sale Type & Source */}
                                        {(hasColumnPermission("sale_type") || hasColumnPermission("source")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("sale_type") && item.sale_type?.value}
                                                    {hasColumnPermission("sale_type") && hasColumnPermission("source") && <br />}
                                                    {hasColumnPermission("source") && item.source?.value}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Agent Name & Payment Type */}
                                        {(hasColumnPermission("agent_name") || hasColumnPermission("payment_type")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("agent_name") && item.agent_name?.value}
                                                    {hasColumnPermission("agent_name") && hasColumnPermission("payment_type") && <br />}
                                                    {hasColumnPermission("payment_type") && item.payment_type?.value}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* First Name & Last Name */}
                                        {(hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("cm_first_name") && item.cm_first_name}
                                                    {hasColumnPermission("cm_first_name") && hasColumnPermission("cm_last_name") && <br />}
                                                    {hasColumnPermission("cm_last_name") && item.cm_last_name}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Phone & Alternate Number */}
                                        {(hasColumnPermission("cm_phone") || hasColumnPermission("alternate_phone")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("cm_phone") && item.cm_phone}
                                                    {hasColumnPermission("cm_phone") && hasColumnPermission("alternate_phone") && <br />}
                                                    {hasColumnPermission("alternate_phone") && item.alternate_phone}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Status & Comment */}
                                        {(hasColumnPermission("status") || hasColumnPermission("comment")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("status") && item.status?.value}
                                                    {hasColumnPermission("status") && hasColumnPermission("comment") && <br />}
                                                    {hasColumnPermission("comment") && item.comment}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* State & City */}
                                        {(hasColumnPermission("state") || hasColumnPermission("city")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("state") && item.state?.value}
                                                    {hasColumnPermission("state") && hasColumnPermission("city") && <br />}
                                                    {hasColumnPermission("city") && item.city}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Product */}
                                        {hasColumnPermission("products") && (
                                            <TableCell>
                                                {Array.isArray(item.products?.value)
                                                    ? item.products.value.map((product, idx) => (
                                                        <div key={idx}>
                                                            {product.product} : {product.quantity}
                                                        </div>
                                                    ))
                                                    : null}
                                            </TableCell>
                                        )}
                                        {/* Amount */}
                                        {hasColumnPermission("amount") && <TableCell>{item.amount?.value}</TableCell>}
                                        {/* Update */}
                                        {hasColumnPermission("update") && (
                                            <TableCell>
                                                <RotateCw
                                                    size={20}
                                                    color="#007BFF"
                                                    strokeWidth={2}
                                                    style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
                                                    onClick={() => handleUpdateClick(item._id)}
                                                    onMouseOver={(e) => (e.currentTarget.style.transform = "rotate(90deg)")}
                                                    onMouseOut={(e) => (e.currentTarget.style.transform = "rotate(0deg)")}
                                                />
                                            </TableCell>
                                        )}
                                        {/* Actions */}
                                        {hasColumnPermission("delete") && (
                                            <TableCell>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                                                        >
                                                            <Trash2 className="h-5 w-5 text-red-500" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the selected record.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(item._id, item.dataId, item.data)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination section */}
            <div className="mt-4 flex flex-col items-center justify-center space-y-4">
                {totalPages > 0 && (
                    <>
                        <div className="text-sm text-gray-600">
                            Showing {pendingData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
                        </div>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage <= 1 || isLoading}
                                    />
                                </PaginationItem>

                                {renderPaginationItems()}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages || isLoading}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </>
                )}
            </div>

            {/* Go to page section */}
            <div className="flex items-center space-x-2 mt-4">
                <Input
                    type="number"
                    placeholder="Go to page"
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && goToPage) {
                            handleGoToPage()
                        }
                    }}
                    className="w-40"
                    min={1}
                    max={totalPages}
                    disabled={isLoading}
                />
                <Button onClick={handleGoToPage} disabled={!goToPage || isLoading}>
                    Go
                </Button>
            </div>

            {/* Review dialog */}
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Pending Data</DialogTitle>
                        <DialogDescription>Please review the pending data before sending to confirmed.</DialogDescription>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="mt-4">
                            <dl className="space-y-3">
                                {hasColumnPermission("ref") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">Ref:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.ref}</dd>
                                    </div>
                                )}
                                {hasColumnPermission("source") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">Source:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.source?.value}</dd>
                                    </div>
                                )}
                                {(hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">Name:</dt>
                                        <dd className="text-sm text-gray-800">
                                            {hasColumnPermission("cm_first_name") ? selectedItem.cm_first_name : ""}
                                            {hasColumnPermission("cm_last_name") ? selectedItem.cm_last_name : ""}
                                        </dd>
                                    </div>
                                )}
                                {hasColumnPermission("cm_phone") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">Phone:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.cm_phone}</dd>
                                    </div>
                                )}
                                {hasColumnPermission("agent_name") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">Agent:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.agent_name?.value}</dd>
                                    </div>
                                )}
                                {hasColumnPermission("disease") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">Disease:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.disease?.value}</dd>
                                    </div>
                                )}
                                {hasColumnPermission("state") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">State:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.state?.value}</dd>
                                    </div>
                                )}
                                {hasColumnPermission("city") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">City:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.city}</dd>
                                    </div>
                                )}
                                {hasColumnPermission("address") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">Address:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.address}</dd>
                                    </div>
                                )}
                                {hasColumnPermission("post_type") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">Post Type:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.post_type?.value}</dd>
                                    </div>
                                )}
                                {hasColumnPermission("shipment_type") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">Shipment Type:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.shipment_type?.value}</dd>
                                    </div>
                                )}
                                {hasColumnPermission("post") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">Post:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.post}</dd>
                                    </div>
                                )}
                                {hasColumnPermission("remark") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">Remark:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.remark?.value}</dd>
                                    </div>
                                )}
                                {hasColumnPermission("comment") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">Comment:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.comment}</dd>
                                    </div>
                                )}
                                {hasColumnPermission("date") && (
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-600">Date:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.date}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsReviewDialogOpen(false)}>Cancel</Button>
                        <Button onClick={confirmSendToConfirmed}>Confirm Send</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PendingPage

