
// "use client"

// import { useState, useEffect, useCallback, useRef } from "react"
// import {
//     getAllDispatched,
//     dispatchDataFunction,
//     updatePositionAndDate,
//     raiseComplain,
//     delivered
// } from "@/services/dispatchedService"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { toast } from "react-hot-toast"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


// import {
//     Pagination,
//     PaginationContent,
//     PaginationItem,
//     PaginationLink,
//     PaginationNext,
//     PaginationPrevious,
//     PaginationEllipsis,
// } from "@/components/ui/pagination"
// import { Loader2, Scan, RefreshCcw } from "lucide-react"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { format, isAfter } from "date-fns"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Label } from "@/components/ui/label"

// const parseIndianDate = (dateString) => {
//     if (!dateString) return null
//     const [day, month, year] = dateString.split("/")
//     return new Date(year, month - 1, day)
// }

// const Table = ({ children }) => (
//     <div className="overflow-x-auto">
//         <table className="w-full border-collapse min-w-max">{children}</table>
//     </div>
// )

// const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

// // const TableRow = ({ children, className, item }) => (
// //     <tr className={`bg-green-100 hover:bg-green-100 ${className}`}>{children}</tr>
// // )

// const TableRow = ({ children, item }) => {
//     const getRowBackgroundClass = () => {
//         if (item?.isReturn) {
//             return "bg-orange-100  hover:bg-orange-100"
//         } else {
//             return "bg-green-100 hover:bg-green-100"
//         }
//     }

//     return <tr className={getRowBackgroundClass()}>{children}</tr>
// }

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

// const DispatchPage = () => {
//     const [dispatchData, setDispatchData] = useState([])
//     const [filteredData, setFilteredData] = useState([])
//     const [currentPage, setCurrentPage] = useState(1)
//     const [itemsPerPage] = useState(10)
//     const [totalPages, setTotalPages] = useState(1)
//     const [isLoading, setIsLoading] = useState(true)
//     const [error, setError] = useState(null)
//     const [searchTerm, setSearchTerm] = useState("")
//     const [paginatedData, setPaginatedData] = useState([])
//     const [searchColumn, setSearchColumn] = useState("all")
//     const [goToPage, setGoToPage] = useState("")
//     const [selectedPositions, setSelectedPositions] = useState({})
//     const [selectedDates, setSelectedDates] = useState({})
//     const [lastUpdateDates, setLastUpdateDates] = useState({})
//     const [complaintDetails, setComplaintDetails] = useState({
//         complain_id: "",
//         complain_detail: "",
//         complain_comment: ""
//     })

//     // Scanning functionality
//     const [manualInput, setManualInput] = useState("")
//     const [isScanning, setIsScanning] = useState(false)
//     const [scanInput, setScanInput] = useState("")
//     const scanInputRef = useRef(null)
//     const [refreshing, setRefreshing] = useState(false)


//     const fetchData = useCallback(async () => {
//         try {
//             setIsLoading(true)
//             const response = await getAllDispatched()
//             setDispatchData(response.data.data)
//             setFilteredData(response.data.data)
//             setTotalPages(Math.ceil(response.data.data.length / itemsPerPage))

//             // Initialize lastUpdateDates
//             const initialLastUpdateDates = {}
//             response.data.data.forEach((item) => {
//                 const locationHistory = item.location_and_date || {}
//                 const dates = Object.values(locationHistory)
//                 initialLastUpdateDates[item._id] =
//                     dates.length > 0
//                         ? dates.reduce((a, b) => (isAfter(parseIndianDate(a), parseIndianDate(b)) ? a : b))
//                         : item.date
//             })
//             setLastUpdateDates(initialLastUpdateDates)
//         } catch (error) {
//             console.error("Error fetching dispatch data:", error)
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
//     //     const results = dispatchData.filter((item) => {
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
//     // }, [dispatchData, searchTerm, searchColumn, itemsPerPage, currentPage])
//     const applyFiltersAndPaginate = useCallback(() => {
//         const results = dispatchData.filter((item) => {
//             if (searchColumn === "all") {
//                 return Object.values(item).some(
//                     (val) =>
//                         val !== null &&
//                         val !== undefined &&
//                         typeof val === "string" &&
//                         val.toLowerCase().includes(searchTerm.toLowerCase())
//                 );
//             } else {
//                 const value = item?.[searchColumn]; // Safe access using optional chaining
//                 if (value === null || value === undefined) return false;

//                 if (typeof value === "string") {
//                     return value.toLowerCase().includes(searchTerm.toLowerCase());
//                 } else if (typeof value === "object" && "value" in value && typeof value.value === "string") {
//                     return value.value.toLowerCase().includes(searchTerm.toLowerCase());
//                 }
//                 return false;
//             }
//         });

//         setFilteredData(results);
//         const newTotalPages = Math.ceil(results.length / itemsPerPage);
//         setTotalPages(newTotalPages);

//         const startIndex = (currentPage - 1) * itemsPerPage;
//         setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage));
//     }, [dispatchData, searchTerm, searchColumn, itemsPerPage, currentPage]);


//     useEffect(() => {
//         applyFiltersAndPaginate()
//     }, [applyFiltersAndPaginate])

//     const handleComplaint = async (item) => {
//         try {
//             // Add your API call here
//             await raiseComplain({
//                 itemId: item._id,
//                 ...complaintDetails,
//             })
//             toast.success("Complaint submitted successfully")
//             setComplaintDetails({ complain_id: "", complain_detail: "", complain_comment: "" })
//         } catch (error) {
//             console.error("Error submitting complaint:", error)
//             toast.error("Failed to submit complaint")
//         }
//     }

//     const handleManualInputChange = (e) => {
//         if (!isScanning) {
//             const cleanedInput = e.target.value.replace(/[^a-zA-Z0-9]/g, "")
//             setManualInput(cleanedInput)
//         }
//     }

//     const handleManualSend = async () => {
//         if (!manualInput) {
//             toast.error("Please enter a value")
//             return
//         }
//         try {
//             await handleDispatchAction(manualInput)
//             setManualInput("")
//         } catch (error) {
//             console.error("Error processing manual input:", error)
//             toast.error("Couldn't find required item")
//             setManualInput("")
//         }
//     }

//     const handleScanInput = async (e) => {
//         const value = e.target.value
//         setScanInput(value)

//         if (isScanning && value) {
//             try {
//                 await handleDispatchAction(value)
//                 setScanInput("")
//                 setTimeout(() => {
//                     scanInputRef.current?.focus()
//                 }, 500)
//             } catch (error) {
//                 console.error("Error processing scanned input:", error)
//                 // toast.error("Couldn't find required item")
//                 setScanInput("")
//                 setTimeout(() => {
//                     scanInputRef.current?.focus()
//                 }, 100)
//             }
//         }
//     }

//     const toggleScanning = () => {
//         setIsScanning(!isScanning)
//         if (!isScanning) {
//             setTimeout(() => {
//                 scanInputRef.current?.focus()
//             }, 100)
//         }
//     }

//     const handleDispatchAction = async (value) => {
//         try {
//             const response = await dispatchDataFunction(value)
//             toast.success("Action completed successfully")
//             await fetchData()
//         } catch (error) {
//             throw error
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

//     const handlePageChange = (page) => {
//         if (page >= 1 && page <= totalPages) {
//             setCurrentPage(page)
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

//     const getAvailablePositions = (item) => {
//         const positions = ["STATE", "DISTRICT", "CITY"]
//         const locationHistory = item.location_and_date || {}
//         const updatedPositions = Object.keys(locationHistory)

