

// "use client"

// import React, { useState, useEffect } from "react"
// import { getAllIncoming, deleteIncoming, sendIncomingToPending } from "@/services/incomingService"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { toast } from "react-hot-toast"
// import { RotateCw, RefreshCcw } from "lucide-react"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
// import { Loader2, Search, Trash2, SendHorizontal } from "lucide-react"
// import { useNavigate } from "react-router-dom"
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogFooter,
// } from "@/components/ui/dialog"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// const Table = ({ children }) => <table className="w-full border-collapse">{children}</table>

// const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

// const TableRow = ({ children, className }) => <tr className={className}>{children}</tr>

// const TableHead = ({ children, className }) => (
//     <th className={`${className} p-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-300`}>
//         {children}
//     </th>
// )

// const TableBody = ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>

// const TableCell = ({ children, className }) => <td className={`${className} p-3 text-sm text-gray-700`}>{children}</td>

// const IncomingPage = () => {
//     const [incomingData, setIncomingData] = useState([])
//     const [filteredData, setFilteredData] = useState([])
//     const [currentPage, setCurrentPage] = useState(1)
//     const [itemsPerPage] = useState(10)
//     const [totalPages, setTotalPages] = useState(1)
//     const [isLoading, setIsLoading] = useState(true)
//     const [error, setError] = useState(null)
//     const [searchTerm, setSearchTerm] = useState("")
//     const [filterStatus, setFilterStatus] = useState("All")
//     const [selectedItem, setSelectedItem] = useState(null)
//     const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
//     const [goToPage, setGoToPage] = useState("")
//     const [searchColumn, setSearchColumn] = useState("all")
//     const [refreshing, setRefreshing] = useState(false)

//     const navigate = useNavigate()

//     const fetchData = async () => {
//         try {
//             setIsLoading(true)
//             const response = await getAllIncoming()
//             setIncomingData(response.data.data)
//             setFilteredData(response.data.data)
//             setTotalPages(Math.ceil(response.data.data.length / itemsPerPage))
//         } catch (error) {
//             console.error("Error fetching lead data:", error)
//             setError("Failed to fetch data. Please try again later.")
//         } finally {
//             setIsLoading(false)
//         }
//     }
//     useEffect(() => {


//         fetchData()
//     }, [itemsPerPage])

//     const refreshData = async () => {
//         setRefreshing(true)
//         await fetchData()
//         setRefreshing(false)
//         toast.success("Data refreshed successfully")
//     }

//     useEffect(() => {
//         const results = incomingData.filter((item) => {
//             const columnValue = item[searchColumn];

//             const matchesSearch =
//                 searchColumn === "all"
//                     ? Object.values(item).some((val) => {
//                         if (val === null || val === undefined) return false; // Handle null & undefined values safely
//                         return (
//                             (typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase())) ||
//                             (typeof val === "number" && val.toString().includes(searchTerm))
//                         );
//                     })
//                     : columnValue !== null && columnValue !== undefined && ( // Ensure value is not null/undefined
//                         (typeof columnValue === "string" &&
//                             columnValue.toLowerCase().includes(searchTerm.toLowerCase())) ||
//                         (typeof columnValue === "object" &&
//                             "value" in columnValue &&
//                             columnValue.value &&
//                             typeof columnValue.value === "string" &&
//                             columnValue.value.toLowerCase().includes(searchTerm.toLowerCase())) ||
//                         (typeof columnValue === "number" && columnValue.toString().includes(searchTerm))
//                     );

//             const matchesFilter =
//                 filterStatus === "All" ||
//                 (filterStatus === "isSent" && item.is_sent_to_pending) ||
//                 (filterStatus === "isNotSent" && !item.is_sent_to_pending);

//             return matchesSearch && matchesFilter;
//         });

//         setFilteredData(results);
//         setTotalPages(Math.ceil(results.length / itemsPerPage));

//         // Only reset currentPage when searchTerm or searchColumn changes
//         if (searchTerm !== "" || searchColumn !== "all") {
//             setCurrentPage(1);
//         }
//     }, [searchTerm, searchColumn, incomingData, itemsPerPage, filterStatus]);


//     const handleDelete = async (id) => {
//         try {
//             await deleteIncoming(id)
//             toast.success("Data deleted successfully")
//             setIncomingData((prevData) => prevData.filter((item) => item._id !== id))
//             setFilteredData((prevData) => prevData.filter((item) => item._id !== id))
//             setTotalPages(Math.ceil((filteredData.length - 1) / itemsPerPage))
//         } catch (error) {
//             console.error("Error deleting item:", error)
//             setError("Failed to delete item. Please try again.")
//         }
//     }

//     const handleUpdateClick = async (id, is_sent_to_pending) => {
//         if (is_sent_to_pending) {
//             toast.error("Already sent to pending")
//             navigate(`/incoming`)
//         }
//         navigate(`/edit-incoming-data/${id}`)
//     }

