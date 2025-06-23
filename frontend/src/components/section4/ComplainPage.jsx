


// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { getAllComplain, editComplainId } from "@/services/complainService"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// import {
//     Pagination,
//     PaginationContent,
//     PaginationItem,
//     PaginationLink,
//     PaginationNext,
//     PaginationPrevious,
//     PaginationEllipsis,
// } from "@/components/ui/pagination"
// import { Loader2, RefreshCcw } from "lucide-react"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { toast } from "react-hot-toast"
// import { Edit2, Check, X } from "lucide-react"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// const Table = ({ children }) => (
//     <div className="overflow-x-auto">
//         <table className="w-full border-collapse min-w-max">{children}</table>
//     </div>
// )

// const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

// const TableRow = ({ children }) => <tr className="bg-yellow-100 hover:bg-yellow-200">{children}</tr>

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

// const ComplainPage = () => {
//     const [complainData, setComplainData] = useState([])
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

//     const [editingId, setEditingId] = useState(null)
//     const [editValue, setEditValue] = useState("")

//     const [refreshing, setRefreshing] = useState(false)


//     const fetchData = useCallback(async () => {
//         try {
//             setIsLoading(true)
//             const response = await getAllComplain()
//             console.log(response)
//             if (response.data?.complainData) {
//                 const validData = Array.isArray(response.data.complainData) ? response.data.complainData : [response.data.complainData]
//                 setComplainData(validData)
//                 setFilteredData(validData)
//                 setTotalPages(Math.ceil(validData.length / itemsPerPage))
//             } else {
//                 setComplainData([])
//                 setFilteredData([])
//                 setTotalPages(0)
//             }
//         } catch (error) {
//             console.error("Error fetching complain data:", error)
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
//     //     const results = complainData.filter((item) => {
//     //         if (searchColumn === "all") {
//     //             return Object.values(item).some(
//     //                 (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()),
//     //             )
//     //         } else {
//     //             const value = item[searchColumn]
//     //             return typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
//     //         }
//     //     })
//     //     setFilteredData(results)
//     //     const newTotalPages = Math.ceil(results.length / itemsPerPage)
//     //     setTotalPages(newTotalPages)

//     //     const startIndex = (currentPage - 1) * itemsPerPage
//     //     setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
//     // }, [complainData, searchTerm, searchColumn, itemsPerPage, currentPage])
//     const applyFiltersAndPaginate = useCallback(() => {
//         const results = complainData.filter((item) => {
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

//                 return typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase());
//             }
//         });

//         setFilteredData(results);
//         const newTotalPages = Math.ceil(results.length / itemsPerPage);
//         setTotalPages(newTotalPages);

//         const startIndex = (currentPage - 1) * itemsPerPage;
//         setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage));
//     }, [complainData, searchTerm, searchColumn, itemsPerPage, currentPage]);

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

//     const handleEdit = (id, currentValue) => {
//         if (!currentValue) { // Only allow editing if complain_id is empty
//             setEditingId(id)
//             setEditValue("")
//         }
//     }

//     const handleSave = async (id) => {
//         try {
//             if (!editValue.trim()) {
//                 toast.error("Complain ID cannot be empty")
//                 return
//             }
//             await editComplainId({ id, editValue })
//             toast.success("Complain ID updated successfully")

//             // Update local state
//             const updatedData = complainData.map(item =>
//                 item._id === id ? { ...item, complain_id: editValue } : item
//             )
//             setComplainData(updatedData)
//             setFilteredData(updatedData)

//             // Reset editing state
//             setEditingId(null)
//             setEditValue("")

//             // Refresh the current page
//             applyFiltersAndPaginate()
//         } catch (error) {
//             console.error("Error updating complain ID:", error)
//             toast.error("Failed to update Complain ID")
//         }
//     }

//     const handleCancel = () => {
//         setEditingId(null)
//         setEditValue("")
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

//             <Card className="mb-6">
//                 <CardHeader className="flex flex-row items-center justify-between pb-4">
//                     <CardTitle className="text-3xl font-bold">Complain Page</CardTitle>
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

//             </Card>