//         if (updatedPositions.length === 0) return ["STATE"]
//         if (updatedPositions.includes("STATE") && !updatedPositions.includes("DISTRICT")) return ["DISTRICT"]
//         if (updatedPositions.includes("DISTRICT") && !updatedPositions.includes("CITY")) return ["CITY"]
//         return []
//     }
//     const handleDelivered = async (itemId) => {
//         try {
//             await delivered(itemId)
//             toast.success("Item marked as delivered successfully")
//             await fetchData() // Refresh the data
//         } catch (error) {
//             console.error("Error marking item as delivered:", error)
//             toast.error("Failed to mark item as delivered")
//         }
//     }




//     const getLatestLocationDate = (locationAndDate) => {
//         if (!locationAndDate) return null;

//         // If CITY exists, return its date
//         if (locationAndDate["CITY"]) {
//             return locationAndDate["CITY"];
//         }
//         // If DISTRICT exists but no CITY, return DISTRICT date
//         else if (locationAndDate["DISTRICT"]) {
//             return locationAndDate["DISTRICT"];
//         }
//         // If only STATE exists, return STATE date
//         else if (locationAndDate["STATE"]) {
//             return locationAndDate["STATE"];
//         }
//         return null;
//     }



//     const handleUpdate = async (itemId) => {
//         if (!selectedPositions[itemId] || !selectedDates[itemId] || selectedPositions[itemId] === "Select") {
//             toast.error("Please select both position and date")
//             return
//         }
//         try {
//             const item = paginatedData.find((i) => i._id === itemId)
//             const formattedDate = format(new Date(selectedDates[itemId]), "dd/MM/yyyy")
//             const locationHistory = { ...item.location_and_date } || {}
//             const lastUpdateDate = parseIndianDate(lastUpdateDates[itemId])
//             const selectedDate = new Date(selectedDates[itemId])

//             if (!isAfter(selectedDate, lastUpdateDate)) {
//                 toast.error("Selected date must be later than the last update date")
//                 return
//             }

//             if (
//                 (selectedPositions[itemId] === "CITY" && !locationHistory["DISTRICT"]) ||
//                 (selectedPositions[itemId] === "DISTRICT" && !locationHistory["STATE"])
//             ) {
//                 toast.error(
//                     `You must first update ${selectedPositions[itemId] === "CITY" ? "DISTRICT" : "STATE"} before updating ${selectedPositions[itemId]}`,
//                 )
//                 return
//             }

//             locationHistory[selectedPositions[itemId]] = formattedDate
//             await updatePositionAndDate(itemId, selectedPositions[itemId], formattedDate, locationHistory)
//             toast.success("Position and date updated successfully")

//             // Update local state
//             setSelectedPositions({ ...selectedPositions, [itemId]: "Select" })
//             setSelectedDates({ ...selectedDates, [itemId]: "" })
//             setLastUpdateDates({ ...lastUpdateDates, [itemId]: formattedDate })

//             // Refresh data
//             await fetchData()
//         } catch (error) {
//             console.error("Update error:", error)
//             toast.error("Failed to update position and date")
//         }
//     }

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
//             {/* <h1 className="text-3xl font-semibold mb-6 text-gray-800">Dispatch Data</h1>

//             <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="flex items-center gap-2">
//                         <div className="flex-grow flex items-center gap-2">
//                             <Input
//                                 type="text"
//                                 value={manualInput}
//                                 onChange={handleManualInputChange}
//                                 placeholder="Enter code manually..."
//                                 className="h-9 max-w-[300px]"
//                                 disabled={isScanning}
//                                 onKeyDown={(e) => {
//                                     if (e.key === "Enter" && manualInput) {
//                                         handleManualSend()
//                                     }
//                                 }}
//                             />
//                             <Button onClick={handleManualSend} disabled={isScanning} size="sm" className="h-9">
//                                 Send
//                             </Button>
//                         </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                         <div className="flex-grow flex items-center gap-2">
//                             <Input
//                                 ref={scanInputRef}
//                                 type="text"
//                                 value={scanInput}
//                                 onChange={handleScanInput}
//                                 placeholder="Scan barcode..."
//                                 className="h-9 max-w-[300px]"
//                                 disabled={!isScanning}
//                             />
//                             <Button
//                                 onClick={toggleScanning}
//                                 variant={isScanning ? "destructive" : "default"}
//                                 size="sm"
//                                 className="h-9 w-[120px]"
//                             >
//                                 {isScanning ? (
//                                     <span className="flex items-center gap-2">
//                                         <Loader2 className="h-3 w-3 animate-spin" />
//                                         Scanning
//                                     </span>
//                                 ) : (
//                                     <span className="flex items-center gap-2">
//                                         <Scan className="h-3 w-3" />
//                                         Start Scan
//                                     </span>
//                                 )}
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="mb-4 flex items-center space-x-2">
//                 <Select onValueChange={handleColumnSelect} defaultValue="all">
//                     <SelectTrigger className="w-[180px]">
//                         <SelectValue placeholder="Select column" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="all">All Columns</SelectItem>
//                         <SelectItem value="ref">Reference</SelectItem>
//                         <SelectItem value="date">Date</SelectItem>
//                         <SelectItem value="time">Time</SelectItem>
//                         <SelectItem value="source">Source</SelectItem>
//                         <SelectItem value="payment_type">Payment Type</SelectItem>
//                         <SelectItem value="sale_type">Sale Type</SelectItem>
//                         <SelectItem value="agent_name">Agent</SelectItem>
//                         <SelectItem value="cm_first_name">First Name</SelectItem>
//                         <SelectItem value="cm_last_name">Last Name</SelectItem>
//                         <SelectItem value="cm_phone">Phone</SelectItem>
//                         <SelectItem value="alternate_phone">Alternate Number</SelectItem>
//                         <SelectItem value="email">Email</SelectItem>
//                         <SelectItem value="status">Status</SelectItem>
//                         <SelectItem value="shipment_type">Shipment Type</SelectItem>
//                         <SelectItem value="address">Address</SelectItem>
//                         <SelectItem value="post_type">Post Type</SelectItem>
//                         <SelectItem value="post">Post</SelectItem>
//                         <SelectItem value="district">District</SelectItem>
//                         <SelectItem value="city">City/Town/Village</SelectItem>
//                         <SelectItem value="pincode">Pincode</SelectItem>
//                         <SelectItem value="state">State</SelectItem>
//                         <SelectItem value="disease">Disease</SelectItem>
//                         <SelectItem value="amount">Amount</SelectItem>
//                         <SelectItem value="products">Products</SelectItem>
//                     </SelectContent>
//                 </Select>
//                 <Input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} className="max-w-sm" />
//             </div> */}

//             <Card className="mb-6">
//                 {/* Header Section */}
//                 <CardHeader className="flex flex-row items-center justify-between pb-4">
//                     <CardTitle className="text-3xl font-bold">Dispatch Data</CardTitle>
//                     <div className="flex items-center space-x-4">
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
//                         <Select onValueChange={handleColumnSelect} defaultValue="all">
//                             <SelectTrigger className="w-[200px]">
//                                 <SelectValue placeholder="Select column" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="all">All Columns</SelectItem>
//                                 <SelectItem value="ref">Reference</SelectItem>
//                                 <SelectItem value="date">Date</SelectItem>
//                                 <SelectItem value="time">Time</SelectItem>
//                                 <SelectItem value="source">Source</SelectItem>
//                                 <SelectItem value="payment_type">Payment Type</SelectItem>
//                                 <SelectItem value="sale_type">Sale Type</SelectItem>
//                                 <SelectItem value="agent_name">Agent</SelectItem>
//                                 <SelectItem value="cm_first_name">First Name</SelectItem>
//                                 <SelectItem value="cm_last_name">Last Name</SelectItem>
//                                 <SelectItem value="cm_phone">Phone</SelectItem>
//                                 <SelectItem value="alternate_phone">Alternate Number</SelectItem>
//                                 <SelectItem value="email">Email</SelectItem>
//                                 <SelectItem value="status">Status</SelectItem>
//                                 <SelectItem value="shipment_type">Shipment Type</SelectItem>
//                                 <SelectItem value="address">Address</SelectItem>
//                                 <SelectItem value="post_type">Post Type</SelectItem>
//                                 <SelectItem value="post">Post</SelectItem>
//                                 <SelectItem value="district">District</SelectItem>
//                                 <SelectItem value="city">City/Town/Village</SelectItem>
//                                 <SelectItem value="pincode">Pincode</SelectItem>
//                                 <SelectItem value="state">State</SelectItem>
//                                 <SelectItem value="disease">Disease</SelectItem>
//                                 <SelectItem value="amount">Amount</SelectItem>
//                                 <SelectItem value="products">Products</SelectItem>
//                             </SelectContent>
//                         </Select>
//                         <Input
//                             type="text"
//                             placeholder="Search..."
//                             value={searchTerm}
//                             onChange={handleSearch}
//                             className="max-w-sm"
//                         />
//                     </div>
//                 </CardHeader>

