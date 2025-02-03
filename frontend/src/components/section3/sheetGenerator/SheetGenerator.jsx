

// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { getAllConfirmed } from "@/services/confirmedService"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { toast } from "react-hot-toast"
// import {
//     Pagination,
//     PaginationContent,
//     PaginationItem,
//     PaginationLink,
//     PaginationNext,
//     PaginationPrevious,
//     PaginationEllipsis,
// } from "@/components/ui/pagination"
// import { Loader2, Download } from "lucide-react"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

// const SheetGenerator = () => {
//     const [confirmedData, setConfirmedData] = useState([])
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
//     const [shipmentTypeFilter, setShipmentTypeFilter] = useState("all")

//     const fetchData = useCallback(async () => {
//         try {
//             setIsLoading(true)
//             const response = await getAllConfirmed()
//             setConfirmedData(response.data.data)
//             setFilteredData(response.data.data)
//             setTotalPages(Math.ceil(response.data.data.length / itemsPerPage))
//         } catch (error) {
//             console.error("Error fetching confirmed data:", error)
//             setError("Failed to fetch data. Please try again later.")
//         } finally {
//             setIsLoading(false)
//         }
//     }, [itemsPerPage])

//     useEffect(() => {
//         fetchData()
//     }, [fetchData])

//     const applyFiltersAndPaginate = useCallback(() => {
//         const results = confirmedData.filter((item) => {
//             // Apply shipment_type filter
//             const shipmentType = item.shipment_type?.value || ""
//             if (shipmentTypeFilter !== "all" && shipmentType !== shipmentTypeFilter) {
//                 return false
//             }

//             // Apply search filter
//             if (searchColumn === "all") {
//                 return Object.values(item).some(
//                     (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()),
//                 )
//             } else {
//                 const value = item[searchColumn]
//                 if (typeof value === "string") {
//                     return value.toLowerCase().includes(searchTerm.toLowerCase())
//                 } else if (typeof value === "object" && value !== null && "value" in value) {
//                     return value.value.toLowerCase().includes(searchTerm.toLowerCase())
//                 }
//             }
//             return false
//         })

//         setFilteredData(results)
//         const newTotalPages = Math.ceil(results.length / itemsPerPage)
//         setTotalPages(newTotalPages)

//         const startIndex = (currentPage - 1) * itemsPerPage
//         setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
//     }, [confirmedData, searchTerm, searchColumn, itemsPerPage, currentPage, shipmentTypeFilter])

//     useEffect(() => {
//         applyFiltersAndPaginate()
//     }, [applyFiltersAndPaginate])

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

//     const handleShipmentTypeFilter = (value) => {
//         setShipmentTypeFilter(value)
//         setCurrentPage(1)
//     }

//     const downloadCSV = (type) => {
//         // let csvContent = ""
//         // let filename = ""

//         // switch (type) {
//         //     case "all":
//         //         csvContent = convertToCSV(filteredData, "all")
//         //         filename = "all_confirmed_data.csv"
//         //         break
//         //     case "indian_post":
//         //         csvContent = convertToCSV(
//         //             filteredData.filter((item) => item.shipment_type?.value === "Indian Post"),
//         //             "indian_post",
//         //         )
//         //         filename = "indian_post_data.csv"
//         //         break
//         //     case "smart_ship":
//         //         csvContent = convertToCSV(
//         //             filteredData.filter((item) => ["Bluedart", "Delhivery"].includes(item.shipment_type?.value)),
//         //             "smart_ship",
//         //         )
//         //         filename = "smart_ship_data.csv"
//         //         break
//         //     default:
//         //         return
//         // }
//         const getIndianDateTime = () => {
//             const now = new Date();

//             // Format the date-time in IST
//             const formatter = new Intl.DateTimeFormat("en-GB", {
//                 timeZone: "Asia/Kolkata",
//                 year: "numeric",
//                 month: "2-digit",
//                 day: "2-digit",
//                 hour: "2-digit",
//                 minute: "2-digit",
//                 hour12: false,
//             });

//             const parts = formatter.formatToParts(now);
//             const year = parts.find((p) => p.type === "year").value;
//             const month = parts.find((p) => p.type === "month").value;
//             const day = parts.find((p) => p.type === "day").value;
//             const hours = parts.find((p) => p.type === "hour").value;
//             const minutes = parts.find((p) => p.type === "minute").value;

