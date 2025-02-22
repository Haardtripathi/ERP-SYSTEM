


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
import { Loader2, RefreshCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-hot-toast"
import { Edit2, Check, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

    const [editingId, setEditingId] = useState(null)
    const [editValue, setEditValue] = useState("")

    const [refreshing, setRefreshing] = useState(false)


    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await getAllComplain()
            if (response.data?.complainData) {
                const validData = Array.isArray(response.data.complainData) ? response.data.complainData : [response.data.complainData]
                setComplainData(validData)
                setFilteredData(validData)
                setTotalPages(Math.ceil(validData.length / itemsPerPage))
            } else {
                setComplainData([])
                setFilteredData([])
                setTotalPages(0)
            }
        } catch (error) {
            console.error("Error fetching complain data:", error)
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
        const results = complainData.filter((item) => {
            if (searchColumn === "all") {
                return Object.values(item).some(
                    (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()),
                )
            } else {
                const value = item[searchColumn]
                return typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
            }
        })
        setFilteredData(results)
        const newTotalPages = Math.ceil(results.length / itemsPerPage)
        setTotalPages(newTotalPages)

        const startIndex = (currentPage - 1) * itemsPerPage
        setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
    }, [complainData, searchTerm, searchColumn, itemsPerPage, currentPage])

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

    const handleEdit = (id, currentValue) => {
        if (!currentValue) { // Only allow editing if complain_id is empty
            setEditingId(id)
            setEditValue("")
        }
    }

    const handleSave = async (id) => {
        try {
            if (!editValue.trim()) {
                toast.error("Complain ID cannot be empty")
                return
            }
            await editComplainId({ id, editValue })
            toast.success("Complain ID updated successfully")

            // Update local state
            const updatedData = complainData.map(item =>
                item._id === id ? { ...item, complain_id: editValue } : item
            )
            setComplainData(updatedData)
            setFilteredData(updatedData)

            // Reset editing state
            setEditingId(null)
            setEditValue("")

            // Refresh the current page
            applyFiltersAndPaginate()
        } catch (error) {
            console.error("Error updating complain ID:", error)
            toast.error("Failed to update Complain ID")
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditValue("")
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
                <h1 className="text-3xl font-semibold text-gray-800">Complain Page</h1>

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

            </Card>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="max-w-full">
                    <Table>
                        <TableHeader>
                            <tr className="bg-gray-200">
                                <TableHead>Date</TableHead>
                                <TableHead>Complain ID</TableHead>
                                <TableHead>Complain Detail</TableHead>
                                <TableHead>Complain Comment</TableHead>
                                <TableHead>Ref</TableHead>
                                <TableHead>AWB Number</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Number</TableHead>
                                <TableHead>Address</TableHead>
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>
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
                                                    {!item.complain_id && (
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
                                    </TableCell>
                                    <TableCell>{item.complain_detail}</TableCell>
                                    <TableCell>{item.complain_comment}</TableCell>
                                    <TableCell>{item.dispatchedId?.confirmedId?.ref}</TableCell>
                                    <TableCell>{item.dispatchedId?.confirmedId?.awb_number}</TableCell>
                                    <TableCell>{`${item.dispatchedId?.confirmedId?.cm_first_name} ${item.dispatchedId?.confirmedId?.cm_last_name}`}</TableCell>
                                    <TableCell>{item.dispatchedId?.confirmedId?.cm_phone}</TableCell>
                                    <TableCell>{item.dispatchedId?.confirmedId?.address}</TableCell>
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

export default ComplainPage