//                 {/* Content Section */}
//                 <CardContent>
//                     <div className="flex flex-wrap gap-10">
//                         {/* Manual Code Entry */}
//                         <div className="flex items-center gap-2">
//                             <Input
//                                 type="text"
//                                 value={manualInput}
//                                 onChange={handleManualInputChange}
//                                 placeholder="Enter code manually..."
//                                 className="h-9 w-[300px]"
//                                 disabled={isScanning}
//                                 onKeyDown={(e) => {
//                                     if (e.key === "Enter" && manualInput) {
//                                         handleManualSend();
//                                     }
//                                 }}
//                             />
//                             <Button onClick={handleManualSend} disabled={isScanning} size="sm" className="h-9">
//                                 Send
//                             </Button>
//                         </div>

//                         {/* Barcode Scanning */}
//                         <div className="flex items-center gap-2">
//                             <Input
//                                 ref={scanInputRef}
//                                 type="text"
//                                 value={scanInput}
//                                 onChange={handleScanInput}
//                                 placeholder="Scan barcode..."
//                                 className="h-9 w-[300px]"
//                                 disabled={!isScanning}
//                             />
//                             <Button
//                                 onClick={toggleScanning}
//                                 variant={isScanning ? "destructive" : "default"}
//                                 size="sm"
//                                 className="h-9 w-[120px]"
//                             >
//                                 {isScanning ? (
//                                     <span className="flex items-center gap-1">
//                                         <Loader2 className="h-3 w-3 animate-spin" />
//                                         Scanning
//                                     </span>
//                                 ) : (
//                                     <span className="flex items-center gap-1">
//                                         <Scan className="h-3 w-3" />
//                                         Start Scan
//                                     </span>
//                                 )}
//                             </Button>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* <div className="bg-white shadow-md rounded-lg overflow-hidden">
//                 <div className="max-w-full">
//                     <Table>
//                         <TableHeader>
//                             <tr className="bg-gray-200">
//                                 <TableHead>Complain</TableHead>
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
//                                 <TableHead>Last Position Updates</TableHead>
//                                 <TableHead>Last Update Date</TableHead>
//                                 <TableHead>Update</TableHead>
//                             </tr>
//                         </TableHeader>
//                         <TableBody>
//                             {paginatedData.map((item) => (
//                                 <TableRow key={item._id} item={item}>
//                                     <TableCell>
//                                         <Dialog>
//                                             <DialogTrigger asChild>
//                                                 <Button variant="destructive" size="sm" disabled={item.isReturn | item.isDelivered}>
//                                                     Raise Complaint
//                                                 </Button>
//                                             </DialogTrigger>
//                                             <DialogContent>
//                                                 <DialogHeader>
//                                                     <DialogTitle>Raise Complaint</DialogTitle>
//                                                 </DialogHeader>
//                                                 <div className="grid gap-4 py-4">

//                                                     <div className="grid gap-2">
//                                                         <Label htmlFor="complain_detail">Complaint Detail</Label>
//                                                         <Select
//                                                             value={complaintDetails.complain_detail}
//                                                             onValueChange={(value) =>
//                                                                 setComplaintDetails((prev) => ({
//                                                                     ...prev,
//                                                                     complain_detail: value,
//                                                                 }))
//                                                             }
//                                                         >
//                                                             <SelectTrigger>
//                                                                 <SelectValue placeholder="Select complaint type" />
//                                                             </SelectTrigger>
//                                                             <SelectContent>
//                                                                 <SelectItem value="Delay in Delivery of Articles">Delay in Delivery of Articles</SelectItem>
//                                                                 <SelectItem value="Non Delivery of Article">Non Delivery of Article</SelectItem>
//                                                                 <SelectItem value="Wrong Delivery Status Update">Wrong Delivery Status Update</SelectItem>
//                                                             </SelectContent>
//                                                         </Select>
//                                                     </div>
//                                                     <div className="grid gap-2">
//                                                         <Label htmlFor="complain_comment">Comment</Label>
//                                                         <Input
//                                                             id="complain_comment"
//                                                             value={complaintDetails.complain_comment}
//                                                             onChange={(e) =>
//                                                                 setComplaintDetails((prev) => ({
//                                                                     ...prev,
//                                                                     complain_comment: e.target.value,
//                                                                 }))
//                                                             }
//                                                         />
//                                                     </div>
//                                                     <Button
//                                                         onClick={() => handleComplaint(item)}
//                                                         disabled={
//                                                             !complaintDetails.complain_detail ||
//                                                             (item.confirmedId?.shipment_type?.value === "Indian Post" &&
//                                                                 !complaintDetails.complain_id || !complaintDetails.complain_comment)
//                                                         }
//                                                     >
//                                                         Submit Complaint
//                                                     </Button>
//                                                 </div>
//                                             </DialogContent>
//                                         </Dialog>
//                                     </TableCell>
//                                     <TableCell>{item.confirmedId?.ref}</TableCell>
//                                     <TableCell>{item.date}</TableCell>
//                                     <TableCell>{item.time}</TableCell>
//                                     <TableCell>{item.confirmedId?.source?.value}</TableCell>
//                                     <TableCell>{item.confirmedId?.payment_type?.value}</TableCell>
//                                     <TableCell>{item.confirmedId?.sale_type?.value}</TableCell>
//                                     <TableCell>{item.confirmedId?.agent_name?.value}</TableCell>
//                                     <TableCell>{item.confirmedId?.cm_first_name}</TableCell>
//                                     <TableCell>{item.confirmedId?.cm_last_name}</TableCell>
//                                     <TableCell>{item.confirmedId?.cm_phone}</TableCell>
//                                     <TableCell>{item.confirmedId?.alternate_phone}</TableCell>
//                                     <TableCell>{item.confirmedId?.email}</TableCell>
//                                     <TableCell>{item.confirmedId?.comment}</TableCell>
//                                     <TableCell>{item.confirmedId?.shipment_type?.value}</TableCell>
//                                     <TableCell>{item.confirmedId?.address}</TableCell>
//                                     <TableCell>{item.confirmedId?.post_type?.value}</TableCell>
//                                     <TableCell>{item.confirmedId?.post}</TableCell>
//                                     <TableCell>{item.confirmedId?.district}</TableCell>
//                                     <TableCell>{item.confirmedId?.city}</TableCell>
//                                     <TableCell>{item.confirmedId?.pincode}</TableCell>
//                                     <TableCell>{item.confirmedId?.state?.value}</TableCell>
//                                     <TableCell>{item.confirmedId?.disease?.value}</TableCell>
//                                     <TableCell>{item.confirmedId?.amount?.value}</TableCell>
//                                     <TableCell>
//                                         {Array.isArray(item.confirmedId?.products?.value) && item.confirmedId.products.value.length > 0
//                                             ? item.confirmedId.products.value.map((product, index) => (
//                                                 <div key={index}>
//                                                     {product.product} : {product.quantity}
//                                                 </div>
//                                             ))
//                                             : "No Products"}
//                                     </TableCell>

