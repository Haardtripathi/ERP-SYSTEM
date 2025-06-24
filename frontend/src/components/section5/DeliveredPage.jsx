

// "use client"
// import { useState, useEffect, useCallback, useRef } from "react"

// import { delivered } from "@/services/deliveredService"
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
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// import { Loader2, Scan, RefreshCcw } from "lucide-react"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import PaymentDialog from "@/components/section5/PaymentDialog"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// const Table = ({ children }) => (
//     <div className="overflow-x-auto">
//         <table className="w-full border-collapse min-w-max">{children}</table>
//     </div>
// )

// const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

// const TableRow = ({ children, item }) => {
//     const getRowBackgroundClass = () => {
//         return "bg-purple-100 hover:bg-purple-200"
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

// const DeliveredPage = () => {
//     const [deliveredData, setDeliveredData] = useState([])
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
//     const [sortBy, setSortBy] = useState("delivered_date") // Default sorting by Return Date


//     const [returnManualInput, setReturnManualInput] = useState("")
//     const [isReturnScanning, setIsReturnScanning] = useState(false)
//     const [returnScanInput, setReturnScanInput] = useState("")
//     const returnScanInputRef = useRef(null)

//     const [refreshing, setRefreshing] = useState(false)



//     const fetchData = useCallback(async () => {
//         try {
//             setIsLoading(true)
//             const response = await delivered()
//             // Ensure we have a valid array of data
//             if (response.data?.deliveredData) {
//                 const validData = Array.isArray(response.data.deliveredData) ? response.data.deliveredData : [response.data.deliveredData]
//                 setDeliveredData(validData)
//                 setFilteredData(validData)
//                 setTotalPages(Math.ceil(validData.length / itemsPerPage))
//             } else {
//                 setDeliveredData([])
//                 setFilteredData([])
//                 setTotalPages(0)
//             }
//         } catch (error) {
//             console.error("Error fetching dispatch data:", error)
//             setError(error.message || "Failed to fetch data. Please try again later.")
//             setDeliveredData([])
//             setFilteredData([])
//             setTotalPages(0)
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
//     const applyFiltersAndPaginate = useCallback(() => {
//         if (!Array.isArray(deliveredData) || deliveredData.length === 0) {
//             setPaginatedData([]);
//             setTotalPages(0);
//             return;
//         }

//         const results = deliveredData.filter((item) => {
//             if (!item?.dispatchedId?.confirmedId) return false;

//             if (searchColumn === "all") {
//                 const searchableValues = {
//                     ref: item?.dispatchedId?.confirmedId?.ref,
//                     date: item?.date,
//                     time: item?.time,
//                     source: item?.dispatchedId?.confirmedId?.source?.value,
//                     payment_type: item?.dispatchedId?.confirmedId?.payment_type?.value,
//                     sale_type: item?.dispatchedId?.confirmedId?.sale_type?.value,
//                     agent_name: item?.dispatchedId?.confirmedId?.agent_name?.value,
//                     cm_first_name: item?.dispatchedId?.confirmedId?.cm_first_name,
//                     cm_last_name: item?.dispatchedId?.confirmedId?.cm_last_name,
//                     cm_phone: item?.dispatchedId?.confirmedId?.cm_phone?.toString(),
//                     alternate_phone: item?.dispatchedId?.confirmedId?.alternate_phone?.toString(),
//                     email: item?.dispatchedId?.confirmedId?.email,
//                 };

//                 return Object.values(searchableValues).some(
//                     (val) =>
//                         val !== null &&
//                         val !== undefined &&
//                         typeof val.toString === "function" &&
//                         val.toString().toLowerCase().includes(searchTerm.toLowerCase())
//                 );
//             } else {
//                 const value = item?.dispatchedId?.confirmedId?.[searchColumn];
//                 if (value === null || value === undefined) return false;

//                 if (typeof value === "object" && value?.value) {
//                     return typeof value.value === "string" && value.value.toLowerCase().includes(searchTerm.toLowerCase());
//                 } else if (typeof value.toString === "function") {
//                     return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
//                 }
//                 return false;
//             }
//         });