//             <div className="bg-white shadow-md rounded-lg overflow-hidden">
//                 <div className="max-w-full">
//                     <Table>
//                         <TableHeader>
//                             <tr className="bg-gray-200">
//                                 {/* Group 1: Date & Complain Detail */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Date</span>
//                                         <br />
//                                         <span>Complain Detail</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Group 2: Dispatched Date & Complain ID */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Dispatched Date</span>
//                                         <br />
//                                         <span>Complain ID</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Group 3: Ref & AWB */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Ref</span>
//                                         <br />
//                                         <span>AWB</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Group 4: Name */}
//                                 <TableHead>Name</TableHead>
//                                 {/* Group 5: Phone & Alternate Phone */}
//                                 <TableHead>
//                                     <div>
//                                         <span>Phone</span>
//                                         <br />
//                                         <span>Alternate Phone</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Group 6: Address */}
//                                 <TableHead>Address</TableHead>
//                                 {/* Group 7: City & District */}
//                                 <TableHead>
//                                     <div>
//                                         <span>City</span>
//                                         <br />
//                                         <span>District</span>
//                                     </div>
//                                 </TableHead>
//                                 {/* Group 8: State & Pin */}
//                                 <TableHead>
//                                     <div>
//                                         <span>State</span>
//                                         <br />
//                                         <span>Pin</span>
//                                     </div>
//                                 </TableHead>
//                             </tr>
//                         </TableHeader>
//                         <TableBody>
//                             {paginatedData.map((item) => (
//                                 <TableRow key={item._id}>
//                                     {/* Group 1: Date & Complain Detail */}
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.date}</span>
//                                             <br />
//                                             <span>{item.complain_detail}</span>
//                                         </div>
//                                     </TableCell>
//                                     {/* Group 2: Dispatched Date & Complain ID */}
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.dispatchedId?.date_dispatched}</span>
//                                             <br />
//                                             <div className="flex items-center space-x-2">
//                                                 {editingId === item._id ? (
//                                                     <>
//                                                         <Input
//                                                             value={editValue}
//                                                             onChange={(e) => setEditValue(e.target.value)}
//                                                             className="w-32"
//                                                         />
//                                                         <Button
//                                                             size="sm"
//                                                             onClick={() => handleSave(item._id)}
//                                                             className="p-1"
//                                                         >
//                                                             <Check className="h-4 w-4" />
//                                                         </Button>
//                                                         <Button
//                                                             size="sm"
//                                                             variant="destructive"
//                                                             onClick={handleCancel}
//                                                             className="p-1"
//                                                         >
//                                                             <X className="h-4 w-4" />
//                                                         </Button>
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         {item.complain_id}
//                                                         {!item.complain_id && (
//                                                             <Button
//                                                                 size="sm"
//                                                                 variant="ghost"
//                                                                 onClick={() => handleEdit(item._id, item.complain_id)}
//                                                                 className="p-1"
//                                                             >
//                                                                 <Edit2 className="h-4 w-4" />
//                                                             </Button>
//                                                         )}
//                                                     </>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </TableCell>
//                                     {/* Group 3: Ref & AWB */}
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.dispatchedId?.confirmedId?.ref}</span>
//                                             <br />
//                                             <span>{item.dispatchedId?.confirmedId?.awb_number}</span>
//                                         </div>
//                                     </TableCell>
//                                     {/* Group 4: Name */}
//                                     <TableCell>
//                                         {`${item.dispatchedId?.confirmedId?.cm_first_name} ${item.dispatchedId?.confirmedId?.cm_last_name}`}
//                                     </TableCell>
//                                     {/* Group 5: Phone & Alternate Phone */}
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.dispatchedId?.confirmedId?.cm_phone}</span>
//                                             <br />
//                                             <span>{item.dispatchedId?.confirmedId?.alternate_phone}</span>
//                                         </div>
//                                     </TableCell>
//                                     {/* Group 6: Address */}
//                                     <TableCell>{item.dispatchedId?.confirmedId?.address}</TableCell>
//                                     {/* Group 7: City & District */}
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.dispatchedId?.confirmedId?.city}</span>
//                                             <br />
//                                             <span>{item.dispatchedId?.confirmedId?.district}</span>
//                                         </div>
//                                     </TableCell>
//                                     {/* Group 8: State & Pin */}
//                                     <TableCell>
//                                         <div>
//                                             <span>{item.dispatchedId?.confirmedId?.state?.value}</span>
//                                             <br />
//                                             <span>{item.dispatchedId?.confirmedId?.pincode}</span>
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

// export default ComplainPage

"use client"

import { useState, useEffect, useCallback } from "react"
import { getAllComplain, editComplainId } from "@/services/complainService"
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
import { Loader2, RefreshCcw, Edit2, Check, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-hot-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useNavigate } from "react-router-dom"
import useAccessControl from "../AccessControl"

const Table = ({ children }) => (
    <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">{children}</table>
    </div>
)

const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

const TableRow = ({ children }) => <tr className="bg-yellow-100 hover:bg-yellow-200">{children}</tr>

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

