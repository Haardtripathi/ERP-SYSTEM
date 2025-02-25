


"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { getAllReturn, returnDataFunction } from "@/services/returnService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"
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


const Table = ({ children }) => (
    <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">{children}</table>
    </div>
)

const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

const TableRow = ({ children, item }) => {
    const getRowBackgroundClass = () => {
        return "bg-orange-100  hover:bg-orange-100"
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


const ReturnPage = () => {
    const [returnData, setReturnData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [paginatedData, setPaginatedData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [searchColumn, setSearchColumn] = useState("all")
    const [sortBy, setSortBy] = useState("return_date") // Default sorting by Return Date
    const [refreshing, setRefreshing] = useState(false)

    const [returnManualInput, setReturnManualInput] = useState("")
    const [isReturnScanning, setIsReturnScanning] = useState(false)
    const [returnScanInput, setReturnScanInput] = useState("")
    const returnScanInputRef = useRef(null)


    const fetchData = useCallback(async () => {
        try {
            const response = await getAllReturn()
            if (response.data?.returnData) {
                const validData = Array.isArray(response.data.returnData) ? response.data.returnData : [response.data.returnData]
                setReturnData(validData)
                setFilteredData(validData)
                setTotalPages(Math.ceil(validData.length / itemsPerPage))
            } else {
                setReturnData([])
                setFilteredData([])
                setTotalPages(0)
            }
        } catch (error) {
            console.error("Error fetching return data:", error)
            setError(error.message || "Failed to fetch data.")
        } finally {
            setIsLoading(false)
        }
    }, [itemsPerPage])

    useEffect(() => {
        fetchData()
    }, [fetchData])



    const refreshData = async () => {
        setRefreshing(true)
        await fetchData()
        setRefreshing(false)
        toast.success("Data refreshed successfully")
    }

    const handleReturnManualInputChange = (e) => {
        if (!isReturnScanning) {
            const cleanedInput = e.target.value.replace(/[^a-zA-Z0-9]/g, "")
            setReturnManualInput(cleanedInput)
        }
    }

    const handleReturnManualSend = async () => {
        if (!returnManualInput) {
            toast.error("Please enter a value")
            return
        }
        try {
            await handleReturnAction(returnManualInput)
            setReturnManualInput("")
        } catch (error) {
            console.error("Error processing manual return input:", error)
            toast.error("Couldn't find required item")
            setReturnManualInput("")
        }
    }

    const handleReturnScanInput = async (e) => {
        const value = e.target.value
        setReturnScanInput(value)

        if (isReturnScanning && value) {
            try {
                await handleReturnAction(value)
                setReturnScanInput("")
                setTimeout(() => {
                    returnScanInputRef.current?.focus()
                }, 100)
            } catch (error) {
                console.error("Error processing scanned return input:", error)
                // toast.error("Couldn't find required item")
                setReturnScanInput("")
                setTimeout(() => {
                    returnScanInputRef.current?.focus()
                }, 100)
            }
        }
    }

    const toggleReturnScanning = () => {
        setIsReturnScanning(!isReturnScanning)
        if (!isReturnScanning) {
            setTimeout(() => {
                returnScanInputRef.current?.focus()
            }, 100)
        }
    }

    const handleReturnAction = async (value) => {
        try {
            const response = await returnDataFunction(value)
            toast.success("Return action completed successfully")
            await fetchData()
        } catch (error) {
            throw error
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

    const applyFiltersAndPaginate = useCallback(() => {
        if (!Array.isArray(returnData) || returnData.length === 0) {
            setPaginatedData([])
            setTotalPages(0)
            return
        }

        // Filtering logic (only keeping items with dispatchedId.confirmedId)
        let results = returnData.filter((item) => item?.dispatchedId?.confirmedId)

        // Search logic
        if (searchTerm) {
            results = results.filter((item) => {
                if (searchColumn === "all") {
                    return Object.values(item.dispatchedId.confirmedId || {})
                        .some(val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase()))
                } else {
                    const value = item.dispatchedId.confirmedId?.[searchColumn]
                    return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                }
            })
        }

        // Sorting logic based on selected option
        results.sort((a, b) => {
            const dateA = sortBy === "return_date" ? new Date(a.date) : new Date(a.dispatchedId?.date || 0)
            const dateB = sortBy === "return_date" ? new Date(b.date) : new Date(b.dispatchedId?.date || 0)
            return dateB - dateA // New → Old sorting
        })


        setFilteredData(results)
        const newTotalPages = Math.ceil(results.length / itemsPerPage)
        setTotalPages(newTotalPages)
        setCurrentPage((prev) => Math.min(prev, newTotalPages))

        const startIndex = (currentPage - 1) * itemsPerPage
        setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
    }, [returnData, searchTerm, searchColumn, itemsPerPage, currentPage, sortBy])

    useEffect(() => {
        applyFiltersAndPaginate()
    }, [applyFiltersAndPaginate])

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>
    }

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen max-w-full">
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-3xl font-bold">Return Data</CardTitle>
                    <div className="flex items-center space-x-4">
                        {/* Sorting Dropdown */}

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
                        {/* Search Input */}
                        <Select onValueChange={handleColumnSelect} defaultValue="all">
                            <SelectTrigger className="w-[200px]">
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
                                <SelectItem value="district">District</SelectItem>
                                <SelectItem value="city">City/Town/Village</SelectItem>
                                <SelectItem value="pincode">Pincode</SelectItem>
                                <SelectItem value="state">State</SelectItem>
                                <SelectItem value="disease">Disease</SelectItem>
                                <SelectItem value="amount">Amount</SelectItem>
                                <SelectItem value="products">Products</SelectItem>
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

                <CardContent>

                    <div className="flex flex-wrap gap-10">
                        {/* Manual Code Entry */}
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                value={returnManualInput}
                                onChange={handleReturnManualInputChange}
                                placeholder="Enter return code manually..."
                                className="h-9 w-[300px]"
                                disabled={isReturnScanning}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && returnManualInput) {
                                        handleReturnManualSend();
                                    }
                                }}
                            />
                            <Button onClick={handleReturnManualSend} disabled={isReturnScanning} size="sm" className="h-9">
                                Send
                            </Button>
                        </div>

                        {/* Barcode Scanning */}
                        <div className="flex items-center gap-2">
                            <Input
                                ref={returnScanInputRef}
                                type="text"
                                value={returnScanInput}
                                onChange={handleReturnScanInput}
                                placeholder="Scan barcode..."
                                className="h-9 w-[300px]"
                                disabled={!isReturnScanning}
                            />
                            <Button
                                onClick={toggleReturnScanning}
                                variant={isReturnScanning ? "destructive" : "default"}
                                size="sm"
                                className="h-9 w-[120px]"
                            >
                                {isReturnScanning ? (
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

                        <div className="flex items-center gap-2">
                            <span>Sort By:</span>
                            <Select onValueChange={setSortBy} defaultValue="return_date">
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="return_date">Return Date (New → Old)</SelectItem>
                                    <SelectItem value="dispatch_date">Dispatch Date (New → Old)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>


                </CardContent>
            </Card>

            {/* Table Display */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="max-w-full">
                    <Table>
                        <TableHeader>
                            <tr className="bg-gray-200">
                                {/* Group 1: (Ref, AWB) */}
                                <TableHead>
                                    <div>
                                        <span>Ref</span>
                                        <br />
                                        <span>AWB</span>
                                    </div>
                                </TableHead>
                                {/* Group 2: (Date, Dispatch Date) */}
                                <TableHead>
                                    <div>
                                        <span>Date</span>
                                        <br />
                                        <span>Dispatch Date</span>
                                    </div>
                                </TableHead>
                                {/* Group 3: (Sale Type, Payment Type) */}
                                <TableHead>
                                    <div>
                                        <span>Sale Type</span>
                                        <br />
                                        <span>Payment Type</span>
                                    </div>
                                </TableHead>
                                {/* Group 4: (Agent Name, First & Last Name) */}
                                <TableHead>
                                    <div>
                                        <span>Agent Name</span>
                                        <br />
                                        <span>Name</span>
                                    </div>
                                </TableHead>
                                {/* Group 5: (Phone, Alternate Phone) */}
                                <TableHead>
                                    <div>
                                        <span>Phone</span>
                                        <br />
                                        <span>Alternate Phone</span>
                                    </div>
                                </TableHead>
                                {/* Group 6: (Address, City & District) */}
                                <TableHead>
                                    <div>
                                        <span>Address</span>
                                        <br />
                                        <span>City, District</span>
                                    </div>
                                </TableHead>
                                {/* Group 7: (State, Pincode) */}
                                <TableHead>
                                    <div>
                                        <span>State</span>
                                        <br />
                                        <span>Pincode</span>
                                    </div>
                                </TableHead>
                                {/* Group 8: (Amount, Products) */}
                                <TableHead>
                                    <div>
                                        <span>Amount</span>
                                        <br />
                                        <span>Products</span>
                                    </div>
                                </TableHead>
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item) => (
                                <TableRow key={item._id} item={item}>
                                    {/* Group 1: Ref & AWB */}
                                    <TableCell>
                                        <div>
                                            <span>{item.dispatchedId.confirmedId?.ref}</span>
                                            <br />
                                            <span>{item.dispatchedId.confirmedId?.awb_number}</span>
                                        </div>
                                    </TableCell>
                                    {/* Group 2: Date & Dispatch Date */}
                                    <TableCell>
                                        <div>
                                            <span>{item.date}</span>
                                            <br />
                                            <span>{item.dispatchedId?.date}</span>
                                        </div>
                                    </TableCell>
                                    {/* Group 3: Sale Type & Payment Type */}
                                    <TableCell>
                                        <div>
                                            <span>{item.dispatchedId.confirmedId?.sale_type?.value}</span>
                                            <br />
                                            <span>{item.dispatchedId.confirmedId?.payment_type?.value}</span>
                                        </div>
                                    </TableCell>
                                    {/* Group 4: Agent Name & First+Last Name */}
                                    <TableCell>
                                        <div>
                                            <span>{item.dispatchedId.confirmedId?.agent_name?.value}</span>
                                            <br />
                                            <span>
                                                {item.dispatchedId.confirmedId?.cm_first_name}{" "}
                                                {item.dispatchedId.confirmedId?.cm_last_name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    {/* Group 5: Phone & Alternate Phone */}
                                    <TableCell>
                                        <div>
                                            <span>{item.dispatchedId.confirmedId?.cm_phone}</span>
                                            <br />
                                            <span>{item.dispatchedId.confirmedId?.alternate_phone}</span>
                                        </div>
                                    </TableCell>
                                    {/* Group 6: Address, City & District */}
                                    <TableCell>
                                        <div>
                                            <span>{item.dispatchedId.confirmedId?.address}</span>
                                            <br />
                                            <span>
                                                {item.dispatchedId.confirmedId?.city}, {item.dispatchedId.confirmedId?.district}
                                            </span>
                                        </div>
                                    </TableCell>
                                    {/* Group 7: State & Pincode */}
                                    <TableCell>
                                        <div>
                                            <span>{item.dispatchedId.confirmedId?.state?.value}</span>
                                            <br />
                                            <span>{item.dispatchedId.confirmedId?.pincode}</span>
                                        </div>
                                    </TableCell>
                                    {/* Group 8: Amount & Products */}
                                    <TableCell>
                                        <div>
                                            <span>{item.dispatchedId.confirmedId?.amount?.value}</span>
                                            <br />
                                            <span>
                                                {Array.isArray(item.dispatchedId.confirmedId?.products?.value) &&
                                                    item.dispatchedId.confirmedId.products.value.length > 0
                                                    ? item.dispatchedId.confirmedId.products.value.map((product, index) => (
                                                        <div key={index}>
                                                            {product.product} : {product.quantity}
                                                        </div>
                                                    ))
                                                    : "No Products"}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <Pagination className="mt-4 flex justify-center">
                <PaginationContent>
                    <PaginationItem><PaginationPrevious onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} /></PaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                        <PaginationItem key={index}><PaginationLink onClick={() => setCurrentPage(index + 1)} isActive={currentPage === index + 1}>{index + 1}</PaginationLink></PaginationItem>
                    ))}
                    <PaginationItem><PaginationNext onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} /></PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

export default ReturnPage










// "use client"
// import { useState, useEffect, useCallback, useRef } from "react"

// import { getAllReturn, returnDataFunction } from "@/services/returnService"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
// import { Loader2, Scan, RefreshCcw } from "lucide-react"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"



// const Table = ({ children }) => (
//     <div className="overflow-x-auto">
//         <table className="w-full border-collapse min-w-max">{children}</table>
//     </div>
// )

// const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

// const TableRow = ({ children, item }) => {
//     const getRowBackgroundClass = () => {
//         return "bg-orange-100  hover:bg-orange-100"
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

// const ReturnPage = () => {
//     const [returnData, setReturnData] = useState([])
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

//     const [returnManualInput, setReturnManualInput] = useState("")
//     const [isReturnScanning, setIsReturnScanning] = useState(false)
//     const [returnScanInput, setReturnScanInput] = useState("")
//     const returnScanInputRef = useRef(null)
//     const [refreshing, setRefreshing] = useState(false)





//     const fetchData = useCallback(async () => {
//         try {
//             const response = await getAllReturn()
//             // Ensure we have a valid array of data
//             if (response.data?.returnData) {
//                 const validData = Array.isArray(response.data.returnData) ? response.data.returnData : [response.data.returnData]
//                 setReturnData(validData)
//                 setFilteredData(validData)
//                 setTotalPages(Math.ceil(validData.length / itemsPerPage))
//             } else {
//                 setReturnData([])
//                 setFilteredData([])
//                 setTotalPages(0)
//             }
//         } catch (error) {
//             console.error("Error fetching dispatch data:", error)
//             setError(error.message || "Failed to fetch data. Please try again later.")
//             setReturnData([])
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
//         if (!Array.isArray(returnData) || returnData.length === 0) {
//             setPaginatedData([])
//             setTotalPages(0)
//             return
//         }

//         const results = returnData.filter((item) => {
//             if (!item?.dispatchedId?.confirmedId) return false

//             if (searchColumn === "all") {
//                 const searchableValues = {
//                     ref: item.dispatchedId.confirmedId.ref,
//                     date: item.date,
//                     time: item.time,
//                     source: item.dispatchedId.confirmedId.source?.value,
//                     payment_type: item.dispatchedId.confirmedId.payment_type?.value,
//                     sale_type: item.dispatchedId.confirmedId.sale_type?.value,
//                     agent_name: item.dispatchedId.confirmedId.agent_name?.value,
//                     cm_first_name: item.dispatchedId.confirmedId.cm_first_name,
//                     cm_last_name: item.dispatchedId.confirmedId.cm_last_name,
//                     cm_phone: item.dispatchedId.confirmedId.cm_phone?.toString(),
//                     alternate_phone: item.dispatchedId.confirmedId.alternate_phone?.toString(),
//                     email: item.dispatchedId.confirmedId.email,
//                 }

//                 return Object.values(searchableValues).some(
//                     (val) => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase()),
//                 )
//             } else {
//                 const value = item.dispatchedId.confirmedId[searchColumn]
//                 if (typeof value === "object" && value?.value) {
//                     return value.value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//                 } else if (value) {
//                     return value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//                 }
//                 return false
//             }
//         })

//         if (results.length === 0) {
//             setPaginatedData([])
//             setTotalPages(0)
//             return
//         }

//         setFilteredData(results)
//         const newTotalPages = Math.ceil(results.length / itemsPerPage)
//         setTotalPages(newTotalPages)
//         setCurrentPage((prev) => Math.min(prev, newTotalPages))

//         const startIndex = (currentPage - 1) * itemsPerPage
//         setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
//     }, [returnData, searchTerm, searchColumn, itemsPerPage, currentPage])

//     useEffect(() => {
//         applyFiltersAndPaginate()
//     }, [applyFiltersAndPaginate])

//     const handleReturnManualInputChange = (e) => {
//         if (!isReturnScanning) {
//             const cleanedInput = e.target.value.replace(/[^a-zA-Z0-9]/g, "")
//             setReturnManualInput(cleanedInput)
//         }
//     }

//     const handleReturnManualSend = async () => {
//         if (!returnManualInput) {
//             toast.error("Please enter a value")
//             return
//         }
//         try {
//             await handleReturnAction(returnManualInput)
//             setReturnManualInput("")
//         } catch (error) {
//             console.error("Error processing manual return input:", error)
//             toast.error("Couldn't find required item")
//             setReturnManualInput("")
//         }
//     }

//     const handleReturnScanInput = async (e) => {
//         const value = e.target.value
//         setReturnScanInput(value)

//         if (isReturnScanning && value) {
//             try {
//                 await handleReturnAction(value)
//                 setReturnScanInput("")
//                 setTimeout(() => {
//                     returnScanInputRef.current?.focus()
//                 }, 100)
//             } catch (error) {
//                 console.error("Error processing scanned return input:", error)
//                 // toast.error("Couldn't find required item")
//                 setReturnScanInput("")
//                 setTimeout(() => {
//                     returnScanInputRef.current?.focus()
//                 }, 100)
//             }
//         }
//     }

//     const toggleReturnScanning = () => {
//         setIsReturnScanning(!isReturnScanning)
//         if (!isReturnScanning) {
//             setTimeout(() => {
//                 returnScanInputRef.current?.focus()
//             }, 100)
//         }
//     }

//     const handleReturnAction = async (value) => {
//         try {
//             const response = await returnDataFunction(value)
//             toast.success("Return action completed successfully")
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
//                     <CardTitle className="text-3xl font-bold">Return Data</CardTitle>
//                     <div className="flex items-center space-x-4">
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
//                                 value={returnManualInput}
//                                 onChange={handleReturnManualInputChange}
//                                 placeholder="Enter return code manually..."
//                                 className="h-9 w-[300px]"
//                                 disabled={isReturnScanning}
//                                 onKeyDown={(e) => {
//                                     if (e.key === "Enter" && returnManualInput) {
//                                         handleReturnManualSend();
//                                     }
//                                 }}
//                             />
//                             <Button onClick={handleReturnManualSend} disabled={isReturnScanning} size="sm" className="h-9">
//                                 Send
//                             </Button>
//                         </div>

//                         {/* Barcode Scanning */}
//                         <div className="flex items-center gap-2">
//                             <Input
//                                 ref={returnScanInputRef}
//                                 type="text"
//                                 value={returnScanInput}
//                                 onChange={handleReturnScanInput}
//                                 placeholder="Scan barcode..."
//                                 className="h-9 w-[300px]"
//                                 disabled={!isReturnScanning}
//                             />
//                             <Button
//                                 onClick={toggleReturnScanning}
//                                 variant={isReturnScanning ? "destructive" : "default"}
//                                 size="sm"
//                                 className="h-9 w-[120px]"
//                             >
//                                 {isReturnScanning ? (
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
//                                 <TableHead>Ref</TableHead>
//                                 <TableHead>Date</TableHead>
//                                 <TableHead>Dispatch Date</TableHead>

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
//                             </tr>
//                         </TableHeader>
//                         <TableBody>
//                             {paginatedData.map((item) => {
//                                 return (
//                                     <TableRow key={item._id} item={item}>
//                                         <TableCell>{item.dispatchedId.confirmedId?.ref}</TableCell>
//                                         <TableCell>{item.date}</TableCell>
//                                         <TableCell>{item.dispatchedId?.date}</TableCell>

//                                         <TableCell>{item.time}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.source?.value}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.payment_type?.value}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.sale_type?.value}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.agent_name?.value}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.cm_first_name}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.cm_last_name}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.cm_phone}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.alternate_phone}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.email}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.comment}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.shipment_type?.value}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.address}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.post_type?.value}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.post}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.district}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.city}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.pincode}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.state?.value}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.disease?.value}</TableCell>
//                                         <TableCell>{item.dispatchedId.confirmedId?.amount?.value}</TableCell>
//                                         <TableCell>
//                                             {Array.isArray(item.dispatchedId.confirmedId?.products?.value) &&
//                                                 item.dispatchedId.confirmedId.products.value.length > 0
//                                                 ? item.dispatchedId.confirmedId.products.value.map((product, index) => (
//                                                     <div key={index}>
//                                                         {product.product} : {product.quantity}
//                                                     </div>
//                                                 ))
//                                                 : "No Products"}
//                                         </TableCell>
//                                     </TableRow>
//                                 )
//                             })}
//                         </TableBody>
//                     </Table>
//                 </div>
//             </div> */}
//             <div className="bg-white shadow-md rounded-lg overflow-hidden">
//                 <div className="max-w-full">
//                     <Table>
//                         <TableHeader>
//                             <tr className="bg-gray-200">
//                                 {/* Group 1: (Ref, AWB) */}
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

// export default ReturnPage

