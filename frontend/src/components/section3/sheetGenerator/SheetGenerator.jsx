



// "use client"

// import { useState, useEffect, useCallback } from "react"
// // import { getAllConfirmed } from "@/services/confirmedService"
// import { getAllSheetsGenerator } from "@/services/sheetService"
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
// import { ItemIndicator } from "@radix-ui/react-select"

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
//     const [sheetData, setSheetData] = useState([])
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
//             const response = await getAllSheetsGenerator()
//             setSheetData(response.data.data)
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

//     // // Filter and pagination logic remains the same
//     // const applyFiltersAndPaginate = useCallback(() => {
//     //     const results = sheetData.filter((item) => {
//     //         const shipmentType = item.shipment_type?.value || ""
//     //         if (shipmentTypeFilter !== "all") {
//     //             if (shipmentTypeFilter === "smartship") {
//     //                 if (!["Bluedart", "Delhivery"].includes(shipmentType)) {
//     //                     return false
//     //                 }
//     //             } else if (shipmentType !== shipmentTypeFilter) {
//     //                 return false
//     //             }
//     //         }

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
//     //         }
//     //         return false
//     //     })

//     //     setFilteredData(results)
//     //     const newTotalPages = Math.ceil(results.length / itemsPerPage)
//     //     setTotalPages(newTotalPages)
//     //     setCurrentPage((prev) => (prev > newTotalPages ? 1 : prev))

//     //     const startIndex = (currentPage - 1) * itemsPerPage
//     //     setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
//     // }, [sheetData, searchTerm, searchColumn, itemsPerPage, currentPage, shipmentTypeFilter])

//     const applyFiltersAndPaginate = useCallback(() => {
//         const results = sheetData.filter((item) => {
//             const shipmentType = item?.shipment_type?.value || ""; // Ensure safe access to nested properties

//             if (shipmentTypeFilter !== "all") {
//                 if (shipmentTypeFilter === "smartship") {
//                     if (!["Bluedart", "Delhivery"].includes(shipmentType)) {
//                         return false;
//                     }
//                 } else if (shipmentType !== shipmentTypeFilter) {
//                     return false;
//                 }
//             }

//             if (searchColumn === "all") {
//                 return Object.values(item).some(
//                     (val) =>
//                         val !== null &&
//                         val !== undefined &&
//                         typeof val === "string" &&
//                         val.toLowerCase().includes(searchTerm.toLowerCase())
//                 );
//             } else {
//                 const value = item?.[searchColumn]; // Ensure safe access to dynamic column values
//                 if (value === null || value === undefined) return false;

//                 if (typeof value === "string") {
//                     return value.toLowerCase().includes(searchTerm.toLowerCase());
//                 } else if (typeof value === "object" && "value" in value && typeof value.value === "string") {
//                     return value.value.toLowerCase().includes(searchTerm.toLowerCase());
//                 }
//             }
//             return false;
//         });

//         setFilteredData(results);
//         const newTotalPages = Math.ceil(results.length / itemsPerPage);
//         setTotalPages(newTotalPages);
//         setCurrentPage((prev) => (prev > newTotalPages ? 1 : prev));

//         const startIndex = (currentPage - 1) * itemsPerPage;
//         setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage));
//     }, [sheetData, searchTerm, searchColumn, itemsPerPage, currentPage, shipmentTypeFilter]);


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

//     const today_date = () => {
//         const now = new Date();
//         const options = { timeZone: "Asia/Kolkata" };
//         const istDate = new Intl.DateTimeFormat("en-GB", options).format(now);
//         return istDate;
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
//                     item.address.includes(",") ? `"${item.address}"` : item.address, // Fix here
//                     "",
//                     "",
//                     item.email || "",
//                     item.cm_phone,
//                     "9825624002",
//                     "160",
//                     item.amount?.value || "",
//                     "",
//                     "",
//                 ];
//                 return values.join(",");
//             });

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
//             ].join(",");