//         if (results.length === 0) {
//             setPaginatedData([]);
//             setTotalPages(0);
//             return;
//         }

//         results.sort((a, b) => {
//             const dateA =
//                 sortBy === "delivered_date"
//                     ? new Date(a?.date || 0) // Safe access to avoid NaN errors
//                     : new Date(a?.dispatchedId?.date || 0);
//             const dateB =
//                 sortBy === "delivered_date"
//                     ? new Date(b?.date || 0)
//                     : new Date(b?.dispatchedId?.date || 0);

//             return dateB - dateA; // New → Old sorting
//         });

//         setFilteredData(results);
//         const newTotalPages = Math.ceil(results.length / itemsPerPage);
//         setTotalPages(newTotalPages);
//         setCurrentPage((prev) => Math.min(prev, newTotalPages));

//         const startIndex = (currentPage - 1) * itemsPerPage;
//         setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage));
//     }, [deliveredData, searchTerm, searchColumn, itemsPerPage, currentPage, sortBy]);


//     useEffect(() => {
//         applyFiltersAndPaginate()
//     }, [applyFiltersAndPaginate])

//     const handleReturnManualInputChange = (e) => {
//         if (!isReturnScanning) {
//             const cleanedInput = e.target.value.replace(/[^a-zA-Z0-9]/g, "")
//             setReturnManualInput(cleanedInput)
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
//         <div className="container mx-auto p-8 bg-gray-50 h-full max-w-full">

//             <Card className="mb-6">
//                 <CardHeader className="flex flex-row items-center justify-between pb-4">
//                     <CardTitle className="text-3xl font-bold">Delivered Page</CardTitle>
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
//                     <div className="flex items-center gap-2">
//                         <span>Sort By:</span>
//                         <Select onValueChange={setSortBy} defaultValue="delivered_date">
//                             <SelectTrigger className="w-[200px]">
//                                 <SelectValue placeholder="Sort By" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="delivered_date">Delivered Date (New → Old)</SelectItem>
//                                 <SelectItem value="dispatch_date">Dispatch Date (New → Old)</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </div>
//                 </CardContent>

//             </Card>

//             <div className="bg-white shadow-md rounded-lg overflow-hidden">
//                 <div className="max-w-full">
//                     <Table>
//                         <TableHeader>
//                             <tr className="bg-gray-200">
//                                 {/* Group 1: (Ref, AWB) */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Payment</span>

//                                     </div>
//                                 </TableHead>