//             return `${year}${month}${day}_${hours}${minutes}`;
//         };

//         let csvContent;
//         let filename;
//         const timestamp = getIndianDateTime(); // Correctly formatted IST timestamp

//         switch (type) {
//             case "all":
//                 csvContent = convertToCSV(filteredData, "all");
//                 filename = `all_confirmed_${timestamp}.csv`;
//                 break;
//             case "indian_post":
//                 csvContent = convertToCSV(
//                     filteredData.filter((item) => item.shipment_type?.value === "Indian Post"),
//                     "indian_post"
//                 );
//                 filename = `indian_post_${timestamp}.csv`;
//                 break;
//             case "smart_ship":
//                 csvContent = convertToCSV(
//                     filteredData.filter((item) => ["Bluedart", "Delhivery"].includes(item.shipment_type?.value)),
//                     "smart_ship"
//                 );
//                 filename = `smart_ship_${timestamp}.csv`;
//                 break;
//             default:
//                 return;
//         }


//         const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
//         const link = document.createElement("a")
//         if (link.download !== undefined) {
//             const url = URL.createObjectURL(blob)
//             link.setAttribute("href", url)
//             link.setAttribute("download", filename)
//             link.style.visibility = "hidden"
//             document.body.appendChild(link)
//             link.click()
//             document.body.removeChild(link)
//         }
//     }

//     const convertToCSV = (data, type) => {
//         if (type === "indian_post") {
//             // Format specifically for Indian Post
//             const rows = data.map((item, index) => {
//                 const values = [
//                     index + 1, // Serial number
//                     "", // Empty barcode
//                     item.ref, // Reference number
//                     item.date, // Current date in YYYYMMDD
//                     item.city, // City
//                     item.pincode, // Pincode
//                     `${item.cm_first_name} ${item.cm_last_name}`.trim(), // Name
//                     item.address, // City again
//                     "", // Empty column
//                     "", // Empty column
//                     item.email || "", // Email
//                     item.cm_phone, // Mobile
//                     item.alternate_phone || "9825624002", // Alternative number or default
//                     "160", // Fixed weight
//                     item.amount?.value || "", // COD Amount
//                     "", // Extra empty column
//                     ""
//                 ]
//                 return values.join(",")
//             })

//             const header = [
//                 "SrNo",
//                 "Barcode",
//                 "Reference",
//                 "Date",
//                 "City",
//                 "Pincode",
//                 "Name",
//                 "Addr1",
//                 "Addr2",
//                 "Addr3",
//                 "AddrEmail",
//                 "AddrMobile",
//                 "SenderMobile",
//                 "Weight",
//                 "COD",
//                 "InsVal",
//                 "VPP"
//             ].join(",")

//             return [header, ...rows].join("\n")
//         }

//         if (type === "smart_ship") {
//             // Format specifically for Indian Post
//             const rows = data.map((item, index) => {
//                 const values = [
//                     index + 1, // Serial number
//                     "", // Empty barcode
//                     item.ref, // Reference number
//                     item.date, // Current date in YYYYMMDD
//                     item.city, // City
//                     item.pincode, // Pincode
//                     `${item.cm_first_name} ${item.cm_last_name}`.trim(), // Name
//                     item.address, // City again
//                     "", // Empty column
//                     "", // Empty column
//                     item.email || "", // Email
//                     item.cm_phone, // Mobile
//                     item.alternate_phone || "9825624002", // Alternative number or default
//                     "160", // Fixed weight
//                     item.amount?.value || "", // COD Amount
//                     "", // Extra empty column
//                     ""
//                 ]
//                 return values.join(",")
//             })

//             const header = [
//                 "SrNo",
//                 "Barcode",
//                 "Reference",
//                 "Date",
//                 "City",
//                 "Pincode",
//                 "Name",
//                 "Addr1",
//                 "Addr2",
//                 "Addr3",
//                 "AddrEmail",
//                 "AddrMobile",
//                 "SenderMobile",
//                 "Weight",
//                 "COD",
//                 "InsVal",
//                 "VPP"
//             ].join(",")