//                                     <TableCell>
//                                         {item.location_and_date ? (
//                                             <div>
//                                                 {Object.entries(item.location_and_date).map(([position, date]) => (
//                                                     <div key={position}>
//                                                         {position}: {date}
//                                                     </div>
//                                                 ))}
//                                                 {item.location_and_date["CITY"] && !item.isReturn && (
//                                                     <Button
//                                                         variant="default"
//                                                         size="sm"
//                                                         className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
//                                                         onClick={() => handleDelivered(item._id)}
//                                                         disabled={item.isDelivered}
//                                                     >
//                                                         Delivered
//                                                     </Button>
//                                                 )}
//                                             </div>
//                                         ) : (
//                                             "No updates"
//                                         )}
//                                     </TableCell>
//                                     <TableCell>
//                                         {item.location_and_date
//                                             ? getLatestLocationDate(item.location_and_date) || item.date
//                                             : item.date
//                                         }
//                                     </TableCell>
//                                     <TableCell>
//                                         <Select
//                                             value={selectedPositions[item._id] || "Select"}
//                                             onValueChange={(value) => setSelectedPositions({ ...selectedPositions, [item._id]: value })}
//                                         >
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="Select position" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectItem value="Select">Select</SelectItem>
//                                                 {getAvailablePositions(item).map((position) => (
//                                                     <SelectItem key={position} value={position}>
//                                                         {position}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                         <Input
//                                             type="date"
//                                             value={selectedDates[item._id] || ""}
//                                             onChange={(e) => {
//                                                 const newDate = e.target.value
//                                                 const itemDate = parseIndianDate(item.confirmedId.date)
//                                                 const lastUpdateDate = parseIndianDate(lastUpdateDates[item._id])
//                                                 const selectedDate = new Date(newDate)

//                                                 if (isAfter(selectedDate, lastUpdateDate) && isAfter(selectedDate, itemDate)) {
//                                                     setSelectedDates({ ...selectedDates, [item._id]: newDate })
//                                                 } else {
//                                                     toast.error("Selected date must be later than the last update date and item creation date")
//                                                 }
//                                             }}
//                                             min={format(parseIndianDate(lastUpdateDates[item._id]), "yyyy-MM-dd")}
//                                         />
//                                         <Button
//                                             onClick={() => handleUpdate(item._id)}
//                                             disabled={
//                                                 !selectedPositions[item._id] ||
//                                                 !selectedDates[item._id] ||
//                                                 selectedPositions[item._id] === "Select" ||
//                                                 item.isReturn
//                                             }
//                                         >
//                                             Update
//                                         </Button>
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </div>
//             </div> */}
//             <div className="bg-white shadow-md rounded-lg overflow-hidden">
//                 <div className="max-w-full">
//                     <Table>
//                         <TableHeader>
//                             <tr className="bg-gray-200">
//                                 {/* Complain */}
//                                 <TableHead>Complain</TableHead>
//                                 {/* Ref & AWB Number */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Ref</span>
//                                         <br />
//                                         <span>AWB Number</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Date</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Sale Type & Payment Type */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Sale Type</span>
//                                         <br />
//                                         <span>Payment Type</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* First Name & Last Name */}
//                                 <TableHead>
//                                     <div>
//                                         <span>First Name</span>
//                                         <br />
//                                         <span>Last Name</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Phone & Alternate Phone */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Phone</span>
//                                         <br />
//                                         <span>Alternate Phone</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Address */}
//                                 <TableHead>Address</TableHead>
//                                 {/* City & District */}
//                                 <TableHead>
//                                     <div>
//                                         <span>City</span>
//                                         <br />
//                                         <span>District</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* State & Pincode */}
//                                 <TableHead>
//                                     <div>
//                                         <span>State</span>
//                                         <br />
//                                         <span>Pincode</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Products */}
//                                 <TableHead>Products</TableHead>
//                                 {/* Amount */}
//                                 <TableHead>Amount</TableHead>
//                                 {/* Last Update Position */}
//                                 <TableHead>Last Update Position</TableHead>
//                                 {/* Update */}
//                                 <TableHead>Update</TableHead>
//                             </tr>
//                         </TableHeader>
//                         <TableBody>
//                             {paginatedData.map((item) => (
//                                 <TableRow key={item._id} item={item}>
//                                     {/* 1. Complain */}
//                                     <TableCell>
//                                         <Dialog>
//                                             <DialogTrigger asChild>
//                                                 <Button
//                                                     variant="destructive"
//                                                     size="sm"
//                                                     disabled={item.isReturn || item.isDelivered}
//                                                 >
//                                                     Raise Complaint
//                                                 </Button>
//                                             </DialogTrigger>
//                                             <DialogContent>
//                                                 <DialogHeader>
//                                                     <DialogTitle>Raise Complaint</DialogTitle>
//                                                 </DialogHeader>
//                                                 <div className="grid gap-4 py-4">
//                                                     <div className="grid gap-2">
//                                                         <Label htmlFor="complain_detail">Complaint Detail</Label>
//                                                         <Select
//                                                             value={complaintDetails.complain_detail}
//                                                             onValueChange={(value) =>
//                                                                 setComplaintDetails((prev) => ({
//                                                                     ...prev,
//                                                                     complain_detail: value,
//                                                                 }))
//                                                             }
//                                                         >
//                                                             <SelectTrigger>
//                                                                 <SelectValue placeholder="Select complaint type" />
//                                                             </SelectTrigger>
//                                                             <SelectContent>
//                                                                 <SelectItem value="Delay in Delivery of Articles">
//                                                                     Delay in Delivery of Articles
//                                                                 </SelectItem>
//                                                                 <SelectItem value="Non Delivery of Article">
//                                                                     Non Delivery of Article
//                                                                 </SelectItem>
//                                                                 <SelectItem value="Wrong Delivery Status Update">
//                                                                     Wrong Delivery Status Update
//                                                                 </SelectItem>
//                                                             </SelectContent>
//                                                         </Select>
//                                                     </div>
//                                                     <div className="grid gap-2">
//                                                         <Label htmlFor="complain_comment">Comment</Label>
//                                                         <Input
//                                                             id="complain_comment"
//                                                             value={complaintDetails.complain_comment}
//                                                             onChange={(e) =>
//                                                                 setComplaintDetails((prev) => ({
//                                                                     ...prev,
//                                                                     complain_comment: e.target.value,
//                                                                 }))
//                                                             }
//                                                         />
//                                                     </div>
//                                                     <Button
//                                                         onClick={() => handleComplaint(item)}
//                                                         // disabled={
//                                                         //     !complaintDetails.complain_detail ||
//                                                         //     (item.confirmedId?.shipment_type?.value === "Indian Post" &&
//                                                         //         (!complaintDetails.complain_id ||
//                                                         //             !complaintDetails.complain_comment))
//                                                         // }
//                                                         disabled={
//                                                             !complaintDetails.complain_detail || !complaintDetails.complain_comment
//                                                         }
//                                                     >
//                                                         Submit Complaint
//                                                     </Button>
//                                                 </div>
//                                             </DialogContent>
//                                         </Dialog>
//                                     </TableCell>

//                                     {/* 2. Ref & AWB Number */}
//                                     <TableCell>
//                                         <div>
//                                             {item.confirmedId?.ref}
//                                             <br />
//                                             {item.confirmedId?.awb_number}
//                                         </div>
//                                     </TableCell>

//                                     <TableCell>
//                                         <div>
//                                             {item.date}
//                                         </div>
//                                     </TableCell>