//             return [header, ...rows].join("\n");
//         }

//         if (type === "smart_ship") {
//             const smartShipData = data.filter((item) => ["Bluedart", "Delhivery"].includes(item.shipment_type?.value));
//             const rows = smartShipData.map((item, index) => {
//                 const values = [
//                     `${item.cm_first_name} ${item.cm_last_name}`.trim(),
//                     item.cm_phone,
//                     item.address.includes(",") ? `"${item.address}"` : item.address, // Fix here
//                     item.pincode,
//                     "OTC",
//                     item.products.total, //to be done total value
//                     item.amount?.value || "",
//                     500,
//                     13,
//                     13,
//                     13,
//                     30049011,
//                     12,
//                     1,
//                     item.ref,
//                     item.ref,
//                     today_date(),
//                     "171228",
//                 ];
//                 return values.join(",");
//             });

//             const header = [
//                 "Consignee Name",
//                 "Consignee Phone",
//                 "Consignee Address",
//                 "Consignee Pincode",
//                 "Product Name",
//                 "Product Invoice Value",
//                 "Collectable Amount",
//                 "Weight",
//                 "Height",
//                 "Width",
//                 "Lendth",
//                 "HSN Code",
//                 "GST Rate",
//                 "Quantity",
//                 "Reference Order ID",
//                 "Invoice No.",
//                 "Invoice Date(DD-MM-YYYY)",
//                 "HUB",
//             ].join(",");

//             return [header, ...rows].join("\n");
//         }
//     };


//     const handleSearch = (e) => {
//         setSearchTerm(e.target.value)
//     }

//     const handleColumnSelect = (e) => {
//         setSearchColumn(e)
//     }

//     const handleShipmentTypeFilter = (e) => {
//         setShipmentTypeFilter(e)
//         setCurrentPage(1) // Reset to first page when filter changes
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
//         <div className="container mx-auto p-8 bg-gray-50 h-full max-w-full">


//             <Card className="mb-6">
//                 <CardHeader className="flex flex-row items-center justify-between pb-4">
//                     <CardTitle className="text-3xl font-bold">Sheet Generator</CardTitle>
//                     <div className="flex items-center space-x-4">
//                         {/* Refresh Label */}
//                         {/* <span className="text-l font-semibold">Refresh:</span> */}

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
//                 <CardContent>


//                     <div className="flex items-center justify-between mb-4">
//                         {/* Left Side: Filter Dropdown & Record Count */}
//                         <div className="flex items-center space-x-2">
//                             {/* Shipment Type Filter */}
//                             <Select onValueChange={handleShipmentTypeFilter} defaultValue="all">
//                                 <SelectTrigger className="w-[180px]">
//                                     <SelectValue placeholder="Filter" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="all">All Types</SelectItem>
//                                     <SelectItem value="smartship">Smartship (Bluedart+Delhivery)</SelectItem>
//                                     <SelectItem value="Indian Post">Indian Post</SelectItem>
//                                     <SelectItem value="F2F">F2F</SelectItem>
//                                 </SelectContent>
//                             </Select>

//                             {/* Record Count Badge */}
//                             <Badge variant="outline" className="mb-2">
//                                 {filteredData.length} records found
//                             </Badge>
//                         </div>

//                         {/* Right Side: Download Buttons */}
//                         <div className="flex space-x-2">
//                             {shipmentTypeFilter === "Indian Post" && (
//                                 <Button
//                                     onClick={() => downloadCSV("indian_post")}
//                                     className="flex items-center gap-2"
//                                     disabled={isDownloading || filteredData.length === 0}
//                                     variant="outline"
//                                 >
//                                     {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
//                                     Download Indian Post CSV
//                                 </Button>
//                             )}

//                             {shipmentTypeFilter === "smartship" && (
//                                 <Button
//                                     onClick={() => downloadCSV("smart_ship")}
//                                     className="flex items-center gap-2"
//                                     disabled={isDownloading || filteredData.length === 0}
//                                     variant="outline"
//                                 >
//                                     {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
//                                     Download SmartShip CSV
//                                 </Button>
//                             )}
//                         </div>
//                     </div>