const ComplainPage = () => {
    const [complainData, setComplainData] = useState([])
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

    const [editingId, setEditingId] = useState(null)
    const [editValue, setEditValue] = useState("")

    const { permissions, loading } = useAccessControl("/complain")
    const navigate = useNavigate()

    useEffect(() => {
        if (loading) return // Wait until loading is complete


        // Ensure permissions exist
        if (!permissions) {
            navigate("/dashboard") // Redirect if no permissions
            return
        }

        // Check if user has access to this page
        if (!permissions.page || permissions.page !== "/complain") {
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
            const response = await getAllComplain(queryString)

            if (response.data && response.data.complainData) {
                const validData = Array.isArray(response.data.complainData)
                    ? response.data.complainData
                    : [response.data.complainData]

                setComplainData(validData)

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
                setComplainData([])
                setError("Invalid data format received from server")
            }
        } catch (error) {
            console.error("Error fetching complain data:", error)
            setError("Failed to fetch data. Please try again later.")
            setComplainData([])
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

    const handleEdit = (id, currentValue) => {
        if (!hasColumnPermission("complain_id")) {
            toast.error("You don't have permission to update complain ID")
            return
        }

        if (!currentValue) { // Only allow editing if complain_id is empty
            setEditingId(id)
            setEditValue("")
        }
    }

    const handleSave = async (id) => {
        try {
            if (!hasColumnPermission("complain_id")) {
                toast.error("You don't have permission to update complain ID")
                return
            }

            if (!editValue.trim()) {
                toast.error("Complain ID cannot be empty")
                return
            }
            await editComplainId({ id, editValue })
            toast.success("Complain ID updated successfully")

            // Refresh the data to reflect the changes
            fetchData(currentPage, itemsPerPage, searchTerm, searchColumn)

            // Reset editing state
            setEditingId(null)
            setEditValue("")
        } catch (error) {
            console.error("Error updating complain ID:", error)
            toast.error("Failed to update Complain ID")
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditValue("")
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

    if (isLoading && complainData.length === 0) {
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
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-3xl font-bold">Complain Page</CardTitle>
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
                                {hasColumnPermission("date") && <SelectItem value="date">Date</SelectItem>}
                                {hasColumnPermission("dispatchedId") && <SelectItem value="dispatchedId">Dispatched ID</SelectItem>}
                                {hasColumnPermission("complain_id") && <SelectItem value="complain_id">Complain ID</SelectItem>}
                                {hasColumnPermission("complain_detail") && <SelectItem value="complain_detail">Complain Detail</SelectItem>}
                                {hasColumnPermission("complain_comment") && <SelectItem value="complain_comment">Complain Comment</SelectItem>}
                                {hasColumnPermission("ref") && <SelectItem value="ref">Reference</SelectItem>}
                                {hasColumnPermission("cm_first_name") && <SelectItem value="cm_first_name">First Name</SelectItem>}
                                {hasColumnPermission("cm_last_name") && <SelectItem value="cm_last_name">Last Name</SelectItem>}
                                {hasColumnPermission("cm_phone") && <SelectItem value="cm_phone">Phone</SelectItem>}
                                {hasColumnPermission("alternate_phone") && <SelectItem value="alternate_phone">Alternate Phone</SelectItem>}
                                {hasColumnPermission("address") && <SelectItem value="address">Address</SelectItem>}
                                {hasColumnPermission("awb_number") && <SelectItem value="awb_number">AWB Number</SelectItem>}
                                {hasColumnPermission("district") && <SelectItem value="district">District</SelectItem>}
                                {hasColumnPermission("city") && <SelectItem value="city">City</SelectItem>}
                                {hasColumnPermission("pincode") && <SelectItem value="pincode">Pincode</SelectItem>}
                                {hasColumnPermission("state") && <SelectItem value="state">State</SelectItem>}
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

            {isLoading && complainData.length > 0 && (
                <div className="flex justify-center my-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="max-w-full">
                    <Table>
                        <TableHeader>
                            <tr className="bg-gray-200">
                                {/* Group 1: Date & Complain Detail */}
                                {(hasColumnPermission("date") || hasColumnPermission("complain_detail")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("date") && <span>Date</span>}
                                            {hasColumnPermission("date") && hasColumnPermission("complain_detail") && <br />}
                                            {hasColumnPermission("complain_detail") && <span>Complain Detail</span>}
                                        </div>
                                    </TableHead>
                                )}

                                {/* Group 2: Dispatched Date & Complain ID */}
                                {(hasColumnPermission("date_dispatched") || hasColumnPermission("complain_id")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("date_dispatched") && <span>Dispatched Date</span>}
                                            {hasColumnPermission("date_dispatched") && hasColumnPermission("complain_id") && <br />}
                                            {hasColumnPermission("complain_id") && <span>Complain ID</span>}
                                        </div>
                                    </TableHead>
                                )}

                                {/* Group 3: Ref & AWB */}
                                {(hasColumnPermission("ref") || hasColumnPermission("awb_number")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("ref") && <span>Ref</span>}
                                            {hasColumnPermission("ref") && hasColumnPermission("awb_number") && <br />}
                                            {hasColumnPermission("awb_number") && <span>AWB</span>}
                                        </div>
                                    </TableHead>
                                )}

                                {/* Group 4: Name */}
                                {(hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) && (
                                    <TableHead>Name</TableHead>
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

                                {/* Group 6: Address */}
                                {hasColumnPermission("address") && <TableHead>Address</TableHead>}

                                {/* Group 7: City & District */}
                                {(hasColumnPermission("city") || hasColumnPermission("district")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("city") && <span>City</span>}
                                            {hasColumnPermission("city") && hasColumnPermission("district") && <br />}
                                            {hasColumnPermission("district") && <span>District</span>}
                                        </div>
                                    </TableHead>
                                )}

                                {/* Group 8: State & Pin */}
                                {(hasColumnPermission("state") || hasColumnPermission("pincode")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("state") && <span>State</span>}
                                            {hasColumnPermission("state") && hasColumnPermission("pincode") && <br />}
                                            {hasColumnPermission("pincode") && <span>Pin</span>}
                                        </div>
                                    </TableHead>
                                )}
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {complainData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12} className="text-center py-8">
                                        No data found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                complainData.map((item) => (
                                    <TableRow key={item._id}>
                                        {/* Group 1: Date & Complain Detail */}
                                        {(hasColumnPermission("date") || hasColumnPermission("complain_detail")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("date") && <span>{item.date}</span>}
                                                    {hasColumnPermission("date") && hasColumnPermission("complain_detail") && <br />}
                                                    {hasColumnPermission("complain_detail") && <span>{item.complain_detail}</span>}
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* Group 2: Dispatched Date & Complain ID */}
                                        {(hasColumnPermission("date_dispatched") || hasColumnPermission("complain_id")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("date_dispatched") && <span>{item.dispatchedId?.date_dispatched}</span>}
                                                    {hasColumnPermission("date_dispatched") && hasColumnPermission("complain_id") && <br />}
                                                    {hasColumnPermission("complain_id") && (
                                                        <div className="flex items-center space-x-2">
                                                            {editingId === item._id ? (
                                                                <>
                                                                    <Input
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        className="w-32"
                                                                    />
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleSave(item._id)}
                                                                        className="p-1"
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={handleCancel}
                                                                        className="p-1"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {item.complain_id}
                                                                    {!item.complain_id && hasColumnPermission("complain_id") && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => handleEdit(item._id, item.complain_id)}
                                                                            className="p-1"
                                                                        >
                                                                            <Edit2 className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* Group 3: Ref & AWB */}
                                        {(hasColumnPermission("ref") || hasColumnPermission("awb_number")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("ref") && <span>{item.dispatchedId?.confirmedId?.ref}</span>}
                                                    {hasColumnPermission("ref") && hasColumnPermission("awb_number") && <br />}
                                                    {hasColumnPermission("awb_number") && <span>{item.dispatchedId?.confirmedId?.awb_number}</span>}
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* Group 4: Name */}
                                        {(hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) && (
                                            <TableCell>
                                                {`${item.dispatchedId?.confirmedId?.cm_first_name || ''} ${item.dispatchedId?.confirmedId?.cm_last_name || ''}`}
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

                                        {/* Group 6: Address */}
                                        {hasColumnPermission("address") && (
                                            <TableCell>{item.dispatchedId?.confirmedId?.address}</TableCell>
                                        )}

                                        {/* Group 7: City & District */}
                                        {(hasColumnPermission("city") || hasColumnPermission("district")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("city") && <span>{item.dispatchedId?.confirmedId?.city}</span>}
                                                    {hasColumnPermission("city") && hasColumnPermission("district") && <br />}
                                                    {hasColumnPermission("district") && <span>{item.dispatchedId?.confirmedId?.district}</span>}
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* Group 8: State & Pin */}
                                        {(hasColumnPermission("state") || hasColumnPermission("pincode")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("state") && <span>{item.dispatchedId?.confirmedId?.state?.value}</span>}
                                                    {hasColumnPermission("state") && hasColumnPermission("pincode") && <br />}
                                                    {hasColumnPermission("pincode") && <span>{item.dispatchedId?.confirmedId?.pincode}</span>}
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
                            Showing {complainData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
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

export default ComplainPage