//     const handlePageChange = (page) => {
//         if (page >= 1 && page <= totalPages) {
//             setCurrentPage(page)
//         }
//     }

//     const handleSendToPending = async (id) => {
//         const item = incomingData.find((item) => item._id === id)
//         setSelectedItem(item)
//         setIsReviewDialogOpen(true)
//     }


//     const validateForm = (formData) => {
//         let isValid = true;
//         const phoneRegex = /^\d{10}$/;

//         // Separate check for alternate_phone since it's optional
//         const requiredFields = Object.entries(formData).filter(([key]) => key !== 'alternate_phone');

//         // Check required fields
//         const hasEmptyField = requiredFields.some(([key, value]) => {
//             if (value === null || value === undefined) return true;
//             if (typeof value === "string" && value.trim() === "") return true;
//             if (typeof value === "object" && value !== null && "value" in value &&
//                 (value.value === null || value.value === "")) return true;
//             return false;
//         });

//         if (hasEmptyField) {
//             toast.error("Please fill all the required fields");
//             return false;
//         }

//         // Validate primary phone number
//         if (!phoneRegex.test(String(formData.cm_phone || ""))) {
//             toast.error("Phone number must be 10 digits");
//             return false;
//         }

//         // Validate alternate phone only if it's provided
//         if (formData.alternate_phone && formData.alternate_phone !== "") {
//             if (!phoneRegex.test(String(formData.alternate_phone))) {
//                 toast.error("Alternate phone number must be 10 digits");
//                 return false;
//             }
//         }

//         return true;
//     };


//     const confirmSendToPending = async () => {
//         if (selectedItem) {
//             try {
//                 const isValid = validateForm(selectedItem)
//                 if (!isValid) {
//                     return
//                 }
//                 await sendIncomingToPending(selectedItem._id)
//                 toast.success("Incoming sent to pending successfully")

//                 setIncomingData((prevData) =>
//                     prevData.map((item) => (item._id === selectedItem._id ? { ...item, is_sent_to_pending: true } : item)),
//                 )

//                 setFilteredData((prevData) =>
//                     prevData.map((item) => (item._id === selectedItem._id ? { ...item, is_sent_to_pending: true } : item)),
//                 )

//                 setIsReviewDialogOpen(false)
//             } catch (error) {
//                 toast.error("Failed to send incoming to pending")
//                 console.error(error)
//             }
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

//     const handleColumnSelect = (value) => {
//         setSearchColumn(value)
//         setCurrentPage(1)
//     }

//     const startIndex = (currentPage - 1) * itemsPerPage
//     const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

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




//             <Card className="mb-6">
//                 {/* Header Section */}
//                 <CardHeader className="flex flex-row items-center justify-between pb-4">
//                     <CardTitle className="text-3xl font-bold">Incoming Page</CardTitle>

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
//                 <br />
//                 {/* Content Section */}
//                 <CardContent>

//                     <div className="flex space-x-2">
//                         <Button
//                             onClick={() => {
//                                 setFilterStatus("All")
//                                 setCurrentPage(1)
//                             }}
//                             variant={filterStatus === "All" ? "default" : "outline"}
//                         >
//                             All
//                         </Button>
//                         <Button
//                             onClick={() => {
//                                 setFilterStatus("isSent")
//                                 setCurrentPage(1)
//                             }}
//                             variant={filterStatus === "isSent" ? "default" : "outline"}
//                         >
//                             Sent to Pending
//                         </Button>
//                         <Button
//                             onClick={() => {
//                                 setFilterStatus("isNotSent")
//                                 setCurrentPage(1)
//                             }}
//                             variant={filterStatus === "isNotSent" ? "default" : "outline"}
//                         >
//                             Not Sent
//                         </Button>
//                     </div>