//             return [header, ...rows].join("\n")
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
//         <div className="container mx-auto p-4 bg-gray-50 min-h-screen max-w-[95vw]">
//             <h1 className="text-3xl font-semibold mb-6 text-gray-800">Confirmed Data</h1>

//             <div className="mb-4 flex flex-wrap items-center gap-4">
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
//                         <SelectItem value="sub_district_taluka">Sub District / Taluka</SelectItem>
//                         <SelectItem value="city">City / District</SelectItem>
//                         <SelectItem value="pincode">Pincode</SelectItem>
//                         <SelectItem value="state">State</SelectItem>
//                         <SelectItem value="disease">Disease</SelectItem>
//                         <SelectItem value="amount">Amount</SelectItem>
//                         <SelectItem value="products">Products</SelectItem>
//                     </SelectContent>
//                 </Select>
//                 <Input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} className="max-w-sm" />
//                 <Select onValueChange={handleShipmentTypeFilter} defaultValue="all">
//                     <SelectTrigger className="w-[180px]">
//                         <SelectValue placeholder="Shipment Type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="all">All Shipment Types</SelectItem>
//                         <SelectItem value="Indian Post">Indian Post</SelectItem>
//                         <SelectItem value="Bluedart">Bluedart</SelectItem>
//                         <SelectItem value="Delhivery">Delhivery</SelectItem>
//                         <SelectItem value="F2F">F2F</SelectItem>
//                         <SelectItem value="COD">COD</SelectItem>
//                     </SelectContent>
//                 </Select>
//             </div>

//             <div className="mb-4 flex flex-wrap items-center gap-4">
//                 <Button onClick={() => downloadCSV("all")} className="flex items-center gap-2">
//                     <Download size={16} />
//                     Download All CSV
//                 </Button>
//                 <Button onClick={() => downloadCSV("indian_post")} className="flex items-center gap-2">
//                     <Download size={16} />
//                     Download Indian Post CSV
//                 </Button>
//                 <Button onClick={() => downloadCSV("smart_ship")} className="flex items-center gap-2">
//                     <Download size={16} />
//                     Download SmartShip CSV
//                 </Button>
//             </div>