//                                     {/* 3. Sale Type & Payment Type */}
//                                     <TableCell>
//                                         <div>
//                                             {item.confirmedId?.sale_type?.value}
//                                             <br />
//                                             {item.confirmedId?.payment_type?.value}
//                                         </div>
//                                     </TableCell>

//                                     {/* 4. First Name & Last Name */}
//                                     <TableCell>
//                                         <div>
//                                             {item.confirmedId?.cm_first_name}
//                                             <br />
//                                             {item.confirmedId?.cm_last_name}
//                                         </div>
//                                     </TableCell>

//                                     {/* 5. Phone & Alternate Phone */}
//                                     <TableCell>
//                                         <div>
//                                             {item.confirmedId?.cm_phone}
//                                             <br />
//                                             {item.confirmedId?.alternate_phone}
//                                         </div>
//                                     </TableCell>

//                                     {/* 6. Address */}
//                                     <TableCell>{item.confirmedId?.address}</TableCell>

//                                     {/* 7. City & District */}
//                                     <TableCell>
//                                         <div>
//                                             {item.confirmedId?.city}
//                                             <br />
//                                             {item.confirmedId?.district}
//                                         </div>
//                                     </TableCell>

//                                     {/* 8. State & Pincode */}
//                                     <TableCell>
//                                         <div>
//                                             {item.confirmedId?.state?.value}
//                                             <br />
//                                             {item.confirmedId?.pincode}
//                                         </div>
//                                     </TableCell>

//                                     {/* 9. Products */}
//                                     <TableCell>
//                                         {Array.isArray(item.confirmedId?.products?.value) &&
//                                             item.confirmedId.products.value.length > 0
//                                             ? item.confirmedId.products.value.map((product, index) => (
//                                                 <div key={index}>
//                                                     {product.product} : {product.quantity}
//                                                 </div>
//                                             ))
//                                             : "No Products"}
//                                     </TableCell>

//                                     {/* 10. Amount */}
//                                     <TableCell>{item.confirmedId?.amount?.value}</TableCell>

//                                     {/* 11. Last Update Position */}
//                                     <TableCell>
//                                         {item.location_and_date ? (
//                                             <div>
//                                                 {Object.entries(item.location_and_date).map(([position, date]) => (
//                                                     <div key={position}>
//                                                         {position}: {date}
//                                                     </div>
//                                                 ))}
//                                                 {item.location_and_date["CITY"] && !item.isReturn && (
//                                                     <Button
//                                                         variant="default"
//                                                         size="sm"
//                                                         className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
//                                                         onClick={() => handleDelivered(item._id)}
//                                                         disabled={item.isDelivered}
//                                                     >
//                                                         Delivered
//                                                     </Button>
//                                                 )}
//                                             </div>
//                                         ) : (
//                                             "No updates"
//                                         )}
//                                     </TableCell>

//                                     {/* 12. Update Button */}
//                                     <TableCell>
//                                         <Select
//                                             value={selectedPositions[item._id] || "Select"}
//                                             onValueChange={(value) =>
//                                                 setSelectedPositions({ ...selectedPositions, [item._id]: value })
//                                             }
//                                         >
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="Select position" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectItem value="Select">Select</SelectItem>
//                                                 {getAvailablePositions(item).map((position) => (
//                                                     <SelectItem key={position} value={position}>
//                                                         {position}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                         <Input
//                                             type="date"
//                                             value={selectedDates[item._id] || ""}
//                                             onChange={(e) => {
//                                                 const newDate = e.target.value;
//                                                 const itemDate = parseIndianDate(item.date);
//                                                 const lastUpdateDate = parseIndianDate(lastUpdateDates[item._id]);
//                                                 const selectedDate = new Date(newDate);

//                                                 if (isAfter(selectedDate, lastUpdateDate) && isAfter(selectedDate, itemDate)) {
//                                                     setSelectedDates({ ...selectedDates, [item._id]: newDate });
//                                                 } else {
//                                                     toast.error(
//                                                         "Selected date must be later than the last update date and item creation date"
//                                                     );
//                                                 }
//                                             }}
//                                             min={format(parseIndianDate(lastUpdateDates[item._id]), "yyyy-MM-dd")}


//                                         />
//                                         {/* <Input
//                                             type="date"
//                                             value={
//                                                 selectedDates[item._id] ||
//                                                 new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) // Preselect today's date in YYYY-MM-DD format
//                                             }
//                                             onChange={(e) => {
//                                                 const newDate = e.target.value;
//                                                 const itemDate = parseIndianDate(item.date);
//                                                 const lastUpdateDate = parseIndianDate(lastUpdateDates[item._id]);
//                                                 const selectedDate = new Date(newDate);

//                                                 // Get today's date in Indian Standard Time (IST)
//                                                 const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

//                                                 if (
//                                                     isAfter(selectedDate, lastUpdateDate) &&
//                                                     isAfter(selectedDate, itemDate) &&
//                                                     newDate <= today // Ensuring max date is today
//                                                 ) {
//                                                     setSelectedDates({ ...selectedDates, [item._id]: newDate });
//                                                 } else {
//                                                     toast.error(
//                                                         "Selected date must be later than the last update date and item creation date, and cannot be in the future."
//                                                     );
//                                                 }
//                                             }}
//                                             min={format(parseIndianDate(lastUpdateDates[item._id]), "yyyy-MM-dd")}
//                                             // max={new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })} // Set max date to today in IST
//                                         /> */}

//                                         <Button
//                                             onClick={() => handleUpdate(item._id)}
//                                             disabled={
//                                                 !selectedPositions[item._id] ||
//                                                 !selectedDates[item._id] ||
//                                                 selectedPositions[item._id] === "Select" ||
//                                                 item.isReturn
//                                             }
//                                         >
//                                             Update
//                                         </Button>
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
//             <div className="flex items-center space-x-2 mt-4">
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
//         </div>
//     )
// }

// export default DispatchPage














"use client"