//                 </CardContent>
//             </Card>
//             <div className="bg-white shadow-md rounded-lg overflow-hidden">
//                 <div className="overflow-x-auto max-w-full">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Send</TableHead>
//                                 <TableHead>Source</TableHead>
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
//                                         <span>Alternate Phone</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>Agent</TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Disease</span>
//                                         <br />
//                                         <span>Language</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>State</span>
//                                         <br />
//                                         <span>City/Town/Village</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Remark</span>
//                                         <br />
//                                         <span>Comment</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Date</span>
//                                         <br />
//                                         <span>Time</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>Update</TableHead>
//                                 <TableHead>Actions</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {paginatedData.map((item, index) => (
//                                 <TableRow
//                                     key={item._id}
//                                     className={
//                                         item.is_sent_to_pending
//                                             ? "bg-green-100"
//                                             : index % 2 === 0
//                                                 ? "bg-gray-50"
//                                                 : "bg-white"
//                                     }
//                                 >
//                                     {/* Send */}
//                                     <TableCell>
//                                         <SendHorizontal
//                                             size={20}
//                                             color={item.is_sent_to_pending ? "#28a745" : "#007BFF"}
//                                             strokeWidth={2}
//                                             style={{
//                                                 cursor: item.is_sent_to_pending ? "not-allowed" : "pointer",
//                                                 transition: "transform 0.2s ease",
//                                                 opacity: item.is_sent_to_pending ? 0.5 : 1,
//                                             }}
//                                             onClick={() =>
//                                                 !item.is_sent_to_pending && handleSendToPending(item._id)
//                                             }
//                                         />
//                                     </TableCell>
//                                     {/* Source */}
//                                     <TableCell>{item.source?.value}</TableCell>
//                                     {/* Name (First Name + Last Name) */}
//                                     <TableCell>
//                                         <div>
//                                             {item.cm_first_name}
//                                             <br />
//                                             {item.cm_last_name}
//                                         </div>
//                                     </TableCell>
//                                     {/* Contact (Phone + Alternate Phone) */}
//                                     <TableCell>
//                                         <div>
//                                             {item.cm_phone}
//                                             <br />
//                                             {item.alternate_phone}
//                                         </div>
//                                     </TableCell>
//                                     {/* Agent */}
//                                     <TableCell>{item.agent_name?.value}</TableCell>
//                                     {/* Disease & Language */}
//                                     <TableCell>
//                                         <div>
//                                             {item.disease?.value}
//                                             <br />
//                                             {item.language?.value}
//                                         </div>
//                                     </TableCell>
//                                     {/* Location (State + City) */}
//                                     <TableCell>
//                                         <div>
//                                             {item.state?.value}
//                                             <br />
//                                             {item.city}
//                                         </div>
//                                     </TableCell>
//                                     {/* Remark & Comment */}
//                                     <TableCell>
//                                         <div>
//                                             {item.remark?.value}
//                                             <br />
//                                             {item.comment}
//                                         </div>
//                                     </TableCell>
//                                     {/* Date & Time */}
//                                     <TableCell>
//                                         <div>
//                                             {item.date}
//                                             <br />
//                                             {item.time}
//                                         </div>
//                                     </TableCell>
//                                     {/* Update */}
//                                     <TableCell>
//                                         <RotateCw
//                                             size={20}
//                                             color="#007BFF"
//                                             strokeWidth={2}
//                                             style={{
//                                                 cursor: item.is_sent_to_pending ? "not-allowed" : "pointer",
//                                                 transition: "transform 0.2s ease",
//                                                 opacity: item.is_sent_to_pending ? 0.5 : 1,
//                                             }}
//                                             onClick={() =>
//                                                 !item.is_sent_to_pending &&
//                                                 handleUpdateClick(item._id, item.is_sent_to_pending)
//                                             }
//                                             onMouseOver={(e) =>
//                                                 !item.is_sent_to_pending &&
//                                                 (e.currentTarget.style.transform = "rotate(90deg)")
//                                             }
//                                             onMouseOut={(e) =>
//                                                 !item.is_sent_to_pending &&
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
//                                                     disabled={item.is_sent_to_pending}
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
//                                                     <AlertDialogAction onClick={() => handleDelete(item._id)}>
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
//             <div className="mt-4 flex flex-col items-center justify-center space-y-4">
//                 <Pagination>
//                     <PaginationContent>
//                         <PaginationItem>
//                             <PaginationPrevious
//                                 onClick={() => handlePageChange(currentPage - 1)}
//                                 disabled={currentPage === 1}
//                             />
//                         </PaginationItem>
//                         {[...Array(totalPages)].map((_, index) => {
//                             const pageNumber = index + 1;
//                             if (
//                                 pageNumber === 1 ||
//                                 pageNumber === totalPages ||
//                                 (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
//                             ) {
//                                 return (
//                                     <PaginationItem key={index}>
//                                         <PaginationLink
//                                             onClick={() => handlePageChange(pageNumber)}
//                                             isActive={currentPage === pageNumber}
//                                         >
//                                             {pageNumber}
//                                         </PaginationLink>
//                                     </PaginationItem>
//                                 );
//                             } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
//                                 return <PaginationEllipsis key={index} />;
//                             }
//                             return null;
//                         })}
//                         <PaginationItem>
//                             <PaginationNext
//                                 onClick={() => handlePageChange(currentPage + 1)}
//                                 disabled={currentPage === totalPages}
//                             />
//                         </PaginationItem>
//                     </PaginationContent>
//                 </Pagination>
//             </div>