//             <div className="bg-white shadow-md rounded-lg overflow-hidden">
//                 <div className="max-w-full">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
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
//                                 <TableHead>AWB Number</TableHead>
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
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {paginatedData.map((item, index) => (
//                                 <TableRow key={item._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
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
//                                     <TableCell>{item.awb_number}</TableCell>
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

// export default SheetGenerator


// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { getAllConfirmed } from "@/services/confirmedService"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { toast } from "react-hot-toast"
// import {
//     Pagination,
//     PaginationContent,
//     PaginationItem,
//     PaginationLink,
//     PaginationNext,
//     PaginationPrevious,
//     PaginationEllipsis,
// } from "@/components/ui/pagination"
// import { Loader2, Download, Search, Filter, RefreshCcw } from "lucide-react"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// // Table components remain the same
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

// const SheetGenerator = () => {
//     // State declarations remain the same
//     const [confirmedData, setConfirmedData] = useState([])
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
//     const [shipmentTypeFilter, setShipmentTypeFilter] = useState("all")
//     const [isDownloading, setIsDownloading] = useState(false)
//     const [refreshing, setRefreshing] = useState(false)

//     // Fetch data function remains the same
//     const fetchData = useCallback(async () => {
//         try {
//             setIsLoading(true)
//             const response = await getAllConfirmed()
//             setConfirmedData(response.data.data)
//             setFilteredData(response.data.data)
//             setTotalPages(Math.ceil(response.data.data.length / itemsPerPage))
//         } catch (error) {
//             console.error("Error fetching confirmed data:", error)
//             setError("Failed to fetch data. Please try again later.")
//             toast.error("Failed to fetch data")
//         } finally {
//             setIsLoading(false)
//         }
//     }, [itemsPerPage])

//     const refreshData = async () => {
//         setRefreshing(true)
//         await fetchData()
//         setRefreshing(false)
//         toast.success("Data refreshed successfully")
//     }

//     useEffect(() => {
//         fetchData()
//     }, [fetchData])

//     // Filter and pagination logic remains the same
//     const applyFiltersAndPaginate = useCallback(() => {
//         const results = confirmedData.filter((item) => {
//             const shipmentType = item.shipment_type?.value || ""
//             if (shipmentTypeFilter !== "all" && shipmentType !== shipmentTypeFilter) {
//                 return false
//             }

//             if (searchColumn === "all") {
//                 return Object.values(item).some(
//                     (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()),
//                 )
//             } else {
//                 const value = item[searchColumn]
//                 if (typeof value === "string") {
//                     return value.toLowerCase().includes(searchTerm.toLowerCase())
//                 } else if (typeof value === "object" && value !== null && "value" in value) {
//                     return value.value.toLowerCase().includes(searchTerm.toLowerCase())
//                 }
//             }
//             return false
//         })

//         setFilteredData(results)
//         const newTotalPages = Math.ceil(results.length / itemsPerPage)
//         setTotalPages(newTotalPages)
//         setCurrentPage((prev) => (prev > newTotalPages ? 1 : prev))

//         const startIndex = (currentPage - 1) * itemsPerPage
//         setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
//     }, [confirmedData, searchTerm, searchColumn, itemsPerPage, currentPage, shipmentTypeFilter])

//     useEffect(() => {
//         applyFiltersAndPaginate()
//     }, [applyFiltersAndPaginate])

//     // Download functionality
//     const downloadCSV = async (type) => {
//         setIsDownloading(true)
//         try {
//             const getIndianDateTime = () => {
//                 const now = new Date()
//                 const formatter = new Intl.DateTimeFormat("en-GB", {
//                     timeZone: "Asia/Kolkata",
//                     year: "numeric",
//                     month: "2-digit",
//                     day: "2-digit",
//                     hour: "2-digit",
//                     minute: "2-digit",
//                     hour12: false,
//                 })

//                 const parts = formatter.formatToParts(now)
//                 const year = parts.find((p) => p.type === "year").value
//                 const month = parts.find((p) => p.type === "month").value
//                 const day = parts.find((p) => p.type === "day").value
//                 const hours = parts.find((p) => p.type === "hour").value
//                 const minutes = parts.find((p) => p.type === "minute").value

//                 return `${year}${month}${day}_${hours}${minutes}`
//             }

//             let csvContent
//             let filename
//             const timestamp = getIndianDateTime()

//             if (type === "indian_post") {
//                 csvContent = convertToCSV(
//                     filteredData.filter((item) => item.shipment_type?.value === "Indian Post"),
//                     "indian_post",
//                 )
//                 filename = `indian_post_${timestamp}.csv`
//             } else if (type === "smart_ship") {
//                 csvContent = convertToCSV(
//                     filteredData.filter((item) => ["Bluedart", "Delhivery"].includes(item.shipment_type?.value)),
//                     "smart_ship",
//                 )
//                 filename = `smart_ship_${timestamp}.csv`
//             }

//             const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
//             const url = URL.createObjectURL(blob)
//             const link = document.createElement("a")
//             link.setAttribute("href", url)
//             link.setAttribute("download", filename)
//             document.body.appendChild(link)
//             link.click()
//             document.body.removeChild(link)
//             toast.success(`${type === "indian_post" ? "Indian Post" : "SmartShip"} CSV downloaded successfully`)
//         } catch (error) {
//             console.error("Error downloading CSV:", error)
//             toast.error("Failed to download CSV")
//         } finally {
//             setIsDownloading(false)
//         }
//     }

//     // CSV conversion logic remains the same
//     const convertToCSV = (data, type) => {
//         if (type === "indian_post") {
//             const rows = data.map((item, index) => {
//                 const values = [
//                     index + 1,
//                     "",
//                     item.ref,
//                     item.date,
//                     item.city,
//                     item.pincode,
//                     `${item.cm_first_name} ${item.cm_last_name}`.trim(),
//                     item.address,
//                     "",
//                     "",
//                     item.email || "",
//                     item.cm_phone,
//                     item.alternate_phone || "9825624002",
//                     "160",
//                     item.amount?.value || "",
//                     "",
//                     "",
//                 ]
//                 return values.join(",")
//             })

//             const header = [
//                 "SrNo",
//                 "Barcode",
//                 "Reference",
//                 "Date",
//                 "City",
//                 "Pincode",
//                 "Name",
//                 "Addr1",
//                 "Addr2",
//                 "Addr3",
//                 "AddrEmail",
//                 "AddrMobile",
//                 "SenderMobile",
//                 "Weight",
//                 "COD",
//                 "InsVal",
//                 "VPP",
//             ].join(",")

//             return [header, ...rows].join("\n")
//         }

//         if (type === "smart_ship") {
//             const rows = data.map((item, index) => {
//                 const values = [
//                     index + 1,
//                     "",
//                     item.ref,
//                     item.date,
//                     item.city,
//                     item.pincode,
//                     `${item.cm_first_name} ${item.cm_last_name}`.trim(),
//                     item.address,
//                     "",
//                     "",
//                     item.email || "",
//                     item.cm_phone,
//                     item.alternate_phone || "9825624002",
//                     "160",
//                     item.amount?.value || "",
//                     "",
//                     "",
//                 ]
//                 return values.join(",")
//             })

//             const header = [
//                 "SrNo",
//                 "Barcode",
//                 "Reference",
//                 "Date",
//                 "City",
//                 "Pincode",
//                 "Name",
//                 "Addr1",
//                 "Addr2",
//                 "Addr3",
//                 "AddrEmail",
//                 "AddrMobile",
//                 "SenderMobile",
//                 "Weight",
//                 "COD",
//                 "InsVal",
//                 "VPP",
//             ].join(",")

//             return [header, ...rows].join("\n")
//         }
//     }

//     const handleSearch = (e) => {
//         setSearchTerm(e.target.value)
//     }

//     const handleColumnSelect = (e) => {
//         setSearchColumn(e)
//     }

//     const handleShipmentTypeFilter = (e) => {
//         setShipmentTypeFilter(e)
//     }

//     const handlePageChange = (page) => {
//         setCurrentPage(page)
//     }

//     const handleGoToPage = () => {
//         const page = Number.parseInt(goToPage, 10)
//         if (!isNaN(page) && page >= 1 && page <= totalPages) {
//             setCurrentPage(page)
//             setGoToPage("")
//         }
//     }

//     if (isLoading) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <div className="text-center">
//                     <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
//                     <p className="text-muted-foreground">Loading data...</p>
//                 </div>
//             </div>
//         )
//     }

//     if (error) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <Card className="w-[400px]">
//                     <CardHeader>
//                         <CardTitle className="text-red-500">Error</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <p>{error}</p>
//                         <Button onClick={fetchData} className="mt-4">
//                             Retry
//                         </Button>
//                     </CardContent>
//                 </Card>
//             </div>
//         )
//     }

//     return (
//         <div className="container mx-auto p-4 bg-gray-50 min-h-screen max-w-[95vw]">
//             <Card className="mb-6">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
//                     <CardTitle className="text-2xl font-bold">Sheet Generator</CardTitle>
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
//                 </CardHeader>
//                 <CardContent>
//                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                         <div className="flex items-center space-x-2">
//                             <Search className="h-4 w-4 text-muted-foreground" />
//                             <Input
//                                 type="text"
//                                 placeholder="Search..."
//                                 value={searchTerm}
//                                 onChange={handleSearch}
//                                 className="flex-1"
//                             />
//                         </div>
//                         <div className="flex items-center space-x-2">
//                             <Filter className="h-4 w-4 text-muted-foreground" />
//                             <Select onValueChange={handleColumnSelect} defaultValue="all">
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select column" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="all">All Columns</SelectItem>
//                                     <SelectItem value="ref">Reference</SelectItem>
//                                     <SelectItem value="date">Date</SelectItem>
//                                     <SelectItem value="shipment_type">Shipment Type</SelectItem>
//                                     <SelectItem value="cm_first_name">First Name</SelectItem>
//                                     <SelectItem value="cm_last_name">Last Name</SelectItem>
//                                     <SelectItem value="cm_phone">Phone</SelectItem>
//                                     <SelectItem value="city">City</SelectItem>
//                                     <SelectItem value="pincode">Pincode</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                             <Filter className="h-4 w-4 text-muted-foreground" />
//                             <Select onValueChange={handleShipmentTypeFilter} defaultValue="all">
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Shipment Type" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="Indian Post">Indian Post</SelectItem>
//                                     <SelectItem value="Bluedart">Bluedart</SelectItem>
//                                     <SelectItem value="Delhivery">Delhivery</SelectItem>
//                                     <SelectItem value="COD">COD</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </div>

//                     <div className="flex flex-wrap items-center gap-4 mt-4">
//                         <Button
//                             onClick={() => downloadCSV("indian_post")}
//                             className="flex items-center gap-2"
//                             disabled={isDownloading}
//                             variant="outline"
//                         >
//                             {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
//                             Download Indian Post CSV
//                         </Button>
//                         <Button
//                             onClick={() => downloadCSV("smart_ship")}
//                             className="flex items-center gap-2"
//                             disabled={isDownloading}
//                             variant="outline"
//                         >
//                             {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
//                             Download SmartShip CSV
//                         </Button>
//                     </div>

//                     <div className="mt-4">
//                         <Badge variant="outline" className="mb-2">
//                             {filteredData.length} records found
//                         </Badge>
//                     </div>
//                 </CardContent>
//             </Card>

//             <Card>
//                 <CardContent className="p-0">
//                     <div className="rounded-md border">
//                         <Table>
//                             <TableHeader>
//                                 <TableRow>
//                                     <TableHead>Ref</TableHead>
//                                     <TableHead>Date</TableHead>
//                                     <TableHead>Shipment Type</TableHead>
//                                     <TableHead>Name</TableHead>
//                                     <TableHead>Phone</TableHead>
//                                     <TableHead>Email</TableHead>
//                                     <TableHead>Address</TableHead>
//                                     <TableHead>City</TableHead>
//                                     <TableHead>Pincode</TableHead>
//                                     <TableHead>Amount</TableHead>
//                                 </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                                 {paginatedData.map((item, index) => (
//                                     <TableRow key={item._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
//                                         <TableCell>{item.ref}</TableCell>
//                                         <TableCell>{item.date}</TableCell>
//                                         <TableCell>{item.shipment_type?.value}</TableCell>
//                                         <TableCell>{`${item.cm_first_name} ${item.cm_last_name}`}</TableCell>
//                                         <TableCell>{item.cm_phone}</TableCell>
//                                         <TableCell>{item.email}</TableCell>
//                                         <TableCell>{item.address}</TableCell>
//                                         <TableCell>{item.city}</TableCell>
//                                         <TableCell>{item.pincode}</TableCell>
//                                         <TableCell>{item.amount?.value}</TableCell>
//                                     </TableRow>
//                                 ))}
//                             </TableBody>
//                         </Table>
//                     </div>
//                 </CardContent>
//             </Card>

//             <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
//                 <Pagination>
//                     <PaginationContent>
//                         <PaginationItem>
//                             <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
//                         </PaginationItem>
//                         {[...Array(totalPages)].map((_, index) => {
//                             const pageNumber = index + 1
//                             if (
//                                 pageNumber === 1 ||
//                                 pageNumber === totalPages ||
//                                 (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
//                             ) {
//                                 return (
//                                     <PaginationItem key={index}>
//                                         <PaginationLink onClick={() => handlePageChange(pageNumber)} isActive={currentPage === pageNumber}>
//                                             {pageNumber}
//                                         </PaginationLink>
//                                     </PaginationItem>
//                                 )
//                             } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
//                                 return <PaginationEllipsis key={index} />
//                             }
//                             return null
//                         })}
//                         <PaginationItem>
//                             <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
//                         </PaginationItem>
//                     </PaginationContent>
//                 </Pagination>

//                 <div className="flex items-center space-x-2">
//                     <Input
//                         type="number"
//                         placeholder="Go to page"
//                         value={goToPage}
//                         onChange={(e) => setGoToPage(e.target.value)}
//                         onKeyDown={(e) => {
//                             if (e.key === "Enter" && goToPage) {
//                                 handleGoToPage()
//                             }
//                         }}
//                         className="w-24"
//                         min={1}
//                         max={totalPages}
//                     />
//                     <Button onClick={handleGoToPage} disabled={!goToPage} variant="outline" size="sm">
//                         Go
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default SheetGenerator






"use client"

import { useState, useEffect, useCallback } from "react"
import { getAllConfirmed } from "@/services/confirmedService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination"
import { Loader2, Download, Search, Filter, RefreshCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Table components remain the same
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

const SheetGenerator = () => {
    // State declarations remain the same
    const [confirmedData, setConfirmedData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [paginatedData, setPaginatedData] = useState([])
    const [searchColumn, setSearchColumn] = useState("all")
    const [goToPage, setGoToPage] = useState("")
    const [shipmentTypeFilter, setShipmentTypeFilter] = useState("all")
    const [isDownloading, setIsDownloading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    // Fetch data function remains the same
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await getAllConfirmed()
            setConfirmedData(response.data.data)
            setFilteredData(response.data.data)
            setTotalPages(Math.ceil(response.data.data.length / itemsPerPage))
        } catch (error) {
            console.error("Error fetching confirmed data:", error)
            setError("Failed to fetch data. Please try again later.")
            toast.error("Failed to fetch data")
        } finally {
            setIsLoading(false)
        }
    }, [itemsPerPage])

    const refreshData = async () => {
        setRefreshing(true)
        await fetchData()
        setRefreshing(false)
        toast.success("Data refreshed successfully")
    }

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Filter and pagination logic remains the same
    const applyFiltersAndPaginate = useCallback(() => {
        const results = confirmedData.filter((item) => {
            const shipmentType = item.shipment_type?.value || ""
            if (shipmentTypeFilter !== "all" && shipmentType !== shipmentTypeFilter) {
                return false
            }

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
            }
            return false
        })

        setFilteredData(results)
        const newTotalPages = Math.ceil(results.length / itemsPerPage)
        setTotalPages(newTotalPages)
        setCurrentPage((prev) => (prev > newTotalPages ? 1 : prev))

        const startIndex = (currentPage - 1) * itemsPerPage
        setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
    }, [confirmedData, searchTerm, searchColumn, itemsPerPage, currentPage, shipmentTypeFilter])

    useEffect(() => {
        applyFiltersAndPaginate()
    }, [applyFiltersAndPaginate])

    // Download functionality
    const downloadCSV = async (type) => {
        setIsDownloading(true)
        try {
            const getIndianDateTime = () => {
                const now = new Date()
                const formatter = new Intl.DateTimeFormat("en-GB", {
                    timeZone: "Asia/Kolkata",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })

                const parts = formatter.formatToParts(now)
                const year = parts.find((p) => p.type === "year").value
                const month = parts.find((p) => p.type === "month").value
                const day = parts.find((p) => p.type === "day").value
                const hours = parts.find((p) => p.type === "hour").value
                const minutes = parts.find((p) => p.type === "minute").value

                return `${year}${month}${day}_${hours}${minutes}`
            }

            let csvContent
            let filename
            const timestamp = getIndianDateTime()

            if (type === "indian_post") {
                csvContent = convertToCSV(
                    filteredData.filter((item) => item.shipment_type?.value === "Indian Post"),
                    "indian_post",
                )
                filename = `indian_post_${timestamp}.csv`
            } else if (type === "smart_ship") {
                csvContent = convertToCSV(
                    filteredData.filter((item) => ["Bluedart", "Delhivery"].includes(item.shipment_type?.value)),
                    "smart_ship",
                )
                filename = `smart_ship_${timestamp}.csv`
            }

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", filename)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success(`${type === "indian_post" ? "Indian Post" : "SmartShip"} CSV downloaded successfully`)
        } catch (error) {
            console.error("Error downloading CSV:", error)
            toast.error("Failed to download CSV")
        } finally {
            setIsDownloading(false)
        }
    }

    // CSV conversion logic remains the same
    const convertToCSV = (data, type) => {
        if (type === "indian_post") {
            const rows = data.map((item, index) => {
                const values = [
                    index + 1,
                    "",
                    item.ref,
                    item.date,
                    item.city,
                    item.pincode,
                    `${item.cm_first_name} ${item.cm_last_name}`.trim(),
                    item.address,
                    "",
                    "",
                    item.email || "",
                    item.cm_phone,
                    item.alternate_phone || "9825624002",
                    "160",
                    item.amount?.value || "",
                    "",
                    "",
                ]
                return values.join(",")
            })

            const header = [
                "SrNo",
                "Barcode",
                "Reference",
                "Date",
                "City",
                "Pincode",
                "Name",
                "Addr1",
                "Addr2",
                "Addr3",
                "AddrEmail",
                "AddrMobile",
                "SenderMobile",
                "Weight",
                "COD",
                "InsVal",
                "VPP",
            ].join(",")

            return [header, ...rows].join("\n")
        }

        if (type === "smart_ship") {
            const rows = data.map((item, index) => {
                const values = [
                    index + 1,
                    "",
                    item.ref,
                    item.date,
                    item.city,
                    item.pincode,
                    `${item.cm_first_name} ${item.cm_last_name}`.trim(),
                    item.address,
                    "",
                    "",
                    item.email || "",
                    item.cm_phone,
                    item.alternate_phone || "9825624002",
                    "160",
                    item.amount?.value || "",
                    "",
                    "",
                ]
                return values.join(",")
            })

            const header = [
                "SrNo",
                "Barcode",
                "Reference",
                "Date",
                "City",
                "Pincode",
                "Name",
                "Addr1",
                "Addr2",
                "Addr3",
                "AddrEmail",
                "AddrMobile",
                "SenderMobile",
                "Weight",
                "COD",
                "InsVal",
                "VPP",
            ].join(",")

            return [header, ...rows].join("\n")
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    const handleColumnSelect = (e) => {
        setSearchColumn(e)
    }

    const handleShipmentTypeFilter = (e) => {
        setShipmentTypeFilter(e)
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const handleGoToPage = () => {
        const page = Number.parseInt(goToPage, 10)
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            setCurrentPage(page)
            setGoToPage("")
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading data...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle className="text-red-500">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                        <Button onClick={fetchData} className="mt-4">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen max-w-[95vw]">
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-2xl font-bold">Sheet Generator</CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={refreshData} disabled={refreshing}>
                                    <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Refresh data</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="flex-1"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select onValueChange={handleColumnSelect} defaultValue="all">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select column" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Columns</SelectItem>
                                    <SelectItem value="ref">Reference</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="shipment_type">Shipment Type</SelectItem>
                                    <SelectItem value="cm_first_name">First Name</SelectItem>
                                    <SelectItem value="cm_last_name">Last Name</SelectItem>
                                    <SelectItem value="cm_phone">Phone</SelectItem>
                                    <SelectItem value="city">City</SelectItem>
                                    <SelectItem value="pincode">Pincode</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select onValueChange={handleShipmentTypeFilter} defaultValue="all">
                                <SelectTrigger>
                                    <SelectValue placeholder="Shipment Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Indian Post">Indian Post</SelectItem>
                                    <SelectItem value="Bluedart">Bluedart</SelectItem>
                                    <SelectItem value="Delhivery">Delhivery</SelectItem>
                                    <SelectItem value="COD">COD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4">
                        <Button
                            onClick={() => downloadCSV("indian_post")}
                            className="flex items-center gap-2"
                            disabled={isDownloading}
                            variant="outline"
                        >
                            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Download Indian Post CSV
                        </Button>
                        <Button
                            onClick={() => downloadCSV("smart_ship")}
                            className="flex items-center gap-2"
                            disabled={isDownloading}
                            variant="outline"
                        >
                            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Download SmartShip CSV
                        </Button>
                    </div>

                    <div className="mt-4">
                        <Badge variant="outline" className="mb-2">
                            {filteredData.length} records found
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ref</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Shipment Type</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Pincode</TableHead>
                                    <TableHead>Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((item, index) => (
                                    <TableRow key={item._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                        <TableCell>{item.ref}</TableCell>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{item.shipment_type?.value}</TableCell>
                                        <TableCell>{`${item.cm_first_name} ${item.cm_last_name}`}</TableCell>
                                        <TableCell>{item.cm_phone}</TableCell>
                                        <TableCell>{item.email}</TableCell>
                                        <TableCell>{item.address}</TableCell>
                                        <TableCell>{item.city}</TableCell>
                                        <TableCell>{item.pincode}</TableCell>
                                        <TableCell>{item.amount?.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Pagination>
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
                            if (e.key === "Enter" && goToPage) {
                                handleGoToPage()
                            }
                        }}
                        className="w-24"
                        min={1}
                        max={totalPages}
                    />
                    <Button onClick={handleGoToPage} disabled={!goToPage} variant="outline" size="sm">
                        Go
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default SheetGenerator

