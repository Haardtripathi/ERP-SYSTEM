

// "use client"

// import React, { useState, useEffect, useCallback } from "react"
// import { getAllPending, deletePending, issuePending, sendToConfirmed } from "@/services/pendingService"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { toast } from "react-hot-toast"
// import { RotateCw, SendHorizontal } from "lucide-react"
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
// import { Loader2, Search, Trash2, Forward } from "lucide-react"
// import { useNavigate } from "react-router-dom"

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

//     const applyFiltersAndPaginate = useCallback(() => {
//         const results = pendingData.filter((item) =>
//             Object.values(item).some(
//                 (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()),
//             ),
//         )
//         setFilteredData(results)
//         const newTotalPages = Math.ceil(results.length / itemsPerPage)
//         setTotalPages(newTotalPages)

//         const startIndex = (currentPage - 1) * itemsPerPage
//         setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
//     }, [pendingData, searchTerm, itemsPerPage, currentPage])

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

//     const handleUpdateClick = async (id) => {
//         navigate(`/edit-pending-data/${id}`)
//     }

//     const handleSendToConfirmed = async (id, dataId, data) => {
//         const item = pendingData.find((item) => item._id === id)
//         setSelectedItem(item)
//         setIsReviewDialogOpen(true)
//     }

//     const validateForm = (formData) => {
//         let isValid = true
//         const phoneRegex = /^\d{10}$/

//         // Check all required fields
//         for (const [key, value] of Object.entries(formData)) {
//             if (key !== "alternate_phone" && key !== "email") {
//                 if (value === null || value === undefined) {
//                     isValid = false
//                     break
//                 }
//                 if (typeof value === "object" && (!value.value || value.value.toString().trim() === "")) {
//                     isValid = false
//                     break
//                 }
//                 if (typeof value === "string" && value.trim() === "") {
//                     isValid = false
//                     break
//                 }
//             }
//         }

//         // Check phone number
//         if (!formData.cm_phone || (typeof formData.cm_phone === "string" && !phoneRegex.test(formData.cm_phone))) {
//             isValid = false
//         }

//         // Check alternate phone if provided
//         if (
//             formData.alternate_phone &&
//             typeof formData.alternate_phone === "string" &&
//             formData.alternate_phone.trim() !== "" &&
//             !phoneRegex.test(formData.alternate_phone)
//         ) {
//             isValid = false
//         }

//         if (!isValid) {
//             toast.error("Please fill all the fields before sending to confirmed.")
//         }

//         return isValid
//     }

//     const confirmSendToConfirmed = async () => {
//         if (selectedItem) {
//             const isValid = validateForm(selectedItem)
//             if (!isValid) {
//                 setIsReviewDialogOpen(false)
//                 return
//             }
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
//         <div className="container mx-auto p-4 bg-gray-50 min-h-screen max-w-[95vw]">
//             <h1 className="text-3xl font-semibold mb-6 text-gray-800">Pending Data</h1>

//             <div className="mb-4">
//                 <Input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} className="max-w-sm" />
//             </div>

//             <div className="bg-white shadow-md rounded-lg overflow-hidden">
//                 <div className="max-w-full">
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

//                                 <TableHead>Sub District / Taluka</TableHead>
//                                 <TableHead>City / District</TableHead>
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
//                                     <TableCell>{item.sub_district_taluka}</TableCell>
//                                     <TableCell>{item.city}</TableCell>
//                                     <TableCell>{item.pincode}</TableCell>

//                                     <TableCell>{item.state?.value}</TableCell>