//             <div className="flex items-center space-x-2">
//                 <Input
//                     type="number"
//                     placeholder="Go to page"
//                     value={goToPage}
//                     onChange={(e) => setGoToPage(e.target.value)}
//                     onKeyDown={(e) => {
//                         if (e.key === 'Enter' && goToPage) {
//                             handleGoToPage();
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
//                 <DialogContent className="max-w-md">
//                     <DialogHeader>
//                         <DialogTitle>Review Workbook Data</DialogTitle>
//                         <DialogDescription className="mb-4">
//                             Please review the data before sending to pending.
//                         </DialogDescription>
//                     </DialogHeader>
//                     {selectedItem && (
//                         <div className="mt-4">
//                             <dl className="space-y-3">

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
//                                     <dt className="text-sm font-medium text-gray-600">Language:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.language?.value}</dd>
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
//                     <DialogFooter className="mt-6 flex justify-end space-x-4">
//                         <Button onClick={() => setIsReviewDialogOpen(false)} variant="outline">
//                             Cancel
//                         </Button>
//                         <Button onClick={confirmSendToPending}>Confirm Send</Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     )
// }

// export default IncomingPage


"use client"

import React, { useState, useEffect } from "react"
import { getAllIncoming, deleteIncoming, sendIncomingToPending } from "@/services/incomingService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { RotateCw, RefreshCcw } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useAccessControl from "../../AccessControl"

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
import { Loader2, Trash2, SendHorizontal } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const Table = ({ children }) => <table className="w-full border-collapse">{children}</table>

const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

const TableRow = ({ children, className }) => <tr className={className}>{children}</tr>

const TableHead = ({ children, className }) => (
    <th className={`${className} p-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-300`}>
        {children}
    </th>
)

const TableBody = ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>

const TableCell = ({ children, className }) => <td className={`${className} p-3 text-sm text-gray-700`}>{children}</td>

