"use client"

import { useState, useEffect } from "react"
import { getAllLead, deleteLead, sendLeadToPending } from "@/services/leadService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { RotateCw, RefreshCcw } from "lucide-react"
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
import { Loader2, Trash2, SendHorizontal } from "lucide-react"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

const LeadPage = () => {
    const [leadData, setLeadData] = useState([])
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
    const [debugInfo, setDebugInfo] = useState({})

    const { permissions, loading } = useAccessControl("/leads")
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
        if (!permissions.page || permissions.page !== "/leads") {
            navigate("/dashboard") // Redirect if no access to this page
            return
        }

        // Store column permissions for later use
        if (permissions.columns && Array.isArray(permissions.columns)) {
            setColumnPermissions(permissions.columns)
            // console.log("Column permissions set:", permissions.columns)
        } else {
            console.error("Invalid column permissions format:", permissions.columns)
            setColumnPermissions([])
        }
    }, [permissions, loading, navigate])

    const hasColumnPermission = (columnName) => {
        if (!columnPermissions || !Array.isArray(columnPermissions) || columnPermissions.length === 0) {
            // console.log(`Permission check for ${columnName}: false (no permissions)`)
            return false
        }

        const hasPermission = columnPermissions.includes(columnName)
        // console.log(`Permission check for ${columnName}: ${hasPermission}`)
        return hasPermission
    }

    // Update the fetchData function to handle errors better and log the response
    const fetchData = async (
        page = currentPage,
        limit = itemsPerPage,
        search = searchTerm,
        column = searchColumn,
        status = filterStatus,
    ) => {
        try {
            setIsLoading(true)
            // console.log(
            //     `Fetching data for page ${page}, limit ${limit}, search "${search}", column "${column}", status "${status}"`,
            // )

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
            // console.log(`API call URL params: ${queryString}`)

            // Make the API call with the constructed query parameters
            const response = await getAllLead(queryString,)
            // console.log("API Response:", response)

            // Store debug info
            setDebugInfo({
                requestParams: {
                    page: pageNum,
                    limit: limitNum,
                    search,
                    column,
                    status,
                    queryString,
                },
                response: response.data,
            })

            if (response.data && response.data.data) {
                setLeadData(response.data.data)

                // Ensure totalCount is a number
                const count = Number.parseInt(response.data.totalCount, 10) || 0
                setTotalCount(count)

                // Calculate total pages based on count and limit
                const pages = Math.ceil(count / limitNum) || 1
                setTotalPages(pages)

                // Ensure current page is valid
                const responsePage = Number.parseInt(response.data.currentPage, 10) || pageNum
                setCurrentPage(responsePage > pages ? 1 : responsePage)

                // console.log(`Data loaded: ${response.data.data.length} items`)
                // console.log(`Total count: ${count}, Total pages: ${pages}, Current page: ${responsePage}`)
            } else {
                console.error("Invalid response format:", response)
                setLeadData([])
                setError("Invalid data format received from server")
            }
        } catch (error) {
            console.error("Error fetching lead data:", error)
            setError("Failed to fetch data. Please try again later.")
            setLeadData([])
        } finally {
            setIsLoading(false)
        }
    }

    // Initial data fetch when component mounts
    useEffect(() => {
        fetchData(1, itemsPerPage, searchTerm, searchColumn, filterStatus)
    }, []) // Empty dependency array for initial load only

    // Handle filter status changes
    useEffect(() => {
        if (filterStatus) {
            fetchData(1, itemsPerPage, searchTerm, searchColumn, filterStatus)
        }
    }, [filterStatus])

    // Handle search with debounce
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const timeout = setTimeout(() => {
            fetchData(1, itemsPerPage, searchTerm, searchColumn, filterStatus)
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
        await fetchData(currentPage, itemsPerPage, searchTerm, searchColumn, filterStatus)
        setRefreshing(false)
        toast.success("Data refreshed successfully")
    }

    const handleDelete = async (id) => {
        if (!permissions.canDelete) {
            toast.error("You don't have permission to delete leads")
            return
        }

        try {
            await deleteLead(id)
            toast.success("Data deleted successfully")
            // Refresh the current page after deletion
            fetchData(currentPage, itemsPerPage, searchTerm, searchColumn, filterStatus)
        } catch (error) {
            console.error("Error deleting item:", error)
            setError("Failed to delete item. Please try again.")
        }
    }

    const handleUpdateClick = async (id, is_sent_to_pending) => {
        if (!hasColumnPermission("update")) {
            toast.error("You don't have permission to update leads")
            return
        }

        if (is_sent_to_pending) {
            toast.error("Already sent to pending")
            navigate(`/lead`)
        }
        navigate(`/edit-lead-data/${id}`)
    }

    // Fixed pagination handler
    const handlePageChange = (page) => {
        // console.log(`Attempting to change to page ${page}, total pages: ${totalPages}`)
        if (page >= 1 && page <= totalPages) {
            fetchData(page, itemsPerPage, searchTerm, searchColumn, filterStatus)
        } else {
            console.warn(`Invalid page number: ${page}. Must be between 1 and ${totalPages}`)
        }
    }

    const handleSendToPending = async (id) => {
        if (!hasColumnPermission("is_sent_to_pending")) {
            toast.error("You don't have permission to send leads to pending")
            return
        }

        const item = leadData.find((item) => item._id === id)
        setSelectedItem(item)
        setIsReviewDialogOpen(true)
    }

    const validateForm = (formData) => {
        const isValid = true
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
        if (!hasColumnPermission("is_sent_to_pending")) {
            toast.error("You don't have permission to send leads to pending")
            return
        }

        if (selectedItem) {
            try {
                const isValid = validateForm(selectedItem)
                if (!isValid) {
                    return
                }
                await sendLeadToPending(selectedItem._id)
                toast.success("Lead sent to pending successfully")

                // Refresh the current page after sending to pending
                fetchData(currentPage, itemsPerPage, searchTerm, searchColumn, filterStatus)
                setIsReviewDialogOpen(false)
            } catch (error) {
                toast.error("Failed to send lead to pending")
                console.error(error)
            }
        }
    }

    // Fixed go to page handler
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
        // console.log(`Changing items per page to ${value}`)
        const newItemsPerPage = Number.parseInt(value, 10)
        setItemsPerPage(newItemsPerPage)
        // Reset to page 1 when changing items per page
        fetchData(1, newItemsPerPage, searchTerm, searchColumn, filterStatus)
    }

    if (isLoading && leadData.length === 0) {
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
        const maxVisiblePages = 3 // Only show 3 pages at a time
        const halfVisible = Math.floor(maxVisiblePages / 2)

        // Ensure totalPages is a number and at least 1
        const validTotalPages = Math.max(1, Number.parseInt(totalPages) || 1)

        // Ensure currentPage is valid
        const validCurrentPage = Math.min(Math.max(1, Number.parseInt(currentPage) || 1), validTotalPages)

        // console.log(`Rendering pagination: current page ${validCurrentPage}, total pages ${validTotalPages}`)

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

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen max-w-full">
            <Card className="mb-6">
                {/* Header Section */}
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-3xl font-bold">Lead Page</CardTitle>

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

            {isLoading && leadData.length > 0 && (
                <div className="flex justify-center my-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {hasColumnPermission("is_sent_to_pending") && <TableHead>Send</TableHead>}
                                {hasColumnPermission("source") && <TableHead>Source</TableHead>}
                                {(hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("cm_first_name") && <span>First Name</span>}
                                            {hasColumnPermission("cm_first_name") && hasColumnPermission("cm_last_name") && <br />}
                                            {hasColumnPermission("cm_last_name") && <span>Last Name</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {(hasColumnPermission("cm_phone") || hasColumnPermission("alternate_phone")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("cm_phone") && <span>Phone</span>}
                                            {hasColumnPermission("cm_phone") && hasColumnPermission("alternate_phone") && <br />}
                                            {hasColumnPermission("alternate_phone") && <span>Alternate Phone</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {hasColumnPermission("agent_name") && <TableHead>Agent</TableHead>}
                                {(hasColumnPermission("disease") || hasColumnPermission("language")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("disease") && <span>Disease</span>}
                                            {hasColumnPermission("disease") && hasColumnPermission("language") && <br />}
                                            {hasColumnPermission("language") && <span>Language</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {(hasColumnPermission("state") || hasColumnPermission("city")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("state") && <span>State</span>}
                                            {hasColumnPermission("state") && hasColumnPermission("city") && <br />}
                                            {hasColumnPermission("city") && <span>City/Town/Village</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {(hasColumnPermission("remark") || hasColumnPermission("comment")) && (
                                    <TableHead>
                                        <div>
                                            {hasColumnPermission("remark") && <span>Remark</span>}
                                            {hasColumnPermission("remark") && hasColumnPermission("comment") && <br />}
                                            {hasColumnPermission("comment") && <span>Comment</span>}
                                        </div>
                                    </TableHead>
                                )}
                                {hasColumnPermission("date") && (
                                    <TableHead>
                                        <div>
                                            <span>Date</span>
                                            <br />
                                            <span>Time</span>
                                        </div>
                                    </TableHead>
                                )}
                                {hasColumnPermission("update") && (
                                    <TableHead>Update</TableHead>

                                )}
                                {hasColumnPermission("delete") && (
                                    <TableHead>Actions</TableHead>

                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leadData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} className="text-center py-8">
                                        No data found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leadData.map((item, index) => (
                                    <TableRow
                                        key={item._id}
                                        className={item.is_sent_to_pending ? "bg-green-100" : index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                                    >
                                        {/* Send */}
                                        {hasColumnPermission("is_sent_to_pending") && (
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
                                        {hasColumnPermission("source") && <TableCell>{item.source?.value || ""}</TableCell>}
                                        {/* Name (First Name + Last Name) */}
                                        {(hasColumnPermission("cm_first_name") || hasColumnPermission("cm_last_name")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("cm_first_name") && (item.cm_first_name || "")}
                                                    {hasColumnPermission("cm_first_name") && hasColumnPermission("cm_last_name") && <br />}
                                                    {hasColumnPermission("cm_last_name") && (item.cm_last_name || "")}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Contact (Phone + Alternate Phone) */}
                                        {(hasColumnPermission("cm_phone") || hasColumnPermission("alternate_phone")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("cm_phone") && (item.cm_phone || "")}
                                                    {hasColumnPermission("cm_phone") && hasColumnPermission("alternate_phone") && <br />}
                                                    {hasColumnPermission("alternate_phone") && (item.alternate_phone || "")}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Agent */}
                                        {hasColumnPermission("agent_name") && <TableCell>{item.agent_name?.value || ""}</TableCell>}
                                        {/* Disease & Language */}
                                        {(hasColumnPermission("disease") || hasColumnPermission("language")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("disease") && (item.disease?.value || "")}
                                                    {hasColumnPermission("disease") && hasColumnPermission("language") && <br />}
                                                    {hasColumnPermission("language") && (item.language?.value || "")}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Location (State + City) */}
                                        {(hasColumnPermission("state") || hasColumnPermission("city")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("state") && (item.state?.value || "")}
                                                    {hasColumnPermission("state") && hasColumnPermission("city") && <br />}
                                                    {hasColumnPermission("city") && (item.city || "")}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Remark & Comment */}
                                        {(hasColumnPermission("remark") || hasColumnPermission("comment")) && (
                                            <TableCell>
                                                <div>
                                                    {hasColumnPermission("remark") && (item.remark?.value || "")}
                                                    {hasColumnPermission("remark") && hasColumnPermission("comment") && <br />}
                                                    {hasColumnPermission("comment") && (item.comment || "")}
                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Date & Time */}
                                        {hasColumnPermission("date") && (
                                            <TableCell>
                                                <div>
                                                    {item.date || ""}

                                                </div>
                                            </TableCell>
                                        )}
                                        {/* Update */}
                                        {hasColumnPermission("update") && (
                                            <TableCell>
                                                <RotateCw
                                                    size={20}
                                                    color="#007BFF"
                                                    strokeWidth={2}
                                                    style={{
                                                        cursor: item.is_sent_to_pending ? "not-allowed" : "pointer",
                                                        transition: "transform 0.2s ease",
                                                        opacity: item.is_sent_to_pending ? 0.5 : 1,
                                                    }}
                                                    onClick={() =>
                                                        !item.is_sent_to_pending &&
                                                        handleUpdateClick(item._id, item.is_sent_to_pending)
                                                    }
                                                    onMouseOver={(e) =>
                                                        !item.is_sent_to_pending &&
                                                        (e.currentTarget.style.transform = "rotate(90deg)")
                                                    }
                                                    onMouseOut={(e) =>
                                                        !item.is_sent_to_pending &&
                                                        (e.currentTarget.style.transform = "rotate(0deg)")
                                                    }
                                                />
                                            </TableCell>
                                        )}
                                        {/* Actions */}
                                        {hasColumnPermission("delete") && (
                                            <TableCell>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                                                            disabled={item.is_sent_to_pending}
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
                            Showing {leadData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
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

export default LeadPage


