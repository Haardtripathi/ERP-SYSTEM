

"use client"

import { useState, useEffect, useCallback } from "react"
import { getAllConfirmed, updateAwbNumber, updateRowState } from "@/services/confirmedService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
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
import { Loader2, RefreshCcw } from "lucide-react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const safeExtractValue = (obj, defaultValue = '') => {
    if (!obj) return defaultValue
    if (typeof obj === 'string') return obj
    if (obj.value) return obj.value
    if (obj.dropdown_data) return obj.dropdown_data
    return defaultValue
}

const Table = ({ children }) => (
    <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">{children}</table>
    </div>
)

const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

const TableRow = ({ children, item }) => {
    const getRowBackgroundClass = () => {
        if (item?.isCancelled) return "bg-red-100 hover:bg-red-200"
        if (item?.isHold) return "bg-yellow-100 hover:bg-yellow-200"
        if (item?.awb_number && !item?.isDispatched) return "bg-blue-100 hover:bg-blue-200"
        if (item?.isDispatched) return "bg-green-100 hover:bg-green-200"
        return "hover:bg-gray-100"
    }

    return (
        <tr className={getRowBackgroundClass()}>
            {children}
        </tr>
    )
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

const ConfirmedPage = () => {
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

    const [editingAwb, setEditingAwb] = useState(null)
    const [newAwbNumber, setNewAwbNumber] = useState("")

    const [refreshing, setRefreshing] = useState(false)

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
        const results = confirmedData.filter((item) => {
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
    }, [confirmedData, searchTerm, searchColumn, itemsPerPage, currentPage])

    useEffect(() => {
        applyFiltersAndPaginate()
    }, [applyFiltersAndPaginate])

    const handleGoToPage = () => {
        const pageNumber = Number.parseInt(goToPage, 10)
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
            setGoToPage("")
        } else {
            toast.error(`Please enter a valid page number between 1 and ${totalPages}`)
        }
    }

    const handleStateChange = async (id, ref, value) => {
        try {
            // If the current state is already cancelled, do nothing
            const currentItem = confirmedData.find(item => item._id === id)
            if (currentItem.isCancelled) return

            // Determine the update payload based on the selected value
            let updatePayload = {}
            switch (value) {
                case 'Hold':
                    updatePayload = { isHold: true, isCancelled: false }
                    break
                case 'Cancel':
                    updatePayload = { isCancelled: true, isHold: false }
                    break
                case 'Normal':
                    updatePayload = { isHold: false, isCancelled: false }
                    break
                default:
                    return
            }

            await updateRowState(id, ref, updatePayload)
            toast.success(`Row state updated to ${value}`)
            fetchData() // Refresh the data to reflect the changes
        } catch (error) {
            console.error(`Error updating row state to ${value}:`, error)
            toast.error("Failed to update row state")
        }
    }

    const handleEditAwb = (id, currentAwb) => {
        // Prevent editing AWB if the row is cancelled or on hold
        const currentItem = confirmedData.find(item => item._id === id)
        if (currentItem.isCancelled || currentItem.isHold) return

        setEditingAwb(id)
        setNewAwbNumber(currentAwb || "")
    }
    const handleAddAwb = async (id, ref) => {
        // Prevent adding AWB if the row is cancelled or on hold
        const currentItem = confirmedData.find(item => item._id === id)
        if (currentItem.isCancelled || currentItem.isHold) return

        try {
            await updateAwbNumber(id, ref, newAwbNumber)
            toast.success("AWB Number updated successfully")
            setEditingAwb(null)
            fetchData() // Refresh the data
        } catch (error) {
            console.error("Error updating AWB Number:", error)
            toast.error("Failed to update AWB Number")
        }
    }

    const renderStateColumn = (item) => {
        if (item.isCancelled) {
            return <span className="text-red-600 font-semibold">Cancelled</span>
        }

        if (item.isHold) {
            return (
                <Select
                    onValueChange={(value) => handleStateChange(item._id, item.ref, value)}
                >
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="On Hold">
                            Normal
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Cancel">Cancel</SelectItem>
                    </SelectContent>
                </Select>
            )
        }

        return (
            <Select
                onValueChange={(value) => handleStateChange(item._id, item.ref, value)} disabled={item.isDispatched}
            >
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select State">
                        Select State
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Hold">Hold</SelectItem>
                    <SelectItem value="Cancel">Cancel</SelectItem>
                </SelectContent>
            </Select>
        )
    }

    const renderAwbNumberColumn = (item) => {
        // If row is cancelled, show AWB as read-only
        if (item.isCancelled) {
            return <span className="text-sm text-gray-500">{item.awb_number || "N/A"}</span>
        }

        // If row is on hold, limit AWB editing
        if (item.isHold) {
            return (
                <div className="flex items-center justify-between">
                    <span className="text-sm">{item.awb_number || "N/A"}</span>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="px-2 py-1 text-xs"
                        disabled
                    >
                        Edit
                    </Button>
                </div>
            )
        }

        // Normal state with full editing capabilities
        return editingAwb === item._id ? (
            <div className="flex items-center space-x-1">
                <Input
                    type="text"
                    value={newAwbNumber}
                    onChange={(e) => setNewAwbNumber(e.target.value)}
                    className="w-28 h-8 text-sm"
                />
                <Button
                    size="sm"
                    variant="outline"
                    className="px-2 py-1 text-xs"
                    onClick={() => handleAddAwb(item._id, item.ref)}
                >
                    Save
                </Button>
            </div>
        ) : (
            <div className="flex items-center justify-between">
                <span className="text-sm">{item.awb_number || "N/A"}</span>
                <Button
                    size="sm"
                    variant="ghost"
                    className="px-2 py-1 text-xs"
                    onClick={() => handleEditAwb(item._id, item.awb_number)}
                >
                    Edit
                </Button>
            </div>
        )
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

    const startIndex = (currentPage - 1) * itemsPerPage

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
                <h1 className="text-3xl font-semibold text-gray-800">Confirmed Page</h1>

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
                {/* Header Section */}
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-3xl font-bold">Confirmed Page</CardTitle>

                    {/* Right Side Controls */}
                    <div className="flex items-center space-x-4">
                        {/* Refresh Label */}
                        {/* <span className="text-l font-semibold">Refresh:</span>x` */}

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
                                <SelectItem value="data">Data</SelectItem>
                                <SelectItem value="source">Source</SelectItem>
                                <SelectItem value="cm_first_name">First Name</SelectItem>
                                <SelectItem value="cm_last_name">Last Name</SelectItem>
                                <SelectItem value="cm_phone">Phone</SelectItem>
                                <SelectItem value="agent_name">Agent</SelectItem>
                                <SelectItem value="language">Language</SelectItem>
                                <SelectItem value="disease">Disease</SelectItem>
                                <SelectItem value="state">State</SelectItem>
                                <SelectItem value="city">City</SelectItem>
                                <SelectItem value="remark">Remark</SelectItem>
                                <SelectItem value="comment">Comment</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
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


            </Card>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="max-w-full">
                    <Table>
                        <TableHeader>
                            <tr className="bg-gray-200">
                                <TableHead>ACTION</TableHead>
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
                                <TableHead>AWB Number</TableHead>

                                <TableHead>Comment</TableHead>
                                <TableHead>Shipment Type</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Post Type</TableHead>
                                <TableHead>Post</TableHead>

                                <TableHead>District</TableHead>
                                <TableHead>City/Town/Village</TableHead>
                                <TableHead>Pincode</TableHead>

                                <TableHead>State</TableHead>

                                <TableHead>Disease</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Products</TableHead>
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item, index) => {
                                return (
                                    <TableRow key={item._id} item={item}>
                                        <TableCell>
                                            {renderStateColumn(item)}
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
                                        <TableCell>
                                            {renderAwbNumberColumn(item)}
                                        </TableCell>
                                        <TableCell>{item.comment}</TableCell>
                                        <TableCell>{item.shipment_type?.value}</TableCell>
                                        <TableCell>{item.address}</TableCell>
                                        <TableCell>{item.post_type?.value}</TableCell>
                                        <TableCell>{item.post}</TableCell>
                                        <TableCell>{item.district}</TableCell>
                                        <TableCell>{item.city}</TableCell>
                                        <TableCell>{item.pincode}</TableCell>

                                        <TableCell>{item.state?.value}</TableCell>

                                        <TableCell>{item.disease?.value}</TableCell>
                                        <TableCell>{item.amount?.value}</TableCell>
                                        <TableCell>
                                            {Array.isArray(item.products?.value)
                                                ? item.products.value.map((product, index) => (
                                                    <div key={index}>
                                                        {product.product} : {product.quantity}
                                                    </div>
                                                ))
                                                : null}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
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

export default ConfirmedPage