const IncomingPage = () => {
    const [incomingData, setIncomingData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("All")
    const [selectedItem, setSelectedItem] = useState(null)
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
    const [goToPage, setGoToPage] = useState("")
    const [searchColumn, setSearchColumn] = useState("all")
    const [refreshing, setRefreshing] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState(null)
    const [columnPermissions, setColumnPermissions] = useState([])

    const { permissions, loading } = useAccessControl("/incoming")
    const navigate = useNavigate()

    // Access control logic
    useEffect(() => {
        if (loading) return // Wait until loading is complete

        // Ensure permissions exist
        if (!permissions) {
            console.log("No permissions found, redirecting to dashboard")
            navigate("/dashboard") // Redirect if no permissions
            return
        }

        // Check if user has access to this page
        if (!permissions.page || permissions.page !== "/incoming") {
            console.log("No access to incoming page, redirecting to dashboard")
            navigate("/dashboard") // Redirect if no access to this page
            return
        }

        // Store column permissions for later use
        if (permissions.columns && Array.isArray(permissions.columns)) {
            setColumnPermissions(permissions.columns)
            console.log("Column permissions set:", permissions.columns)
        } else {
            console.error("Invalid column permissions format:", permissions.columns)
            setColumnPermissions([])
        }
    }, [permissions, loading, navigate])

    // Column permission check
    const hasColumnPermission = (columnName) => {
        // If no permissions are set yet, don't show any columns
        if (!columnPermissions || !Array.isArray(columnPermissions) || columnPermissions.length === 0) {
            return true // Default to showing all columns if permissions aren't set up yet
        }

        // Check if the column is in the permissions array
        return columnPermissions.includes(columnName)
    }

    // Improved fetchData function with server-side pagination
    const fetchData = async (
        page = currentPage,
        limit = itemsPerPage,
        search = searchTerm,
        column = searchColumn,
        status = filterStatus,
    ) => {
        try {
            setIsLoading(true)
            console.log(
                `Fetching data for page ${page}, limit ${limit}, search "${search}", column "${column}", status "${status}"`,
            )

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

            // Add filter status if not "All"
            if (status !== "All") {
                queryParams.append("status", status === "isSent" ? "true" : "false")
            }

            // Log the full URL that will be called
            const queryString = queryParams.toString()
            console.log(`API call URL params: ${queryString}`)

            // Make the API call with the constructed query parameters
            const response = await getAllIncoming(queryString)

            if (!response || !response.data) {
                throw new Error("Invalid response from server")
            }

            if (response.data && response.data.data) {
                setIncomingData(response.data.data)

                // Ensure totalCount is a number
                const count = Number.parseInt(response.data.totalCount, 10) || 0
                setTotalCount(count)

                // Calculate total pages based on count and limit
                const pages = Math.ceil(count / limitNum) || 1
                setTotalPages(pages)

                // Set current page from response or use requested page
                setCurrentPage(Number.parseInt(response.data.currentPage, 10) || pageNum)

                console.log(`Data loaded: ${response.data.data.length} items`)
                console.log(`Total count: ${count}, Total pages: ${pages}, Current page: ${pageNum}`)
            } else {
                console.error("Invalid response format:", response)
                setIncomingData([])
                setError("Invalid data format received from server")
            }
        } catch (error) {
            console.error("Error fetching incoming data:", error)
            setError("Failed to fetch data. Please try again later.")
            setIncomingData([])
        } finally {
            setIsLoading(false)
        }
    }

    // Initial data fetch when component mounts
    useEffect(() => {
        if (!loading && permissions) {
            fetchData(1, itemsPerPage, searchTerm, searchColumn, filterStatus)
        }
    }, [loading, permissions])

    // Handle filter status changes
    useEffect(() => {
        if (filterStatus && !loading && permissions) {
            fetchData(1, itemsPerPage, searchTerm, searchColumn, filterStatus)
        }
    }, [filterStatus])

    // Handle search with debounce
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        if (!loading && permissions) {
            const timeout = setTimeout(() => {
                fetchData(1, itemsPerPage, searchTerm, searchColumn, filterStatus)
            }, 500) // 500ms debounce

            setSearchTimeout(timeout)
        }

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout)
            }
        }
    }, [searchTerm, searchColumn])

    const refreshData = async () => {
        setRefreshing(true)
        await fetchData(currentPage, itemsPerPage, searchTerm, searchColumn, filterStatus)
        setRefreshing(false)
        toast.success("Data refreshed successfully")
    }

    const handleDelete = async (id) => {
        if (permissions && !permissions.canDelete) {
            toast.error("You don't have permission to delete incoming data")
            return
        }

        try {
            await deleteIncoming(id)
            toast.success("Data deleted successfully")
            // Refresh the current page after deletion
            fetchData(currentPage, itemsPerPage, searchTerm, searchColumn, filterStatus)
        } catch (error) {
            console.error("Error deleting item:", error)
            setError("Failed to delete item. Please try again.")
        }
    }

    const handleUpdateClick = async (id, is_sent_to_pending) => {
        if (permissions && !permissions.canUpdate) {
            toast.error("You don't have permission to update incoming data")
            return
        }

        if (is_sent_to_pending) {
            toast.error("Already sent to pending")
            navigate(`/incoming`)
        }
        navigate(`/edit-incoming-data/${id}`)
    }

    // Improved pagination handler
    const handlePageChange = (page) => {
        console.log(`Attempting to change to page ${page}, total pages: ${totalPages}`)

        // Convert to number and validate
        const pageNum = Number(page)

        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            console.log(`Changing to page ${pageNum}`)
            // First update the current page state to provide immediate feedback
            setCurrentPage(pageNum)
            // Then fetch the data for that page
            fetchData(pageNum, itemsPerPage, searchTerm, searchColumn, filterStatus)
        } else {
            console.warn(`Invalid page number: ${page}. Must be between 1 and ${totalPages}`)
            toast.error(`Invalid page number. Must be between 1 and ${totalPages}`)
        }
    }

    const handleSendToPending = async (id) => {
        if (permissions && !hasColumnPermission("is_sent_to_pending")) {
            toast.error("You don't have permission to send incoming data to pending")
            return
        }

        const item = incomingData.find((item) => item._id === id)
        setSelectedItem(item)
        setIsReviewDialogOpen(true)
    }

    const validateForm = (formData) => {
        const phoneRegex = /^\d{10}$/

        // Separate check for alternate_phone since it's optional
        const requiredFields = Object.entries(formData).filter(([key]) => key !== "alternate_phone")

        // Check required fields
        const hasEmptyField = requiredFields.some(([key, value]) => {
            if (value === null || value === undefined) return true
            if (typeof value === "string" && value.trim() === "") return true
            if (
                typeof value === "object" &&
                value !== null &&
                "value" in value &&
                (value.value === null || value.value === "")
            )
                return true
            return false
        })

        if (hasEmptyField) {
            toast.error("Please fill all the required fields")
            return false
        }

        // Validate primary phone number
        if (!phoneRegex.test(String(formData.cm_phone || ""))) {
            toast.error("Phone number must be 10 digits")
            return false
        }

        // Validate alternate phone only if it's provided
        if (formData.alternate_phone && formData.alternate_phone !== "") {
            if (!phoneRegex.test(String(formData.alternate_phone))) {
                toast.error("Alternate phone number must be 10 digits")
                return false
            }
        }

        return true
    }

    const confirmSendToPending = async () => {
        if (permissions && !hasColumnPermission("is_sent_to_pending")) {
            toast.error("You don't have permission to send incoming data to pending")
            return
        }

        if (selectedItem) {
            try {
                const isValid = validateForm(selectedItem)
                if (!isValid) {
                    return
                }
                await sendIncomingToPending(selectedItem._id)
                toast.success("Incoming data sent to pending successfully")

                // Refresh the current page after sending to pending
                fetchData(currentPage, itemsPerPage, searchTerm, searchColumn, filterStatus)
                setIsReviewDialogOpen(false)
            } catch (error) {
                toast.error("Failed to send incoming data to pending")
                console.error(error)
            }
        }
    }

    // Improved go to page handler
    const handleGoToPage = () => {
        const pageNumber = Number.parseInt(goToPage, 10)
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            fetchData(pageNumber, itemsPerPage, searchTerm, searchColumn, filterStatus)
            setGoToPage("")
        } else {
            toast.error(`Please enter a valid page number between 1 and ${totalPages}`)
        }
    }

    const handleColumnSelect = (value) => {
        setSearchColumn(value)
        // Reset to page 1 when changing search column
        fetchData(1, itemsPerPage, searchTerm, value, filterStatus)
    }

    const handleItemsPerPageChange = (value) => {
        const newItemsPerPage = Number.parseInt(value, 10)
        console.log(`Changing items per page to ${newItemsPerPage}`)

        if (!isNaN(newItemsPerPage) && newItemsPerPage > 0) {
            setItemsPerPage(newItemsPerPage)
            // Reset to page 1 when changing items per page
            fetchData(1, newItemsPerPage, searchTerm, searchColumn, filterStatus)
        } else {
            console.error("Invalid items per page value:", value)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2">Loading permissions...</span>
            </div>
        )
    }

    if (isLoading && incomingData.length === 0) {
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

    // Improved pagination rendering
    const renderPaginationItems = () => {
        const items = []

        // Ensure totalPages is a valid number
        const validTotalPages = Math.max(1, Number.parseInt(totalPages) || 1)

        // Ensure currentPage is valid
        const validCurrentPage = Math.min(Math.max(1, Number.parseInt(currentPage) || 1), validTotalPages)

        console.log(`Rendering pagination: current page ${validCurrentPage}, total pages ${validTotalPages}`)

        // If we have 7 or fewer pages, show all pages
        if (validTotalPages <= 7) {
            for (let i = 1; i <= validTotalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={() => handlePageChange(i)}
                            isActive={validCurrentPage === i}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                )
            }
            return items
        }

        // Always show first page
        items.push(
            <PaginationItem key={1}>
                <PaginationLink
                    onClick={() => handlePageChange(1)}
                    isActive={validCurrentPage === 1}
                >
                    1
                </PaginationLink>
            </PaginationItem>
        )

        // Calculate start and end of the middle section
        let startPage, endPage

        if (validCurrentPage <= 4) {
            // We're near the beginning
            startPage = 2
            endPage = 5

            items.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                const page = startPage + i
                return (
                    <PaginationItem key={page}>
                        <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={validCurrentPage === page}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                )
            }))

            // Add ellipsis before last page
            items.push(
                <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                </PaginationItem>
            )
        } else if (validCurrentPage >= validTotalPages - 3) {
            // We're near the end
            // Add ellipsis after first page
            items.push(
                <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                </PaginationItem>
            )

            startPage = validTotalPages - 4
            endPage = validTotalPages - 1

            items.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                const page = startPage + i
                return (
                    <PaginationItem key={page}>
                        <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={validCurrentPage === page}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                )
            }))
        } else {
            // We're in the middle
            // Add ellipsis after first page
            items.push(
                <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                </PaginationItem>
            )

            // Show current page and one page on each side
            startPage = validCurrentPage - 1
            endPage = validCurrentPage + 1

            items.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                const page = startPage + i
                return (
                    <PaginationItem key={page}>
                        <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={validCurrentPage === page}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                )
            }))

            // Add ellipsis before last page
            items.push(
                <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                </PaginationItem>
            )
        }

        // Always show last page
        items.push(
            <PaginationItem key={validTotalPages}>
                <PaginationLink
                    onClick={() => handlePageChange(validTotalPages)}
                    isActive={validCurrentPage === validTotalPages}
                >
                    {validTotalPages}
                </PaginationLink>
            </PaginationItem>
        )

        return items
    }

    // Get visible columns based on permissions
    const getVisibleColumns = () => {
        const columns = []

        if (hasColumnPermission("is_sent_to_pending")) columns.push("is_sent_to_pending")
        if (hasColumnPermission("source")) columns.push("source")
        if (hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) columns.push("name")
        if (hasColumnPermission("cm_phone") || hasColumnPermission("alternate_phone")) columns.push("phone")
        if (hasColumnPermission("agent_name")) columns.push("agent_name")
        if (hasColumnPermission("disease") || hasColumnPermission("language")) columns.push("disease_language")
        if (hasColumnPermission("state") || hasColumnPermission("city")) columns.push("location")
        if (hasColumnPermission("remark") || hasColumnPermission("comment")) columns.push("remark_comment")
        if (hasColumnPermission("date")) columns.push("date")

        // Always include these action columns
        columns.push("update")
        columns.push("actions")

        return columns
    }

    const visibleColumns = getVisibleColumns()

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen max-w-full">
            <Card className="mb-6">
                {/* Header Section */}
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-3xl font-bold">Incoming Page</CardTitle>

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
                                        <span>Refresh</span>
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
                                {hasColumnPermission("date") && <SelectItem value="data">Data</SelectItem>}
                                {hasColumnPermission("source") && <SelectItem value="source">Source</SelectItem>}
                                {hasColumnPermission("cm_first_name") && <SelectItem value="cm_first_name">First Name</SelectItem>}
                                {hasColumnPermission("cm_last_name") && <SelectItem value="cm_last_name">Last Name</SelectItem>}
                                {hasColumnPermission("cm_phone") && <SelectItem value="cm_phone">Phone</SelectItem>}
                                {hasColumnPermission("agent_name") && <SelectItem value="agent_name">Agent</SelectItem>}
                                {hasColumnPermission("language") && <SelectItem value="language">Language</SelectItem>}
                                {hasColumnPermission("disease") && <SelectItem value="disease">Disease</SelectItem>}
                                {hasColumnPermission("state") && <SelectItem value="state">State</SelectItem>}
                                {hasColumnPermission("city") && <SelectItem value="city">City</SelectItem>}
                                {hasColumnPermission("remark") && <SelectItem value="remark">Remark</SelectItem>}
                                {hasColumnPermission("comment") && <SelectItem value="comment">Comment</SelectItem>}
                                {hasColumnPermission("date") && <SelectItem value="date">Date</SelectItem>}
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
                <br />
                {/* Content Section */}
                <CardContent>
                    <div className="flex justify-between items-center">
                        {/* Filter Buttons */}
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => {
                                    setFilterStatus("All")
                                    fetchData(1, itemsPerPage, searchTerm, searchColumn, "All")
                                }}
                                variant={filterStatus === "All" ? "default" : "outline"}
                            >
                                All
                            </Button>
                            {hasColumnPermission("is_sent_to_pending") && (
                                <>
                                    <Button
                                        onClick={() => {
                                            setFilterStatus("isSent")
                                            fetchData(1, itemsPerPage, searchTerm, searchColumn, "isSent")
                                        }}
                                        variant={filterStatus === "isSent" ? "default" : "outline"}
                                    >
                                        Sent to Pending
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setFilterStatus("isNotSent")
                                            fetchData(1, itemsPerPage, searchTerm, searchColumn, "isNotSent")
                                        }}
                                        variant={filterStatus === "isNotSent" ? "default" : "outline"}
                                    >
                                        Not Sent
                                    </Button>
                                </>
                            )}
                        </div>

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

            {isLoading && incomingData.length > 0 && (
                <div className="flex justify-center my-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {visibleColumns.includes("is_sent_to_pending") && <TableHead>Send</TableHead>}
                                {visibleColumns.includes("source") && <TableHead>Source</TableHead>}
                                {visibleColumns.includes("name") && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("cm_first_name") && <span>First Name</span>}
                                            {hasColumnPermission("cm_first_name") && hasColumnPermission("cm_last_name") && <br />}
                                            {hasColumnPermission("cm_last_name") && <span>Last Name</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("phone") && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("cm_phone") && <span>Phone</span>}
                                            {hasColumnPermission("cm_phone") && hasColumnPermission("alternate_phone") && <br />}
                                            {hasColumnPermission("alternate_phone") && <span>Alternate Phone</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("agent_name") && <TableHead>Agent</TableHead>}
                                {visibleColumns.includes("disease_language") && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("disease") && <span>Disease</span>}
                                            {hasColumnPermission("disease") && hasColumnPermission("language") && <br />}
                                            {hasColumnPermission("language") && <span>Language</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("location") && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("state") && <span>State</span>}
                                            {hasColumnPermission("state") && hasColumnPermission("city") && <br />}
                                            {hasColumnPermission("city") && <span>City/Town/Village</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("remark_comment") && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("remark") && <span>Remark</span>}
                                            {hasColumnPermission("remark") && hasColumnPermission("comment") && <br />}
                                            {hasColumnPermission("comment") && <span>Comment</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("date") && (
                                    <TableHead>
                                        <div>
                                            <span>Date</span>
                                            <br />
                                            <span>Time</span>
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("update") && <TableHead>Update</TableHead>}
                                {visibleColumns.includes("actions") && <TableHead>Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {incomingData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={visibleColumns.length} className="text-center py-8">
                                        No data found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                incomingData.map((item, index) => (
                                    <TableRow
                                        key={item._id}
                                        className={item.is_sent_to_pending ? "bg-green-100" : index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                                    >
                                        {/* Send */}
                                        {visibleColumns.includes("is_sent_to_pending") && (
                                            <TableCell>
                                                <SendHorizontal
                                                    size={20}
                                                    color={item.is_sent_to_pending ? "#28a745" : "#007BFF"}
                                                    strokeWidth={2}
                                                    style={{
                                                        cursor: item.is_sent_to_pending ? "not-allowed" : "pointer",
                                                        transition: "transform 0.2s ease",
                                                        opacity: item.is_sent_to_pending ? 0.5 : 1,
                                                    }}
                                                    onClick={() =>
                                                        !item.is_sent_to_pending &&
                                                        hasColumnPermission("is_sent_to_pending") &&
                                                        handleSendToPending(item._id)
                                                    }
                                                />
                                            </TableCell>
                                        )}
                                        {/* Source */}
                                        {visibleColumns.includes("source") && <TableCell>{item.source?.value || ""}</TableCell>}
                                        {/* Name (First Name + Last Name) */}
                                        {visibleColumns.includes("name") && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("cm_first_name") && (item.cm_first_name || "")}
                                                    {hasColumnPermission("cm_first_name") && hasColumnPermission("cm_last_name") && <br />}
                                                    {hasColumnPermission("cm_last_name") && (item.cm_last_name || "")}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Contact (Phone + Alternate Phone) */}
                                        {visibleColumns.includes("phone") && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("cm_phone") && (item.cm_phone || "")}
                                                    {hasColumnPermission("cm_phone") && hasColumnPermission("alternate_phone") && <br />}
                                                    {hasColumnPermission("alternate_phone") && (item.alternate_phone || "")}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Agent */}
                                        {visibleColumns.includes("agent_name") && <TableCell>{item.agent_name?.value || ""}</TableCell>}
                                        {/* Disease & Language */}
                                        {visibleColumns.includes("disease_language") && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("disease") && (item.disease?.value || "")}
                                                    {hasColumnPermission("disease") && hasColumnPermission("language") && <br />}
                                                    {hasColumnPermission("language") && (item.language?.value || "")}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Location (State + City) */}
                                        {visibleColumns.includes("location") && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("state") && (item.state?.value || "")}
                                                    {hasColumnPermission("state") && hasColumnPermission("city") && <br />}
                                                    {hasColumnPermission("city") && (item.city || "")}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Remark & Comment */}
                                        {visibleColumns.includes("remark_comment") && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("remark") && (item.remark?.value || "")}
                                                    {hasColumnPermission("remark") && hasColumnPermission("comment") && <br />}
                                                    {hasColumnPermission("comment") && (item.comment || "")}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Date & Time */}
                                        {visibleColumns.includes("date") && (
                                            <TableCell>
                                                <div>
                                                    {item.date || ""}
                                                    <br />
                                                    {item.time || ""}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Update */}
                                        {visibleColumns.includes("update") && (
                                            <TableCell>
                                                <RotateCw
                                                    size={20}
                                                    color="#007BFF"
                                                    strokeWidth={2}
                                                    style={{
                                                        cursor: item.is_sent_to_pending || !permissions?.canUpdate ? "not-allowed" : "pointer",
                                                        transition: "transform 0.2s ease",
                                                        opacity: item.is_sent_to_pending || !permissions?.canUpdate ? 0.5 : 1,
                                                    }}
                                                    onClick={() =>
                                                        !item.is_sent_to_pending &&
                                                        permissions?.canUpdate &&
                                                        handleUpdateClick(item._id, item.is_sent_to_pending)
                                                    }
                                                    onMouseOver={(e) =>
                                                        !item.is_sent_to_pending &&
                                                        permissions?.canUpdate &&
                                                        (e.currentTarget.style.transform = "rotate(90deg)")
                                                    }
                                                    onMouseOut={(e) =>
                                                        !item.is_sent_to_pending &&
                                                        permissions?.canUpdate &&
                                                        (e.currentTarget.style.transform = "rotate(0deg)")
                                                    }
                                                />
                                            </TableCell>
                                        )}
                                        {/* Actions */}
                                        {visibleColumns.includes("actions") && (
                                            <TableCell>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                                                            disabled={item.is_sent_to_pending || !permissions?.canDelete}
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
                                                            <AlertDialogAction onClick={() => permissions?.canDelete && handleDelete(item._id)}>
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
                            Showing {incomingData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Items per page:</span>
                                <Select
                                    value={String(itemsPerPage)}
                                    onValueChange={handleItemsPerPageChange}
                                >
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
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Review Workbook Data</DialogTitle>
                        <DialogDescription className="mb-4">Please review the data before sending to pending.</DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="mt-4">
                            <dl className="space-y-3">
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
                                            {hasColumnPermission("cm_first_name") && hasColumnPermission("cm_last_name") ? " " : ""}
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
                                {hasColumnPermission("language") && (
                                    <div className="flex justify-between border-b pb-1">
                                        <dt className="text-sm font-medium text-gray-600">Language:</dt>
                                        <dd className="text-sm text-gray-800">{selectedItem.language?.value}</dd>
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
                    <DialogFooter className="mt-6 flex justify-end space-x-4">
                        <Button onClick={() => setIsReviewDialogOpen(false)} variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={confirmSendToPending}>Confirm Send</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default IncomingPage