//                                 <TableHead>
//                                     <div>
//                                         <span>Ref</span>
//                                         <br />
//                                         <span>AWB</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Group 2: (Date, Dispatch Date) */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Date</span>
//                                         <br />
//                                         <span>Dispatch Date</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Group 3: (Sale Type, Payment Type) */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Sale Type</span>
//                                         <br />
//                                         <span>Payment Type</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Group 4: (Agent Name, First & Last Name) */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Agent Name</span>
//                                         <br />
//                                         <span>Name</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Group 5: (Phone, Alternate Phone) */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Phone</span>
//                                         <br />
//                                         <span>Alternate Phone</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Group 6: (Address, City & District) */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Address</span>
//                                         <br />
//                                         <span>City, District</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Group 7: (State, Pincode) */}
//                                 <TableHead>
//                                     <div>
//                                         <span>State</span>
//                                         <br />
//                                         <span>Pincode</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Group 8: (Amount, Products) */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Amount</span>
//                                         <br />
//                                         <span>Products</span>
//                                     </div>
//                                 </TableHead>
//                             </tr>
//                         </TableHeader>
//                         <TableBody>
//                             {paginatedData.map((item) => (
//                                 <TableRow key={item._id} item={item}>
//                                     {/* Group 1: Ref & AWB */}
//                                     <TableCell>
//                                         <span>
//                                             <Button
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 className={`px-3 py-1 text-sm transition-all ${item.payment_received ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
//                                                     }`}
//                                                 disabled={item.payment_received}
//                                             >
//                                                 {item.payment_received ? "Paid" : "Add Now"}
//                                                 {!item.payment_received && (
//                                                     <PaymentDialog referenceId={item.dispatchedId?.confirmedId?.ref} dispatchedId={item.dispatchedId?._id} />
//                                                 )}
//                                             </Button>
//                                         </span>
//                                     </TableCell>
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.dispatchedId.confirmedId?.ref}</span>
//                                             <br />
//                                             <span>{item.dispatchedId.confirmedId?.awb_number}</span>
//                                         </div>
//                                     </TableCell>
//                                     {/* Group 2: Date & Dispatch Date */}
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.date}</span>
//                                             <br />
//                                             <span>{item.dispatchedId?.date}</span>
//                                         </div>
//                                     </TableCell>
//                                     {/* Group 3: Sale Type & Payment Type */}
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.dispatchedId.confirmedId?.sale_type?.value}</span>
//                                             <br />
//                                             <span>{item.dispatchedId.confirmedId?.payment_type?.value}</span>
//                                         </div>
//                                     </TableCell>
//                                     {/* Group 4: Agent Name & First+Last Name */}
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.dispatchedId.confirmedId?.agent_name?.value}</span>
//                                             <br />
//                                             <span>
//                                                 {item.dispatchedId.confirmedId?.cm_first_name}{" "}
//                                                 {item.dispatchedId.confirmedId?.cm_last_name}
//                                             </span>
//                                         </div>
//                                     </TableCell>
//                                     {/* Group 5: Phone & Alternate Phone */}
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.dispatchedId.confirmedId?.cm_phone}</span>
//                                             <br />
//                                             <span>{item.dispatchedId.confirmedId?.alternate_phone}</span>
//                                         </div>
//                                     </TableCell>
//                                     {/* Group 6: Address, City & District */}
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.dispatchedId.confirmedId?.address}</span>
//                                             <br />
//                                             <span>
//                                                 {item.dispatchedId.confirmedId?.city}, {item.dispatchedId.confirmedId?.district}
//                                             </span>
//                                         </div>
//                                     </TableCell>
//                                     {/* Group 7: State & Pincode */}
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.dispatchedId.confirmedId?.state?.value}</span>
//                                             <br />
//                                             <span>{item.dispatchedId.confirmedId?.pincode}</span>
//                                         </div>
//                                     </TableCell>
//                                     {/* Group 8: Amount & Products */}
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.dispatchedId.confirmedId?.amount?.value}</span>
//                                             <br />
//                                             <span>
//                                                 {Array.isArray(item.dispatchedId.confirmedId?.products?.value) &&
//                                                     item.dispatchedId.confirmedId.products.value.length > 0
//                                                     ? item.dispatchedId.confirmedId.products.value.map((product, index) => (
//                                                         <div key={index}>
//                                                             {product.product} : {product.quantity}
//                                                         </div>
//                                                     ))
//                                                     : "No Products"}
//                                             </span>
//                                         </div>
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

// export default DeliveredPage








"use client"

import { useState, useEffect, useCallback } from "react"
import { delivered } from "@/services/deliveredService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination"
import { Loader2, RefreshCcw } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-hot-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useNavigate } from "react-router-dom"
import useAccessControl from "../AccessControl"
import PaymentDialog from "@/components/section5/PaymentDialog"

const Table = ({ children }) => (
    <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">{children}</table>
    </div>
)

const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

const TableRow = ({ children }) => <tr className="bg-purple-100 hover:bg-purple-200">{children}</tr>

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