//                                     <TableCell>{item.disease?.value}</TableCell>
//                                     <TableCell>{item.amount?.value}</TableCell>
//                                     <TableCell>{item.products?.value}</TableCell>

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
//             <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
//                 <DialogContent>
//                     <DialogHeader>
//                         <DialogTitle>Review Pending Data</DialogTitle>
//                         <DialogDescription>Please review the pending data before sending to confirmed.</DialogDescription>
//                     </DialogHeader>
//                     {selectedItem && (
//                         <div className="mt-4 max-h-[60vh] overflow-y-auto">
//                             <div className="mt-4">
//                                 <p>
//                                     <strong>Reference:</strong> {selectedItem.ref}
//                                 </p>
//                                 <p>
//                                     <strong>Date:</strong> {selectedItem.date}
//                                 </p>
//                                 <p>
//                                     <strong>Time:</strong> {selectedItem.time}
//                                 </p>
//                                 <p>
//                                     <strong>Source:</strong> {selectedItem.source?.value}
//                                 </p>
//                                 <p>
//                                     <strong>Name:</strong> {selectedItem.cm_first_name} {selectedItem.cm_last_name}
//                                 </p>
//                                 <p>
//                                     <strong>Phone:</strong> {selectedItem.cm_phone}
//                                 </p>
//                                 <p>
//                                     <strong>Alternate Phone:</strong> {selectedItem.alternate_phone}
//                                 </p>
//                                 <p>
//                                     <strong>Email:</strong> {selectedItem.email}
//                                 </p>
//                                 <p>
//                                     <strong>Agent Name:</strong> {selectedItem.agent_name?.value}
//                                 </p>
//                                 <p>
//                                     <strong>Status:</strong> {selectedItem.status?.value}
//                                 </p>
//                                 <p>
//                                     <strong>Remark:</strong> {selectedItem.remark?.value}
//                                 </p>
//                                 <p>
//                                     <strong>Comment:</strong> {selectedItem.comment}
//                                 </p>
//                                 <p>
//                                     <strong>Shipment Type:</strong> {selectedItem.shipment_type?.value}
//                                 </p>
//                                 <p>
//                                     <strong>Address:</strong> {selectedItem.address}
//                                 </p>
//                                 <p>
//                                     <strong>Post Type:</strong> {selectedItem.post_type?.value}
//                                 </p>
//                                 <p>
//                                     <strong>Post:</strong> {selectedItem.post}
//                                 </p>
//                                 <p>
//                                     <strong>Sub District/Taluka:</strong> {selectedItem.sub_district_taluka}
//                                 </p>
//                                 <p>
//                                     <strong>City:</strong> {selectedItem.city}
//                                 </p>
//                                 <p>
//                                     <strong>Pincode:</strong> {selectedItem.pincode}
//                                 </p>
//                                 <p>
//                                     <strong>State:</strong> {selectedItem.state?.value}
//                                 </p>
//                                 <p>
//                                     <strong>Disease:</strong> {selectedItem.disease?.value}
//                                 </p>
//                                 <p>
//                                     <strong>Amount:</strong> {selectedItem.amount?.value}
//                                 </p>
//                                 <p>
//                                     <strong>Products:</strong> {selectedItem.products?.value}
//                                 </p>
//                                 <p>
//                                     <strong>Quantity:</strong> {selectedItem.quantity}
//                                 </p>
//                             </div>
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