//                 </CardContent>
//             </Card>


//             {/* <Card>
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
//             </Card> */}
//             <Card>
//                 <CardContent className="p-0">
//                     <div className="rounded-md border">
//                         <Table>
//                             <TableHeader>
//                                 <TableRow>
//                                     <TableHead>
//                                         <div>
//                                             <span>Ref</span>

//                                         </div>
//                                     </TableHead>
//                                     <TableHead>Date</TableHead>
//                                     <TableHead>
//                                         <div>
//                                             <span>First Name</span>
//                                             <br />
//                                             <span>Last Name</span>
//                                         </div>
//                                     </TableHead>
//                                     <TableHead>
//                                         <div>
//                                             <span>Phone</span>
//                                             <br />
//                                             <span>Alternate Phone</span>
//                                         </div>
//                                     </TableHead>
//                                     <TableHead>Address</TableHead>
//                                     <TableHead>
//                                         <div>
//                                             <span>City</span>
//                                             <br />
//                                             <span>State</span>
//                                         </div>
//                                     </TableHead>
//                                     <TableHead>Products</TableHead>
//                                     <TableHead>Amount</TableHead>
//                                 </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                                 {paginatedData.map((item, index) => (
//                                     <TableRow key={item._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
//                                         <TableCell>
//                                             <div>
//                                                 {item.ref}

//                                             </div>
//                                         </TableCell>
//                                         <TableCell>{item.date}</TableCell>
//                                         <TableCell>
//                                             <div>
//                                                 {item.cm_first_name}
//                                                 <br />
//                                                 {item.cm_last_name}
//                                             </div>
//                                         </TableCell>
//                                         <TableCell>
//                                             <div>
//                                                 {item.cm_phone}
//                                                 <br />
//                                                 {item.alternate_phone}
//                                             </div>
//                                         </TableCell>
//                                         <TableCell>{item.address}</TableCell>
//                                         <TableCell>
//                                             <div>
//                                                 {item.city}
//                                                 <br />
//                                                 {item.state?.value}
//                                             </div>
//                                         </TableCell>
//                                         <TableCell>{Array.isArray(item.products?.value)
//                                             ? item.products.value.map((product, idx) => (
//                                                 <div key={idx}>
//                                                     {product.product} : {product.quantity}
//                                                 </div>
//                                             ))
//                                             : null}</TableCell>
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


//             </div>
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
//         </div>
//     )
// }

// export default SheetGenerator










"use client"