const DeliveredPage = () => {
    const [deliveredData, setDeliveredData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [searchColumn, setSearchColumn] = useState("all")
    const [goToPage, setGoToPage] = useState("")
    const [refreshing, setRefreshing] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState(null)
    const [columnPermissions, setColumnPermissions] = useState([])

    const { permissions, loading } = useAccessControl("/delivered")
    const navigate = useNavigate()

    useEffect(() => {
        if (loading) return // Wait until loading is complete


        // Ensure permissions exist
        if (!permissions) {
            navigate("/dashboard") // Redirect if no permissions
            return
        }

        // Check if user has access to this page
        if (!permissions.page || permissions.page !== "/delivered") {
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

            // Make the API call with the constructed query parameters
            const response = await delivered(queryString)

            if (response.data && response.data.deliveredData) {
                const validData = Array.isArray(response.data.deliveredData)
                    ? response.data.deliveredData
                    : [response.data.deliveredData]

                setDeliveredData(validData)

                // Ensure totalCount is a number
                const count = Number.parseInt(response.data.totalCount, 10) || validData.length
                setTotalCount(count)

                // Calculate total pages based on count and limit
                const pages = Math.ceil(count / limitNum) || 1
                setTotalPages(pages)

                // Ensure current page is valid
                const responsePage = Number.parseInt(response.data.currentPage, 10) || pageNum
                setCurrentPage(responsePage > pages ? 1 : responsePage)

            } else {
                console.error("Invalid response format:", response)
                setDeliveredData([])
                setError("Invalid data format received from server")
            }
        } catch (error) {
            console.error("Error fetching delivered data:", error)
            setError("Failed to fetch data. Please try again later.")
            setDeliveredData([])
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

    if (isLoading && deliveredData.length === 0) {
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
        <div className="container mx-auto p-8 bg-gray-50 h-full max-w-full">
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-3xl font-bold">Delivered Management</CardTitle>
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
                                {hasColumnPermission("dispatchedId") && <SelectItem value="dispatchedId">Dispatched ID</SelectItem>}
                                {hasColumnPermission("date") && <SelectItem value="date">Date</SelectItem>}
                                {hasColumnPermission("time") && <SelectItem value="time">Time</SelectItem>}
                                {hasColumnPermission("payment_received") && <SelectItem value="payment_received">Payment Received</SelectItem>}
                                {hasColumnPermission("isDeleted") && <SelectItem value="isDeleted">Is Deleted</SelectItem>}
                                {hasColumnPermission("_id") && <SelectItem value="_id">ID</SelectItem>}
                                {hasColumnPermission("date_dispatched") && <SelectItem value="date_dispatched">Date Dispatched</SelectItem>}
                                {hasColumnPermission("ref") && <SelectItem value="ref">Reference</SelectItem>}
                                {hasColumnPermission("payment_type") && <SelectItem value="payment_type">Payment Type</SelectItem>}
                                {hasColumnPermission("sale_type") && <SelectItem value="sale_type">Sale Type</SelectItem>}
                                {hasColumnPermission("agent_name") && <SelectItem value="agent_name">Agent Name</SelectItem>}
                                {hasColumnPermission("cm_first_name") && <SelectItem value="cm_first_name">First Name</SelectItem>}
                                {hasColumnPermission("cm_last_name") && <SelectItem value="cm_last_name">Last Name</SelectItem>}
                                {hasColumnPermission("cm_phone") && <SelectItem value="cm_phone">Phone</SelectItem>}
                                {hasColumnPermission("alternate_phone") && <SelectItem value="alternate_phone">Alternate Phone</SelectItem>}
                                {hasColumnPermission("shipment_type") && <SelectItem value="shipment_type">Shipment Type</SelectItem>}
                                {hasColumnPermission("address") && <SelectItem value="address">Address</SelectItem>}
                                {hasColumnPermission("district") && <SelectItem value="district">District</SelectItem>}
                                {hasColumnPermission("city") && <SelectItem value="city">City</SelectItem>}
                                {hasColumnPermission("pincode") && <SelectItem value="pincode">Pincode</SelectItem>}
                                {hasColumnPermission("state") && <SelectItem value="state">State</SelectItem>}
                                {hasColumnPermission("amount") && <SelectItem value="amount">Amount</SelectItem>}
                                {hasColumnPermission("products") && <SelectItem value="products">Products</SelectItem>}
                            </SelectContent>
                        </Select>

                        {/* Search Input */}
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearch}
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

            {isLoading && deliveredData.length > 0 && (
                <div className="flex justify-center my-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="max-w-full">
                    <Table>
                        <TableHeader>
                            <tr className="bg-gray-200">
                                {/* Payment Action Column */}
                                {hasColumnPermission("Add Payment") && (
                                    <TableHead>Payment</TableHead>
                                )}

                                {/* Group 1: Ref & AWB */}
                                {(hasColumnPermission("ref") || hasColumnPermission("awb_number")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("ref") && <span>Ref</span>}
                                            {hasColumnPermission("ref") && hasColumnPermission("awb_number") && <br />}
                                            {hasColumnPermission("awb_number") && <span>AWB</span>}
                                        </div>
                                    </TableHead>
                                )}

                                {/* Group 2: Date & Dispatch Date */}
                                {(hasColumnPermission("date") || hasColumnPermission("date_dispatched")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("date") && <span>Date</span>}
                                            {hasColumnPermission("date") && hasColumnPermission("date_dispatched") && <br />}
                                            {hasColumnPermission("date_dispatched") && <span>Dispatch Date</span>}
                                        </div>
                                    </TableHead>
                                )}

                                {/* Group 3: Sale Type & Payment Type */}
                                {(hasColumnPermission("sale_type") || hasColumnPermission("payment_type")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("sale_type") && <span>Sale Type</span>}
                                            {hasColumnPermission("sale_type") && hasColumnPermission("payment_type") && <br />}
                                            {hasColumnPermission("payment_type") && <span>Payment Type</span>}
                                        </div>
                                    </TableHead>
                                )}

                                {/* Group 4: Agent Name & Customer Name */}
                                {(hasColumnPermission("agent_name") || hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("agent_name") && <span>Agent Name</span>}
                                            {hasColumnPermission("agent_name") && (hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) && <br />}
                                            {(hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) && <span>Name</span>}
                                        </div>
                                    </TableHead>
                                )}

                                {/* Group 5: Phone & Alternate Phone */}
                                {(hasColumnPermission("cm_phone") || hasColumnPermission("alternate_phone")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("cm_phone") && <span>Phone</span>}
                                            {hasColumnPermission("cm_phone") && hasColumnPermission("alternate_phone") && <br />}
                                            {hasColumnPermission("alternate_phone") && <span>Alternate Phone</span>}
                                        </div>
                                    </TableHead>
                                )}

                                {/* Group 6: Address, City & District */}
                                {(hasColumnPermission("address") || hasColumnPermission("city") || hasColumnPermission("district")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("address") && <span>Address</span>}
                                            {hasColumnPermission("address") && (hasColumnPermission("city") || hasColumnPermission("district")) && <br />}
                                            {(hasColumnPermission("city") || hasColumnPermission("district")) && (
                                                <span>
                                                    {hasColumnPermission("city") && "City"}
                                                    {hasColumnPermission("city") && hasColumnPermission("district") && ", "}
                                                    {hasColumnPermission("district") && "District"}
                                                </span>
                                            )}
                                        </div>
                                    </TableHead>
                                )}

                                {/* Group 7: State & Pincode */}
                                {(hasColumnPermission("state") || hasColumnPermission("pincode")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("state") && <span>State</span>}
                                            {hasColumnPermission("state") && hasColumnPermission("pincode") && <br />}
                                            {hasColumnPermission("pincode") && <span>Pincode</span>}
                                        </div>
                                    </TableHead>
                                )}

                                {/* Group 8: Amount & Products */}
                                {(hasColumnPermission("amount") || hasColumnPermission("products")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("amount") && <span>Amount</span>}
                                            {hasColumnPermission("amount") && hasColumnPermission("products") && <br />}
                                            {hasColumnPermission("products") && <span>Products</span>}
                                        </div>
                                    </TableHead>
                                )}
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {deliveredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12} className="text-center py-8">
                                        No data found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                deliveredData.map((item) => (
                                    <TableRow key={item._id}>
                                        {/* Payment Action Column */}
                                        {hasColumnPermission("Add Payment") && (
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`px-3 py-1 text-sm transition-all ${item.payment_received ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"}`}
                                                    disabled={item.payment_received}
                                                >
                                                    {item.payment_received ? "Paid" : "Add Now"}
                                                    {!item.payment_received && (
                                                        <PaymentDialog
                                                            referenceId={item.dispatchedId?.confirmedId?.ref}
                                                            dispatchedId={item.dispatchedId?._id}
                                                        />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        )}

                                        {/* Group 1: Ref & AWB */}
                                        {(hasColumnPermission("ref") || hasColumnPermission("awb_number")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("ref") && <span>{item.dispatchedId?.confirmedId?.ref}</span>}
                                                    {hasColumnPermission("ref") && hasColumnPermission("awb_number") && <br />}
                                                    {hasColumnPermission("awb_number") && <span>{item.dispatchedId?.confirmedId?.awb_number}</span>}
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* Group 2: Date & Dispatch Date */}
                                        {(hasColumnPermission("date") || hasColumnPermission("date_dispatched")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("date") && <span>{item.date}</span>}
                                                    {hasColumnPermission("date") && hasColumnPermission("date_dispatched") && <br />}
                                                    {hasColumnPermission("date_dispatched") && <span>{item.dispatchedId?.date_dispatched}</span>}
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* Group 3: Sale Type & Payment Type */}
                                        {(hasColumnPermission("sale_type") || hasColumnPermission("payment_type")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("sale_type") && <span>{item.dispatchedId?.confirmedId?.sale_type?.value}</span>}
                                                    {hasColumnPermission("sale_type") && hasColumnPermission("payment_type") && <br />}
                                                    {hasColumnPermission("payment_type") && <span>{item.dispatchedId?.confirmedId?.payment_type?.value}</span>}
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* Group 4: Agent Name & Customer Name */}
                                        {(hasColumnPermission("agent_name") || hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("agent_name") && <span>{item.dispatchedId?.confirmedId?.agent_name?.value}</span>}
                                                    {hasColumnPermission("agent_name") && (hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) && <br />}
                                                    {(hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) && (
                                                        <span>
                                                            {item.dispatchedId?.confirmedId?.cm_first_name} {item.dispatchedId?.confirmedId?.cm_last_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* Group 5: Phone & Alternate Phone */}
                                        {(hasColumnPermission("cm_phone") || hasColumnPermission("alternate_phone")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("cm_phone") && <span>{item.dispatchedId?.confirmedId?.cm_phone}</span>}
                                                    {hasColumnPermission("cm_phone") && hasColumnPermission("alternate_phone") && <br />}
                                                    {hasColumnPermission("alternate_phone") && <span>{item.dispatchedId?.confirmedId?.alternate_phone}</span>}
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* Group 6: Address, City & District */}
                                        {(hasColumnPermission("address") || hasColumnPermission("city") || hasColumnPermission("district")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("address") && <span>{item.dispatchedId?.confirmedId?.address}</span>}
                                                    {hasColumnPermission("address") && (hasColumnPermission("city") || hasColumnPermission("district")) && <br />}
                                                    {(hasColumnPermission("city") || hasColumnPermission("district")) && (
                                                        <span>
                                                            {hasColumnPermission("city") && item.dispatchedId?.confirmedId?.city}
                                                            {hasColumnPermission("city") && hasColumnPermission("district") && ", "}
                                                            {hasColumnPermission("district") && item.dispatchedId?.confirmedId?.district}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* Group 7: State & Pincode */}
                                        {(hasColumnPermission("state") || hasColumnPermission("pincode")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("state") && <span>{item.dispatchedId?.confirmedId?.state?.value}</span>}
                                                    {hasColumnPermission("state") && hasColumnPermission("pincode") && <br />}
                                                    {hasColumnPermission("pincode") && <span>{item.dispatchedId?.confirmedId?.pincode}</span>}
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* Group 8: Amount & Products */}
                                        {(hasColumnPermission("amount") || hasColumnPermission("products")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("amount") && <span>{item.dispatchedId?.confirmedId?.amount?.value}</span>}
                                                    {hasColumnPermission("amount") && hasColumnPermission("products") && <br />}
                                                    {hasColumnPermission("products") && (
                                                        <span>
                                                            {Array.isArray(item.dispatchedId?.confirmedId?.products?.value) &&
                                                                item.dispatchedId?.confirmedId?.products?.value.length > 0
                                                                ? item.dispatchedId?.confirmedId?.products?.value.map((product, index) => (
                                                                    <div key={index}>
                                                                        {product.product} : {product.quantity}
                                                                    </div>
                                                                ))
                                                                : "No Products"}
                                                        </span>
                                                    )}
                                                </div>
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
                            Showing {deliveredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
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

export default DeliveredPage