import React, { useState, useEffect, useCallback } from "react"
import { getAllPending, deletePending, issuePending, sendToConfirmed } from "@/services/pendingService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { RotateCw, SendHorizontal } from "lucide-react"
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
import { Loader2, Search, Trash2, Forward } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    const [filteredData, setFilteredData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedItem, setSelectedItem] = useState(null)
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
    const [paginatedData, setPaginatedData] = useState([])
    const [searchColumn, setSearchColumn] = useState("all")
    const [goToPage, setGoToPage] = useState("")


    const navigate = useNavigate()

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await getAllPending()
            setPendingData(response.data.data)
            setFilteredData(response.data.data)
            setTotalPages(Math.ceil(response.data.data.length / itemsPerPage))
        } catch (error) {
            console.error("Error fetching pending data:", error)
            setError("Failed to fetch data. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }, [itemsPerPage])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const applyFiltersAndPaginate = useCallback(() => {
        const results = pendingData.filter((item) => {
            if (searchColumn === "all") {
                return Object.values(item).some(
                    (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()),
                )
            } else {
                const value = item[searchColumn]
                if (typeof value === "string") {
                    return value.toLowerCase().includes(searchTerm.toLowerCase())
                } else if (typeof value === "object" && value !== null && "value" in value) {
                    return value.value.toLowerCase().includes(searchTerm.toLowerCase())
                }
                return false
            }
        })
        setFilteredData(results)
        const newTotalPages = Math.ceil(results.length / itemsPerPage)
        setTotalPages(newTotalPages)

        const startIndex = (currentPage - 1) * itemsPerPage
        setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
    }, [pendingData, searchTerm, searchColumn, itemsPerPage, currentPage])

    useEffect(() => {
        applyFiltersAndPaginate()
    }, [applyFiltersAndPaginate])

    const handleDelete = async (id, dataId, data) => {
        try {
            await deletePending(id, dataId, data)
            toast.success("Data deleted successfully")
            setPendingData((prevData) => prevData.filter((item) => item._id !== id))
            applyFiltersAndPaginate()
        } catch (error) {
            console.error("Error deleting item:", error)
            setError("Failed to delete item. Please try again.")
        }
    }

    const handleGoToPage = () => {
        const pageNumber = Number.parseInt(goToPage, 10)
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
            setGoToPage("")
        } else {
            toast.error(`Please enter a valid page number between 1 and ${totalPages}`)
        }
    }
    const handleUpdateClick = async (id) => {
        navigate(`/edit-pending-data/${id}`)
    }

    const handleSendToConfirmed = async (id, dataId, data) => {
        const item = pendingData.find((item) => item._id === id)
        setSelectedItem(item)
        setIsReviewDialogOpen(true)
    }

    const validateForm = (formData) => {
        let isValid = true
        const phoneRegex = /^\d{10}$/

        // Check all required fields
        for (const [key, value] of Object.entries(formData)) {
            if (key !== "alternate_phone" && key !== "email") {
                if (value === null || value === undefined) {
                    isValid = false
                    break
                }
                if (typeof value === "object" && (!value.value || value.value.toString().trim() === "")) {
                    isValid = false
                    break
                }
                if (typeof value === "string" && value.trim() === "") {
                    isValid = false
                    break
                }
            }
        }

        // Check phone number
        if (!formData.cm_phone || (typeof formData.cm_phone === "string" && !phoneRegex.test(formData.cm_phone))) {
            isValid = false
        }

        // Check alternate phone if provided
        if (
            formData.alternate_phone &&
            typeof formData.alternate_phone === "string" &&
            formData.alternate_phone.trim() !== "" &&
            !phoneRegex.test(formData.alternate_phone)
        ) {
            isValid = false
        }

        if (!isValid) {
            toast.error("Please fill all the fields before sending to confirmed.")
        }

        return isValid
    }

    const confirmSendToConfirmed = async () => {
        if (selectedItem) {
            const isValid = validateForm(selectedItem)
            if (!isValid) {
                setIsReviewDialogOpen(false)
                return
            }
            try {
                await sendToConfirmed(selectedItem._id)
                toast.success("Data sent to confirmed successfully")

                const updatedPendingData = pendingData.filter((item) => item._id !== selectedItem._id)
                setPendingData(updatedPendingData)

                const updatedFilteredData = filteredData.filter((item) => item._id !== selectedItem._id)
                setFilteredData(updatedFilteredData)

                const newTotalPages = Math.ceil(updatedFilteredData.length / itemsPerPage)
                setTotalPages(newTotalPages)

                // Adjust current page if necessary
                if (currentPage > newTotalPages) {
                    setCurrentPage(newTotalPages || 1)
                } else if (
                    currentPage === newTotalPages &&
                    updatedFilteredData.length % itemsPerPage === 0 &&
                    currentPage > 1
                ) {
                    setCurrentPage(currentPage - 1)
                }

                applyFiltersAndPaginate()
                setIsReviewDialogOpen(false)
            } catch (error) {
                console.error("Error sending to confirmed:", error)
                toast.error("Failed to send data to confirmed")
            }
        }
    }

    const handleIssuePending = async (id) => {
        const item = pendingData.find((item) => item._id === id)
        setSelectedItem(item)
        setIsReviewDialogOpen(true)
    }

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const handleIssue = async (id, dataId, data) => {
        try {
            await issuePending(id, dataId, data)
            toast.success("Issue sent successfully")

            const updatedPendingData = pendingData.filter((item) => item._id !== id)
            setPendingData(updatedPendingData)

            const updatedFilteredData = filteredData.filter((item) => item._id !== id)
            setFilteredData(updatedFilteredData)

            const newTotalPages = Math.ceil(updatedFilteredData.length / itemsPerPage)
            setTotalPages(newTotalPages)

            // Adjust current page if necessary
            if (currentPage > newTotalPages) {
                setCurrentPage(newTotalPages || 1)
            } else if (currentPage === newTotalPages && updatedFilteredData.length % itemsPerPage === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1)
            }

            applyFiltersAndPaginate()
        } catch (error) {
            console.error("Error issuing item:", error)
            toast.error("Failed to issue item")
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    const handleColumnSelect = (value) => {
        setSearchColumn(value)
        setCurrentPage(1)
    }

    const startIndex = (currentPage - 1) * itemsPerPage
    // const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

    if (isLoading) {
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
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen max-w-[95vw]">
            <h1 className="text-3xl font-semibold mb-6 text-gray-800">Pending Data</h1>

            <div className="mb-4 flex items-center space-x-2">
                <Select onValueChange={handleColumnSelect} defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Columns</SelectItem>
                        <SelectItem value="ref">Reference</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="time">Time</SelectItem>
                        <SelectItem value="source">Source</SelectItem>
                        <SelectItem value="payment_type">Payment Type</SelectItem>
                        <SelectItem value="sale_type">Sale Type</SelectItem>
                        <SelectItem value="agent_name">Agent</SelectItem>
                        <SelectItem value="cm_first_name">First Name</SelectItem>
                        <SelectItem value="cm_last_name">Last Name</SelectItem>
                        <SelectItem value="cm_phone">Phone</SelectItem>
                        <SelectItem value="alternate_phone">Alternate Number</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="shipment_type">Shipment Type</SelectItem>
                        <SelectItem value="address">Address</SelectItem>
                        <SelectItem value="post_type">Post Type</SelectItem>
                        <SelectItem value="post">Post</SelectItem>
                        <SelectItem value="sub_district_taluka">Sub District / Taluka</SelectItem>
                        <SelectItem value="city">City / District</SelectItem>
                        <SelectItem value="pincode">Pincode</SelectItem>
                        <SelectItem value="state">State</SelectItem>
                        <SelectItem value="disease">Disease</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                        <SelectItem value="products">Products</SelectItem>
                    </SelectContent>
                </Select>
                <Input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} className="max-w-sm" />
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="max-w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Send</TableHead>

                                <TableHead>Issue</TableHead>
                                <TableHead>Ref</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Source</TableHead>

                                <TableHead>Payment Type</TableHead>
                                <TableHead>Sale Type</TableHead>
                                <TableHead>Agent</TableHead>

                                <TableHead>First Name</TableHead>
                                <TableHead>Last Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Alternate Number</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Comment</TableHead>
                                <TableHead>Shipment Type</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Post Type</TableHead>
                                <TableHead>Post</TableHead>

                                <TableHead>Sub District / Taluka</TableHead>
                                <TableHead>City / District</TableHead>
                                <TableHead>Pincode</TableHead>

                                <TableHead>State</TableHead>

                                <TableHead>Disease</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Products</TableHead>

                                <TableHead>City</TableHead>
                                <TableHead>Update</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item, index) => (
                                <TableRow key={item._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                    <TableCell>
                                        <Forward
                                            size={25}
                                            color="green"
                                            strokeWidth={2}
                                            style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
                                            onClick={() => handleSendToConfirmed(item._id, item.dataId, item.data)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <SendHorizontal
                                            size={20}
                                            color="red"
                                            strokeWidth={2}
                                            style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
                                            onClick={() => handleIssue(item._id, item.dataId, item.data)}
                                        />
                                    </TableCell>
                                    <TableCell>{item.ref}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>{item.time}</TableCell>
                                    <TableCell>{item.source?.value}</TableCell>

                                    <TableCell>{item.payment_type?.value}</TableCell>
                                    <TableCell>{item.sale_type?.value}</TableCell>

                                    <TableCell>{item.agent_name?.value}</TableCell>
                                    <TableCell>{item.cm_first_name}</TableCell>
                                    <TableCell>{item.cm_last_name}</TableCell>
                                    <TableCell>{item.cm_phone}</TableCell>
                                    <TableCell>{item.alternate_phone}</TableCell>
                                    <TableCell>{item.email}</TableCell>
                                    <TableCell>{item.status?.value}</TableCell>
                                    <TableCell>{item.comment}</TableCell>
                                    <TableCell>{item.shipment_type?.value}</TableCell>
                                    <TableCell>{item.address}</TableCell>
                                    <TableCell>{item.post_type?.value}</TableCell>
                                    <TableCell>{item.post}</TableCell>
                                    <TableCell>{item.sub_district_taluka}</TableCell>
                                    <TableCell>{item.city}</TableCell>
                                    <TableCell>{item.pincode}</TableCell>

                                    <TableCell>{item.state?.value}</TableCell>

                                    <TableCell>{item.disease?.value}</TableCell>
                                    <TableCell>{item.amount?.value}</TableCell>
                                    <TableCell>{item.products?.value}</TableCell>

                                    <TableCell>{item.city}</TableCell>
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <Pagination className="mt-4 flex justify-center">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1
                        if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationLink onClick={() => handlePageChange(pageNumber)} isActive={currentPage === pageNumber}>
                                        {pageNumber}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                            return <PaginationEllipsis key={index} />
                        }
                        return null
                    })}
                    <PaginationItem>
                        <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
            <div className="flex items-center space-x-2">
                <Input
                    type="number"
                    placeholder="Go to page"
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && goToPage) {
                            handleGoToPage();
                        }
                    }}
                    className="w-40"
                    min={1}
                    max={totalPages}
                />
                <Button onClick={handleGoToPage} disabled={!goToPage}>
                    Go
                </Button>
            </div>

            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Pending Data</DialogTitle>
                        <DialogDescription>Please review the pending data before sending to confirmed.</DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="mt-4 max-h-[60vh] overflow-y-auto">
                            <div className="mt-4">
                                <p>
                                    <strong>Reference:</strong> {selectedItem.ref}
                                </p>
                                <p>
                                    <strong>Date:</strong> {selectedItem.date}
                                </p>
                                <p>
                                    <strong>Time:</strong> {selectedItem.time}
                                </p>
                                <p>
                                    <strong>Source:</strong> {selectedItem.source?.value}
                                </p>
                                <p>
                                    <strong>Name:</strong> {selectedItem.cm_first_name} {selectedItem.cm_last_name}
                                </p>
                                <p>
                                    <strong>Phone:</strong> {selectedItem.cm_phone}
                                </p>
                                <p>
                                    <strong>Alternate Phone:</strong> {selectedItem.alternate_phone}
                                </p>
                                <p>
                                    <strong>Email:</strong> {selectedItem.email}
                                </p>
                                <p>
                                    <strong>Agent Name:</strong> {selectedItem.agent_name?.value}
                                </p>
                                <p>
                                    <strong>Status:</strong> {selectedItem.status?.value}
                                </p>
                                <p>
                                    <strong>Remark:</strong> {selectedItem.remark?.value}
                                </p>
                                <p>
                                    <strong>Comment:</strong> {selectedItem.comment}
                                </p>
                                <p>
                                    <strong>Shipment Type:</strong> {selectedItem.shipment_type?.value}
                                </p>
                                <p>
                                    <strong>Address:</strong> {selectedItem.address}
                                </p>
                                <p>
                                    <strong>Post Type:</strong> {selectedItem.post_type?.value}
                                </p>
                                <p>
                                    <strong>Post:</strong> {selectedItem.post}
                                </p>
                                <p>
                                    <strong>Sub District/Taluka:</strong> {selectedItem.sub_district_taluka}
                                </p>
                                <p>
                                    <strong>City:</strong> {selectedItem.city}
                                </p>
                                <p>
                                    <strong>Pincode:</strong> {selectedItem.pincode}
                                </p>
                                <p>
                                    <strong>State:</strong> {selectedItem.state?.value}
                                </p>
                                <p>
                                    <strong>Disease:</strong> {selectedItem.disease?.value}
                                </p>
                                <p>
                                    <strong>Amount:</strong> {selectedItem.amount?.value}
                                </p>
                                <p>
                                    <strong>Products:</strong> {selectedItem.products?.value}
                                </p>
                                <p>
                                    <strong>Quantity:</strong> {selectedItem.quantity}
                                </p>
                            </div>
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

