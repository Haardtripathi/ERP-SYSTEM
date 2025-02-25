

"use client"
import { useState, useEffect, useCallback, useRef } from "react"

import { delivered } from "@/services/deliveredService"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Loader2, Scan, RefreshCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PaymentDialog from "@/components/section5/PaymentDialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const Table = ({ children }) => (
    <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">{children}</table>
    </div>
)

const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

const TableRow = ({ children, item }) => {
    const getRowBackgroundClass = () => {
        return "bg-purple-100 hover:bg-purple-200"
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

const DeliveredPage = () => {
    const [deliveredData, setDeliveredData] = useState([])
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
    const [sortBy, setSortBy] = useState("delivered_date") // Default sorting by Return Date


    const [returnManualInput, setReturnManualInput] = useState("")
    const [isReturnScanning, setIsReturnScanning] = useState(false)
    const [returnScanInput, setReturnScanInput] = useState("")
    const returnScanInputRef = useRef(null)

    const [refreshing, setRefreshing] = useState(false)



    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await delivered()
            // Ensure we have a valid array of data
            if (response.data?.deliveredData) {
                const validData = Array.isArray(response.data.deliveredData) ? response.data.deliveredData : [response.data.deliveredData]
                setDeliveredData(validData)
                setFilteredData(validData)
                setTotalPages(Math.ceil(validData.length / itemsPerPage))
            } else {
                setDeliveredData([])
                setFilteredData([])
                setTotalPages(0)
            }
        } catch (error) {
            console.error("Error fetching dispatch data:", error)
            setError(error.message || "Failed to fetch data. Please try again later.")
            setDeliveredData([])
            setFilteredData([])
            setTotalPages(0)
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


    const applyFiltersAndPaginate = useCallback(() => {
        if (!Array.isArray(deliveredData) || deliveredData.length === 0) {
            setPaginatedData([])
            setTotalPages(0)
            return
        }

        const results = deliveredData.filter((item) => {
            if (!item?.dispatchedId?.confirmedId) return false

            if (searchColumn === "all") {
                const searchableValues = {
                    ref: item.dispatchedId.confirmedId.ref,
                    date: item.date,
                    time: item.time,
                    source: item.dispatchedId.confirmedId.source?.value,
                    payment_type: item.dispatchedId.confirmedId.payment_type?.value,
                    sale_type: item.dispatchedId.confirmedId.sale_type?.value,
                    agent_name: item.dispatchedId.confirmedId.agent_name?.value,
                    cm_first_name: item.dispatchedId.confirmedId.cm_first_name,
                    cm_last_name: item.dispatchedId.confirmedId.cm_last_name,
                    cm_phone: item.dispatchedId.confirmedId.cm_phone?.toString(),
                    alternate_phone: item.dispatchedId.confirmedId.alternate_phone?.toString(),
                    email: item.dispatchedId.confirmedId.email,
                }

                return Object.values(searchableValues).some(
                    (val) => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase()),
                )
            } else {
                const value = item.dispatchedId.confirmedId[searchColumn]
                if (typeof value === "object" && value?.value) {
                    return value.value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                } else if (value) {
                    return value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                }
                return false
            }
        })

        if (results.length === 0) {
            setPaginatedData([])
            setTotalPages(0)
            return
        }

        results.sort((a, b) => {
            const dateA = sortBy === "delivered_date" ? new Date(a.date) : new Date(a.dispatchedId?.date || 0)
            const dateB = sortBy === "delivered_date" ? new Date(b.date) : new Date(b.dispatchedId?.date || 0)
            return dateB - dateA // New → Old sorting
        })

        setFilteredData(results)
        const newTotalPages = Math.ceil(results.length / itemsPerPage)
        setTotalPages(newTotalPages)
        setCurrentPage((prev) => Math.min(prev, newTotalPages))

        const startIndex = (currentPage - 1) * itemsPerPage
        setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
    }, [deliveredData, searchTerm, searchColumn, itemsPerPage, currentPage])

    useEffect(() => {
        applyFiltersAndPaginate()
    }, [applyFiltersAndPaginate])

    const handleReturnManualInputChange = (e) => {
        if (!isReturnScanning) {
            const cleanedInput = e.target.value.replace(/[^a-zA-Z0-9]/g, "")
            setReturnManualInput(cleanedInput)
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

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
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
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen max-w-full">
            {/* <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-semibold text-gray-800">Delivered Page</h1>

                <div className="flex items-center space-x-2">
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
            </div>


            <div className="mb-4 flex justify-between items-center">
                <div className="flex space-x-2">
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


                </div>

            </div> */}
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-3xl font-bold">Delivered Page</CardTitle>
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
                    <div className="flex items-center gap-2">
                        <span>Sort By:</span>
                        <Select onValueChange={setSortBy} defaultValue="delivered_date">
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="delivered_date">Delivered Date (New → Old)</SelectItem>
                                <SelectItem value="dispatch_date">Dispatch Date (New → Old)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>

            </Card>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="max-w-full">
                    <Table>
                        <TableHeader>
                            <tr className="bg-gray-200">
                                {/* Group 1: (Ref, AWB) */}
                                <TableHead>
                                    <div>
                                        <span>Payment</span>

                                    </div>
                                </TableHead>

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
                                        <span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`px-3 py-1 text-sm transition-all ${item.payment_received ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
                                                    }`}
                                                disabled={item.payment_received}
                                            >
                                                {item.payment_received ? "Paid" : "Add Now"}
                                                {!item.payment_received && (
                                                    <PaymentDialog referenceId={item.dispatchedId?.confirmedId?.ref} dispatchedId={item.dispatchedId?._id} />
                                                )}
                                            </Button>
                                        </span>
                                    </TableCell>
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
                />
                <Button onClick={handleGoToPage} disabled={!goToPage}>
                    Go
                </Button>
            </div>
        </div>
    )
}

export default DeliveredPage