import { useState, useEffect, useRef } from "react"
import {
    getAllDispatched,
    dispatchDataFunction,
    updatePositionAndDate,
    raiseComplain,
    delivered,
} from "@/services/dispatchedService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination"
import { Loader2, Scan, RefreshCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isAfter, isEqual, startOfDay, format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import useAccessControl from "../AccessControl"

const parseIndianDate = (dateString) => {
    if (!dateString) return new Date() // Return current date as fallback

    try {
        const [day, month, year] = dateString.split("/")
        // Check if we have valid parts
        if (!day || !month || !year) return new Date()

        const parsedDate = new Date(year, month - 1, day)

        // Check if the date is valid
        if (isNaN(parsedDate.getTime())) {
            console.warn(`Invalid date: ${dateString}`)
            return new Date() // Return current date as fallback
        }

        return parsedDate
    } catch (error) {
        console.error(`Error parsing date ${dateString}:`, error)
        return new Date() // Return current date as fallback
    }
}

const Table = ({ children }) => (
    <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">{children}</table>
    </div>
)

const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

const TableRow = ({ children, item }) => {
    const getRowBackgroundClass = () => {
        if (item?.isReturn) {
            return "bg-orange-100 hover:bg-orange-100"
        } else {
            return "bg-green-100 hover:bg-green-100"
        }
    }

    return <tr className={getRowBackgroundClass()}>{children}</tr>
}

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

const DispatchPage = () => {
    const [dispatchData, setDispatchData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [goToPage, setGoToPage] = useState("")
    const [searchColumn, setSearchColumn] = useState("all")
    const [refreshing, setRefreshing] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState(null)
    const [columnPermissions, setColumnPermissions] = useState([])
    const [debugInfo, setDebugInfo] = useState({})

    const [selectedPositions, setSelectedPositions] = useState({})
    const [selectedDates, setSelectedDates] = useState({})
    const [lastUpdateDates, setLastUpdateDates] = useState({})
    const [complaintDetails, setComplaintDetails] = useState({
        complain_id: "",
        complain_detail: "",
        complain_comment: "",
    })

    // Scanning functionality
    const [manualInput, setManualInput] = useState("")
    const [isScanning, setIsScanning] = useState(false)
    const [scanInput, setScanInput] = useState("")
    const scanInputRef = useRef(null)

    const { permissions, loading } = useAccessControl("/dispatched")
    const navigate = useNavigate()

    useEffect(() => {
        if (loading) return // Wait until loading is complete

        console.log("User Permissions:", permissions) // Debugging

        // Ensure permissions exist
        if (!permissions) {
            navigate("/dashboard") // Redirect if no permissions
            return
        }

        // Check if user has access to this page
        if (!permissions.page || permissions.page !== "/dispatched") {
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
        // If permissions are still loading, assume no permission
        if (loading) return false

        // If no permissions or columns array is invalid, deny access
        if (!permissions || !permissions.columns || !Array.isArray(permissions.columns)) {
            return false
        }

        // Check if the column name is in the permissions array
        return permissions.columns.includes(columnName)
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
            console.log(`API call URL params: ${queryString}`)

            // Make the API call with the constructed query parameters
            const response = await getAllDispatched(queryString)
            console.log("API Response:", response)

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
                setDispatchData(response.data.data)

                // Ensure totalCount is a number
                const count = Number.parseInt(response.data.totalCount, 10) || 0
                setTotalCount(count)

                // Calculate total pages based on count and limit
                const pages = Math.ceil(count / limitNum) || 1
                setTotalPages(pages)

                // Ensure current page is valid
                const responsePage = Number.parseInt(response.data.currentPage, 10) || pageNum
                setCurrentPage(responsePage > pages ? 1 : responsePage)

                // Initialize lastUpdateDates
                const initialLastUpdateDates = {}
                response.data.data.forEach((item) => {
                    try {
                        const locationHistory = item.location_and_date || {}
                        const dates = Object.values(locationHistory).filter((date) => date) // Filter out null/undefined dates

                        if (dates.length > 0) {
                            // Safely find the latest date
                            let latestDate = dates[0]
                            for (let i = 1; i < dates.length; i++) {
                                const currentDate = parseIndianDate(dates[i])
                                const latestParsed = parseIndianDate(latestDate)

                                if (isAfter(currentDate, latestParsed)) {
                                    latestDate = dates[i]
                                }
                            }
                            initialLastUpdateDates[item._id] = latestDate
                        } else {
                            initialLastUpdateDates[item._id] = item.date || format(new Date(), "dd/MM/yyyy")
                        }
                    } catch (error) {
                        console.error(`Error processing dates for item ${item._id}:`, error)
                        initialLastUpdateDates[item._id] = format(new Date(), "dd/MM/yyyy")
                    }
                })
                setLastUpdateDates(initialLastUpdateDates)

                console.log(`Data loaded: ${response.data.data.length} items`)
                console.log(`Total count: ${count}, Total pages: ${pages}, Current page: ${responsePage}`)
            } else {
                console.error("Invalid response format:", response)
                setDispatchData([])
                setError("Invalid data format received from server")
            }
        } catch (error) {
            console.error("Error fetching dispatch data:", error)
            setError("Failed to fetch data. Please try again later.")
            setDispatchData([])
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

    const handleGoToPage = () => {
        const pageNumber = Number.parseInt(goToPage, 10)
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            fetchData(pageNumber, itemsPerPage, searchTerm, searchColumn)
            setGoToPage("")
        } else {
            toast.error(`Please enter a valid page number between 1 and ${totalPages}`)
        }
    }

    const handleComplaint = async (item) => {
        if (!hasColumnPermission("raise_complain")) {
            toast.error("You don't have permission to raise complaints")
            return
        }

        try {
            // Add your API call here
            await raiseComplain({
                itemId: item._id,
                ...complaintDetails,
            })
            toast.success("Complaint submitted successfully")
            setComplaintDetails({ complain_id: "", complain_detail: "", complain_comment: "" })
        } catch (error) {
            console.error("Error submitting complaint:", error)
            toast.error("Failed to submit complaint")
        }
    }

    const handleManualInputChange = (e) => {
        if (!isScanning) {
            const cleanedInput = e.target.value.replace(/[^a-zA-Z0-9]/g, "")
            setManualInput(cleanedInput)
        }
    }

    const handleManualSend = async () => {
        if (!manualInput) {
            toast.error("Please enter a value")
            return
        }
        try {
            await handleDispatchAction(manualInput)
            setManualInput("")
        } catch (error) {
            console.error("Error processing manual input:", error)
            toast.error("Couldn't find required item")
            setManualInput("")
        }
    }

    const handleScanInput = async (e) => {
        const value = e.target.value
        setScanInput(value)

        if (isScanning && value) {
            try {
                await handleDispatchAction(value)
                setScanInput("")
                setTimeout(() => {
                    scanInputRef.current?.focus()
                }, 500)
            } catch (error) {
                console.error("Error processing scanned input:", error)
                // toast.error("Couldn't find required item")
                setScanInput("")
                setTimeout(() => {
                    scanInputRef.current?.focus()
                }, 100)
            }
        }
    }

    const toggleScanning = () => {
        setIsScanning(!isScanning)
        if (!isScanning) {
            setTimeout(() => {
                scanInputRef.current?.focus()
            }, 100)
        }
    }

    const handleDispatchAction = async (value) => {
        try {
            const response = await dispatchDataFunction(value)
            toast.success("Action completed successfully")
            await fetchData(currentPage, itemsPerPage, searchTerm, searchColumn)
        } catch (error) {
            throw error
        }
    }

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchData(page, itemsPerPage, searchTerm, searchColumn)
        } else {
            console.warn(`Invalid page number: ${page}. Must be between 1 and ${totalPages}`)
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

    const getAvailablePositions = (item) => {
        const positions = ["STATE", "DISTRICT", "CITY"]
        const locationHistory = item.location_and_date || {}
        const updatedPositions = Object.keys(locationHistory)

        if (updatedPositions.length === 0) return ["STATE"]
        if (updatedPositions.includes("STATE") && !updatedPositions.includes("DISTRICT")) return ["DISTRICT"]
        if (updatedPositions.includes("DISTRICT") && !updatedPositions.includes("CITY")) return ["CITY"]
        return []
    }

    const handleDelivered = async (itemId) => {
        if (!hasColumnPermission("delivered")) {
            toast.error("You don't have permission to mark items as delivered")
            return
        }

        try {
            await delivered(itemId)
            toast.success("Item marked as delivered successfully")
            await fetchData(currentPage, itemsPerPage, searchTerm, searchColumn) // Refresh the data
        } catch (error) {
            console.error("Error marking item as delivered:", error)
            toast.error("Failed to mark item as delivered")
        }
    }

    const getLatestLocationDate = (locationAndDate) => {
        if (!locationAndDate) return null

        // If CITY exists, return its date
        if (locationAndDate["CITY"]) {
            return locationAndDate["CITY"]
        }
        // If DISTRICT exists but no CITY, return DISTRICT date
        else if (locationAndDate["DISTRICT"]) {
            return locationAndDate["DISTRICT"]
        }
        // If only STATE exists, return STATE date
        else if (locationAndDate["STATE"]) {
            return locationAndDate["STATE"]
        }
        return null
    }

    const handleUpdate = async (itemId) => {
        if (!hasColumnPermission("update_location")) {
            toast.error("You don't have permission to update position and date")
            return
        }

        if (!selectedPositions[itemId] || !selectedDates[itemId] || selectedPositions[itemId] === "Select") {
            toast.error("Please select both position and date")
            return
        }
        try {
            const item = dispatchData.find((i) => i._id === itemId)
            const formattedDate = format(new Date(selectedDates[itemId]), "dd/MM/yyyy")
            const locationHistory = { ...item.location_and_date } || {}
            const lastUpdateDate = parseIndianDate(lastUpdateDates[itemId])
            const selectedDate = new Date(selectedDates[itemId])

            if (!isAfter(selectedDate, lastUpdateDate)) {
                toast.error("Selected date must be later than the last update date")
                return
            }

            if (
                (selectedPositions[itemId] === "CITY" && !locationHistory["DISTRICT"]) ||
                (selectedPositions[itemId] === "DISTRICT" && !locationHistory["STATE"])
            ) {
                toast.error(
                    `You must first update ${selectedPositions[itemId] === "CITY" ? "DISTRICT" : "STATE"} before updating ${selectedPositions[itemId]}`,
                )
                return
            }

            locationHistory[selectedPositions[itemId]] = formattedDate
            await updatePositionAndDate(itemId, selectedPositions[itemId], formattedDate, locationHistory)
            toast.success("Position and date updated successfully")

            // Update local state
            setSelectedPositions({ ...selectedPositions, [itemId]: "Select" })
            setSelectedDates({ ...selectedDates, [itemId]: "" })
            setLastUpdateDates({ ...lastUpdateDates, [itemId]: formattedDate })

            // Refresh data
            await fetchData(currentPage, itemsPerPage, searchTerm, searchColumn)
        } catch (error) {
            console.error("Update error:", error)
            toast.error("Failed to update position and date")
        }
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

    if (isLoading && dispatchData.length === 0) {
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
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-3xl font-bold">Dispatch Data</CardTitle>
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
                                        disabled={refreshing}
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
                        <Select onValueChange={handleColumnSelect} defaultValue="all">
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Columns</SelectItem>
                                {hasColumnPermission("ref") && <SelectItem value="ref">Reference</SelectItem>}
                                {hasColumnPermission("date") && <SelectItem value="date">Date</SelectItem>}
                                {hasColumnPermission("time") && <SelectItem value="time">Time</SelectItem>}
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
                                {hasColumnPermission("location_and_date") && (
                                    <SelectItem value="location_and_date">Location Updates</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>

                {/* Content Section */}
                <CardContent>
                    <div className="flex flex-wrap gap-10">
                        {/* Manual Code Entry */}
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                value={manualInput}
                                onChange={handleManualInputChange}
                                placeholder="Enter code manually..."
                                className="h-9 w-[300px]"
                                disabled={isScanning}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && manualInput) {
                                        handleManualSend()
                                    }
                                }}
                            />
                            <Button onClick={handleManualSend} disabled={isScanning} size="sm" className="h-9">
                                Send
                            </Button>
                        </div>

                        {/* Barcode Scanning */}
                        <div className="flex items-center gap-2">
                            <Input
                                ref={scanInputRef}
                                type="text"
                                value={scanInput}
                                onChange={handleScanInput}
                                placeholder="Scan barcode..."
                                className="h-9 w-[300px]"
                                disabled={!isScanning}
                            />
                            <Button
                                onClick={toggleScanning}
                                variant={isScanning ? "destructive" : "default"}
                                size="sm"
                                className="h-9 w-[120px]"
                            >
                                {isScanning ? (
                                    <span className="flex items-center gap-1">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Scanning
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <Scan className="h-3 w-3" />
                                        Start Scan
                                    </span>
                                )}
                            </Button>
                        </div>

                        {/* Items per page selection */}
                        <div className="flex items-center space-x-2 ml-auto">
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

            {isLoading && dispatchData.length > 0 && (
                <div className="flex justify-center my-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="max-w-full">
                    <Table>
                        <TableHeader>
                            <tr className="bg-gray-200">
                                {/* Complain */}
                                {hasColumnPermission("raise_complain") && <TableHead>Complain</TableHead>}
                                {/* Ref & AWB Number */}
                                <TableHead>
                                    <div>
                                        {hasColumnPermission("ref") && <span>Ref</span>}
                                        {hasColumnPermission("ref") && hasColumnPermission("awb_number") && <br />}
                                        {hasColumnPermission("awb_number") && <span>AWB Number</span>}
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div>{hasColumnPermission("date") && <span>Date</span>}</div>
                                </TableHead>
                                {/* Sale Type & Payment Type */}
                                <TableHead>
                                    <div>
                                        {hasColumnPermission("sale_type") && <span>Sale Type</span>}
                                        {hasColumnPermission("sale_type") && hasColumnPermission("payment_type") && <br />}
                                        {hasColumnPermission("payment_type") && <span>Payment Type</span>}
                                    </div>
                                </TableHead>
                                {/* First Name & Last Name */}
                                <TableHead>
                                    <div>
                                        {hasColumnPermission("cm_first_name") && <span>First Name</span>}
                                        {hasColumnPermission("cm_first_name") && hasColumnPermission("cm_last_name") && <br />}
                                        {hasColumnPermission("cm_last_name") && <span>Last Name</span>}
                                    </div>
                                </TableHead>
                                {/* Phone & Alternate Phone */}
                                <TableHead>
                                    <div>
                                        {hasColumnPermission("cm_phone") && <span>Phone</span>}
                                        {hasColumnPermission("cm_phone") && hasColumnPermission("alternate_phone") && <br />}
                                        {hasColumnPermission("alternate_phone") && <span>Alternate Phone</span>}
                                    </div>
                                </TableHead>
                                {/* Address */}
                                {hasColumnPermission("address") && <TableHead>Address</TableHead>}
                                {/* City & District */}
                                <TableHead>
                                    <div>
                                        {hasColumnPermission("city") && <span>City</span>}
                                        {hasColumnPermission("city") && hasColumnPermission("district") && <br />}
                                        {hasColumnPermission("district") && <span>District</span>}
                                    </div>
                                </TableHead>
                                {/* State & Pincode */}
                                <TableHead>
                                    <div>
                                        {hasColumnPermission("state") && <span>State</span>}
                                        {hasColumnPermission("state") && hasColumnPermission("pincode") && <br />}
                                        {hasColumnPermission("pincode") && <span>Pincode</span>}
                                    </div>
                                </TableHead>
                                {/* Products */}
                                {hasColumnPermission("products") && <TableHead>Products</TableHead>}
                                {/* Amount */}
                                {hasColumnPermission("amount") && <TableHead>Amount</TableHead>}
                                {/* Last Update Position */}
                                {hasColumnPermission("location_and_date") && <TableHead>Last Update Position</TableHead>}
                                {/* Update */}
                                {hasColumnPermission("update_location") && <TableHead>Update</TableHead>}
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {dispatchData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12} className="text-center py-8">
                                        No data found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                dispatchData.map((item) => (
                                    <TableRow key={item._id} item={item}>
                                        {/* 1. Complain */}
                                        {hasColumnPermission("raise_complain") && (
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={item.isReturn || item.isDelivered || !hasColumnPermission("raise_complain")}
                                                        >
                                                            Raise Complaint
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Raise Complaint</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="complain_detail">Complaint Detail</Label>
                                                                <Select
                                                                    value={complaintDetails.complain_detail}
                                                                    onValueChange={(value) =>
                                                                        setComplaintDetails((prev) => ({
                                                                            ...prev,
                                                                            complain_detail: value,
                                                                        }))
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select complaint type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Delay in Delivery of Articles">
                                                                            Delay in Delivery of Articles
                                                                        </SelectItem>
                                                                        <SelectItem value="Non Delivery of Article">Non Delivery of Article</SelectItem>
                                                                        <SelectItem value="Wrong Delivery Status Update">
                                                                            Wrong Delivery Status Update
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="complain_comment">Comment</Label>
                                                                <Input
                                                                    id="complain_comment"
                                                                    value={complaintDetails.complain_comment}
                                                                    onChange={(e) =>
                                                                        setComplaintDetails((prev) => ({
                                                                            ...prev,
                                                                            complain_comment: e.target.value,
                                                                        }))
                                                                    }
                                                                />
                                                            </div>
                                                            <Button
                                                                onClick={() => handleComplaint(item)}
                                                                disabled={!complaintDetails.complain_detail || !complaintDetails.complain_comment}
                                                            >
                                                                Submit Complaint
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        )}

                                        {/* 2. Ref & AWB Number */}
                                        <TableCell>
                                            <div>
                                                {hasColumnPermission("ref") && item.confirmedId?.ref}
                                                {hasColumnPermission("ref") && hasColumnPermission("awb_number") && <br />}
                                                {hasColumnPermission("awb_number") && item.confirmedId?.awb_number}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div>{hasColumnPermission("date") && item.date}</div>
                                        </TableCell>

                                        {/* 3. Sale Type & Payment Type */}
                                        <TableCell>
                                            <div>
                                                {hasColumnPermission("sale_type") && item.confirmedId?.sale_type?.value}
                                                {hasColumnPermission("sale_type") && hasColumnPermission("payment_type") && <br />}
                                                {hasColumnPermission("payment_type") && item.confirmedId?.payment_type?.value}
                                            </div>
                                        </TableCell>

                                        {/* 4. First Name & Last Name */}
                                        <TableCell>
                                            <div>
                                                {hasColumnPermission("cm_first_name") && item.confirmedId?.cm_first_name}
                                                {hasColumnPermission("cm_first_name") && hasColumnPermission("cm_last_name") && <br />}
                                                {hasColumnPermission("cm_last_name") && item.confirmedId?.cm_last_name}
                                            </div>
                                        </TableCell>

                                        {/* 5. Phone & Alternate Phone */}
                                        <TableCell>
                                            <div>
                                                {hasColumnPermission("cm_phone") && item.confirmedId?.cm_phone}
                                                {hasColumnPermission("cm_phone") && hasColumnPermission("alternate_phone") && <br />}
                                                {hasColumnPermission("alternate_phone") && item.confirmedId?.alternate_phone}
                                            </div>
                                        </TableCell>

                                        {/* 6. Address */}
                                        {hasColumnPermission("address") && <TableCell>{item.confirmedId?.address}</TableCell>}

                                        {/* 7. City & District */}
                                        <TableCell>
                                            <div>
                                                {hasColumnPermission("city") && item.confirmedId?.city}
                                                {hasColumnPermission("city") && hasColumnPermission("district") && <br />}
                                                {hasColumnPermission("district") && item.confirmedId?.district}
                                            </div>
                                        </TableCell>

                                        {/* 8. State & Pincode */}
                                        <TableCell>
                                            <div>
                                                {hasColumnPermission("state") && item.confirmedId?.state?.value}
                                                {hasColumnPermission("state") && hasColumnPermission("pincode") && <br />}
                                                {hasColumnPermission("pincode") && item.confirmedId?.pincode}
                                            </div>
                                        </TableCell>

                                        {/* 9. Products */}
                                        {hasColumnPermission("products") && (
                                            <TableCell>
                                                {Array.isArray(item.confirmedId?.products?.value) && item.confirmedId.products.value.length > 0
                                                    ? item.confirmedId.products.value.map((product, index) => (
                                                        <div key={index}>
                                                            {product.product} : {product.quantity}
                                                        </div>
                                                    ))
                                                    : "No Products"}
                                            </TableCell>
                                        )}

                                        {/* 10. Amount */}
                                        {hasColumnPermission("amount") && <TableCell>{item.confirmedId?.amount?.value}</TableCell>}

                                        {/* 11. Last Update Position */}
                                        {hasColumnPermission("location_and_date") && (
                                            <TableCell>
                                                {item.location_and_date ? (
                                                    <div>
                                                        {Object.entries(item.location_and_date).map(([position, date]) => (
                                                            <div key={position}>
                                                                {position}: {date}
                                                            </div>
                                                        ))}
                                                        {item.location_and_date["CITY"] && !item.isReturn && hasColumnPermission("delivered") && (
                                                            <Button variant="default" size="sm" className="mt-2 bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleDelivered(item._id)} disabled={item.isDelivered} >
                                                                Delivered
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    "No updates"
                                                )}
                                            </TableCell>
                                        )}

                                        {/* 12. Update Button */}
                                        {hasColumnPermission("update_location") && (
                                            <TableCell>
                                                <Select
                                                    value={selectedPositions[item._id] || "Select"}
                                                    onValueChange={(value) => setSelectedPositions({ ...selectedPositions, [item._id]: value })}
                                                    disabled={!hasColumnPermission("update_location")}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select position" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Select">Select</SelectItem>
                                                        {getAvailablePositions(item).map((position) => (
                                                            <SelectItem key={position} value={position}>
                                                                {position}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {/* <Input
                                                        type="date"
                                                        value={selectedDates[item._id] || ""}
                                                        onChange={(e) => {
                                                            const newDate = e.target.value
                                                            const itemDate = parseIndianDate(item.date)
                                                            const lastUpdateDate = parseIndianDate(lastUpdateDates[item._id])
                                                            const selectedDate = new Date(newDate)

                                                            if (isAfter(selectedDate, lastUpdateDate) && isAfter(selectedDate, itemDate)) {
                                                                setSelectedDates({ ...selectedDates, [item._id]: newDate })
                                                            } else {
                                                                toast.error(
                                                                    "Selected date must be later than the last update date and item creation date",
                                                                )
                                                            }
                                                        }}
                                                        min={
                                                            lastUpdateDates[item._id]
                                                                ? format(parseIndianDate(lastUpdateDates[item._id]), "yyyy-MM-dd")
                                                                : format(new Date(), "yyyy-MM-dd")
                                                        }
                                                        disabled={!hasColumnPermission("update_location")}
                                                    /> */}
                                                <Input
                                                    type="date"
                                                    value={selectedDates[item._id] || ""}
                                                    onChange={(e) => {
                                                        const newDate = e.target.value;
                                                        // Convert all dates to the start of the day to ignore time differences
                                                        const itemDate = startOfDay(parseIndianDate(item.date));
                                                        const lastUpdateDate = lastUpdateDates[item._id]
                                                            ? startOfDay(parseIndianDate(lastUpdateDates[item._id]))
                                                            : startOfDay(new Date());
                                                        const selectedDate = startOfDay(new Date(newDate));

                                                        // Allow the selected date to be equal to or after both the last update and item creation dates
                                                        if (
                                                            (isAfter(selectedDate, lastUpdateDate) || isEqual(selectedDate, lastUpdateDate)) &&
                                                            (isAfter(selectedDate, itemDate) || isEqual(selectedDate, itemDate))
                                                        ) {
                                                            setSelectedDates({ ...selectedDates, [item._id]: newDate });
                                                        } else {
                                                            toast.error(
                                                                "Selected date must be later than or equal to the last update date and item creation date"
                                                            );
                                                        }
                                                    }}
                                                    min={
                                                        lastUpdateDates[item._id]
                                                            ? format(startOfDay(parseIndianDate(lastUpdateDates[item._id])), "yyyy-MM-dd")
                                                            : format(startOfDay(new Date()), "yyyy-MM-dd")
                                                    }
                                                    disabled={!hasColumnPermission("update_location")}
                                                />
                                                <Button
                                                    onClick={() => handleUpdate(item._id)}
                                                    disabled={
                                                        !selectedPositions[item._id] ||
                                                        !selectedDates[item._id] ||
                                                        selectedPositions[item._id] === "Select" ||
                                                        item.isReturn ||
                                                        !hasColumnPermission("update_location")
                                                    }
                                                >
                                                    Update
                                                </Button>
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
                            Showing {dispatchData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
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
        </div>
    )
}

export default DispatchPage