import { useState, useEffect, useCallback } from "react"
// import { getAllConfirmed } from "@/services/confirmedService"
import { getAllSheetsGenerator } from "@/services/sheetService"
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
import { Loader2, Download, RefreshCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Add useAccessControl import and useNavigate at the top of the imports
import useAccessControl from "../../AccessControl"
import { useNavigate } from "react-router-dom"

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
    const [sheetData, setSheetData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
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
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Add these state variables in the component
    const [columnPermissions, setColumnPermissions] = useState([])
    const { permissions, loading } = useAccessControl("/sheet-generator")
    const navigate = useNavigate()

    // Add search timeout state and debounce logic
    const [searchTimeout, setSearchTimeout] = useState(null)

    // Fetch data function remains the same
    const fetchData = useCallback(
        async (page = currentPage, limit = itemsPerPage, search = searchTerm, column = searchColumn) => {
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
                const response = await getAllSheetsGenerator(queryString)

                if (response.data && response.data.data) {
                    setSheetData(response.data.data)
                    setFilteredData(response.data.data)

                    // Ensure totalCount is a number
                    const count = Number.parseInt(response.data.totalCount, 10) || 0

                    // Calculate total pages based on count and limit
                    const pages = Math.ceil(count / limitNum) || 1
                    setTotalPages(pages)

                    // Ensure current page is valid
                    const responsePage = Number.parseInt(response.data.currentPage, 10) || pageNum
                    setCurrentPage(responsePage > pages ? 1 : responsePage)


                } else {
                    console.error("Invalid response format:", response)
                    setSheetData([])
                    setFilteredData([])
                    setError("Invalid data format received from server")
                }
            } catch (error) {
                console.error("Error fetching sheet data:", error)
                setError("Failed to fetch data. Please try again later.")
                setSheetData([])
                setFilteredData([])
            } finally {
                setIsLoading(false)
            }
        },
        [currentPage, itemsPerPage, searchTerm, searchColumn],
    )

    const refreshData = async () => {
        setRefreshing(true)
        await fetchData()
        setRefreshing(false)
        toast.success("Data refreshed successfully")
    }

    useEffect(() => {
        fetchData(1, itemsPerPage, searchTerm, searchColumn)
    }, []) // Empty dependency array for initial load only

    // Add this useEffect for search debounce
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

    // Add this useEffect after the existing useEffects
    useEffect(() => {
        if (loading) return // Wait until loading is complete


        // Ensure permissions exist
        if (!permissions) {
            navigate("/dashboard") // Redirect if no permissions
            return
        }

        // Check if user has access to this page
        if (!permissions.page || permissions.page !== "/sheet-generator") {
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

    // Add this function to check column permissions
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
    const handleItemsPerPageChange = (value) => {
        const newItemsPerPage = Number.parseInt(value, 10)
        setItemsPerPage(newItemsPerPage)
        // Reset to page 1 when changing items per page
        fetchData(1, newItemsPerPage, searchTerm, searchColumn)
    }

    // // Filter and pagination logic remains the same
    // const applyFiltersAndPaginate = useCallback(() => {
    //     const results = sheetData.filter((item) => {
    //         const shipmentType = item.shipment_type?.value || ""
    //         if (shipmentTypeFilter !== "all") {
    //             if (shipmentTypeFilter === "smartship") {
    //                 if (!["Bluedart", "Delhivery"].includes(shipmentType)) {
    //                     return false
    //                 }
    //             } else if (shipmentType !== shipmentTypeFilter) {
    //                 return false
    //             }
    //         }

    //         if (searchColumn === "all") {
    //             return Object.values(item).some(
    //                 (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()),
    //             )
    //         } else {
    //             const value = item[searchColumn]
    //             if (typeof value === "string") {
    //                 return value.toLowerCase().includes(searchTerm.toLowerCase())
    //             } else if (typeof value === "object" && value !== null && "value" in value) {
    //                 return value.value.toLowerCase().includes(searchTerm.toLowerCase())
    //             }
    //         }
    //         return false
    //     })

    //     setFilteredData(results)
    //     const newTotalPages = Math.ceil(results.length / itemsPerPage)
    //     setTotalPages(newTotalPages)
    //     setCurrentPage((prev) => (prev > newTotalPages ? 1 : prev))

    //     const startIndex = (currentPage - 1) * itemsPerPage
    //     setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
    // }, [sheetData, searchTerm, searchColumn, itemsPerPage, currentPage, shipmentTypeFilter])

    const applyFiltersAndPaginate = useCallback(() => {
        const results = sheetData.filter((item) => {
            const shipmentType = item?.shipment_type?.value || "" // Ensure safe access to nested properties

            if (shipmentTypeFilter !== "all") {
                if (shipmentTypeFilter === "smartship") {
                    if (!["Bluedart", "Delhivery"].includes(shipmentType)) {
                        return false
                    }
                } else if (shipmentType !== shipmentTypeFilter) {
                    return false
                }
            }

            if (searchColumn === "all") {
                return Object.values(item).some(
                    (val) =>
                        val !== null &&
                        val !== undefined &&
                        typeof val === "string" &&
                        val.toLowerCase().includes(searchTerm.toLowerCase()),
                )
            } else {
                const value = item?.[searchColumn] // Ensure safe access to dynamic column values
                if (value === null || value === undefined) return false

                if (typeof value === "string") {
                    return value.toLowerCase().includes(searchTerm.toLowerCase())
                } else if (typeof value === "object" && "value" in value && typeof value.value === "string") {
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
    }, [sheetData, searchTerm, searchColumn, itemsPerPage, currentPage, shipmentTypeFilter])

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

    const today_date = () => {
        const now = new Date()
        const options = { timeZone: "Asia/Kolkata" }
        const istDate = new Intl.DateTimeFormat("en-GB", options).format(now)
        return istDate
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
                    item.address.includes(",") ? `"${item.address}"` : item.address, // Fix here
                    "",
                    "",
                    item.email || "",
                    item.cm_phone,
                    "9825624002",
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
            const smartShipData = data.filter((item) => ["Bluedart", "Delhivery"].includes(item.shipment_type?.value))
            const rows = smartShipData.map((item, index) => {
                const values = [
                    `${item.cm_first_name} ${item.cm_last_name}`.trim(),
                    item.cm_phone,
                    item.address.includes(",") ? `"${item.address}"` : item.address, // Fix here
                    item.pincode,
                    "OTC",
                    item.products.total, //to be done total value
                    item.amount?.value || "",
                    500,
                    13,
                    13,
                    13,
                    30049011,
                    12,
                    1,
                    item.ref,
                    item.ref,
                    today_date(),
                    "171228",
                ]
                return values.join(",")
            })

            const header = [
                "Consignee Name",
                "Consignee Phone",
                "Consignee Address",
                "Consignee Pincode",
                "Product Name",
                "Product Invoice Value",
                "Collectable Amount",
                "Weight",
                "Height",
                "Width",
                "Lendth",
                "HSN Code",
                "GST Rate",
                "Quantity",
                "Reference Order ID",
                "Invoice No.",
                "Invoice Date(DD-MM-YYYY)",
                "HUB",
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
        setCurrentPage(1) // Reset to first page when filter changes
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

    // Update the renderPaginationItems function to match ConfirmedPage
    // Add this function before the return statement
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

    // Update the initial loading check to include permissions loading
    if (isLoading && sheetData.length == 0) {
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
        <div className="container mx-auto p-8 bg-gray-50 h-full max-w-full">
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-3xl font-bold">Sheet Generator</CardTitle>
                    <div className="flex items-center space-x-4">
                        {/* Refresh Label */}
                        {/* <span className="text-l font-semibold">Refresh:</span> */}

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

                        {/* Column Selection Dropdown */}
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
                                {hasColumnPermission("city") && <SelectItem value="city">City/Town/Village</SelectItem>}
                                {hasColumnPermission("pincode") && <SelectItem value="pincode">Pincode</SelectItem>}
                                {hasColumnPermission("state") && <SelectItem value="state">State</SelectItem>}
                                {hasColumnPermission("disease") && <SelectItem value="disease">Disease</SelectItem>}
                                {hasColumnPermission("amount") && <SelectItem value="amount">Amount</SelectItem>}
                                {hasColumnPermission("products") && <SelectItem value="products">Products</SelectItem>}
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
                    <div className="flex items-center justify-between mb-4">
                        {/* Left Side: Filter Dropdown & Record Count */}
                        <div className="flex items-center space-x-2">
                            <Select onValueChange={handleShipmentTypeFilter} defaultValue="all">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="smartship">Smartship (Bluedart+Delhivery)</SelectItem>
                                    <SelectItem value="Indian Post">Indian Post</SelectItem>
                                    <SelectItem value="F2F">F2F</SelectItem>
                                </SelectContent>
                            </Select>
                            <Badge variant="outline" className="mb-2">
                                {filteredData.length} records found
                            </Badge>
                        </div>

                        {/* Right Side: Download Buttons & Rows per Page Dropdown */}
                        <div className="flex items-center space-x-4">
                            {/* Download Buttons */}
                            <div className="flex space-x-2">
                                {shipmentTypeFilter === "Indian Post" && hasColumnPermission("download") && (
                                    <Button
                                        onClick={() => downloadCSV("indian_post")}
                                        className="flex items-center gap-2"
                                        disabled={isDownloading || filteredData.length === 0}
                                        variant="outline"
                                    >
                                        {isDownloading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Download className="h-4 w-4" />
                                        )}
                                        Download Indian Post CSV
                                    </Button>
                                )}
                                {shipmentTypeFilter === "smartship" && hasColumnPermission("download") && (
                                    <Button
                                        onClick={() => downloadCSV("smart_ship")}
                                        className="flex items-center gap-2"
                                        disabled={isDownloading || filteredData.length === 0}
                                        variant="outline"
                                    >
                                        {isDownloading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Download className="h-4 w-4" />
                                        )}
                                        Download SmartShip CSV
                                    </Button>
                                )}
                            </div>
                            {/* Rows-per-page Dropdown */}
                            <div className="flex items-center space-x-1">
                                <span className="text-sm text-gray-600">Rows per page:</span>
                                <Select
                                    onValueChange={handleItemsPerPageChange}
                                    value={String(itemsPerPage)}
                                    defaultValue="10"
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
                    </div>
                </CardContent>

            </Card>

            {/* <Card>
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
            </Card> */}
            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <div>{hasColumnPermission("ref") && <span>Ref</span>}</div>
                                    </TableHead>
                                    {hasColumnPermission("date") && <TableHead>Date</TableHead>}
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("cm_first_name") && <span>First Name</span>}
                                            {hasColumnPermission("cm_first_name") && hasColumnPermission("cm_last_name") && <br />}
                                            {hasColumnPermission("cm_last_name") && <span>Last Name</span>}
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("cm_phone") && <span>Phone</span>}
                                            {hasColumnPermission("cm_phone") && hasColumnPermission("alternate_phone") && <br />}
                                            {hasColumnPermission("alternate_phone") && <span>Alternate Phone</span>}
                                        </div>
                                    </TableHead>
                                    {hasColumnPermission("address") && <TableHead>Address</TableHead>}
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("city") && <span>City</span>}
                                            {hasColumnPermission("city") && hasColumnPermission("state") && <br />}
                                            {hasColumnPermission("state") && <span>State</span>}
                                        </div>
                                    </TableHead>
                                    {hasColumnPermission("products") && <TableHead>Products</TableHead>}
                                    {hasColumnPermission("amount") && <TableHead>Amount</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={12} className="text-center py-8">
                                            No data found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((item, index) => (
                                        <TableRow key={item._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                            <TableCell>
                                                <div>{hasColumnPermission("ref") && item.ref}</div>
                                            </TableCell>
                                            {hasColumnPermission("date") && <TableCell>{item.date}</TableCell>}
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("cm_first_name") && item.cm_first_name}
                                                    {hasColumnPermission("cm_first_name") && hasColumnPermission("cm_last_name") && <br />}
                                                    {hasColumnPermission("cm_last_name") && item.cm_last_name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("cm_phone") && item.cm_phone}
                                                    {hasColumnPermission("cm_phone") && hasColumnPermission("alternate_phone") && <br />}
                                                    {hasColumnPermission("alternate_phone") && item.alternate_phone}
                                                </div>
                                            </TableCell>
                                            {hasColumnPermission("address") && <TableCell>{item.address}</TableCell>}
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("city") && item.city}
                                                    {hasColumnPermission("city") && hasColumnPermission("state") && <br />}
                                                    {hasColumnPermission("state") && item.state?.value}
                                                </div>
                                            </TableCell>
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
                                            {hasColumnPermission("amount") && <TableCell>{item.amount?.value}</TableCell>}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-4 flex flex-col items-center justify-center space-y-4">
                {totalPages > 0 && (
                    <>
                        <div className="text-sm text-gray-600">
                            Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                            {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
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
        </div>
    )
}

export default SheetGenerator
