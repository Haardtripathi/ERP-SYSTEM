
"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAllWorkbook } from "@/services/workbookService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { RotateCw, RefreshCcw } from "lucide-react"
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
import { Loader2, Search, Trash2, SendHorizontal } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { deleteLead, sendLeadToPending } from "@/services/leadService"
import { deleteIncoming, sendIncomingToPending } from "@/services/incomingService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

const WorkbookPage = () => {
    const [workbookData, setWorkbookData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("All")
    const [selectedItem, setSelectedItem] = useState(null)
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
    const [goToPage, setGoToPage] = useState("")
    const [paginatedData, setPaginatedData] = useState([])
    const [searchColumn, setSearchColumn] = useState("all")
    const [refreshing, setRefreshing] = useState(false)


    const navigate = useNavigate()

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await getAllWorkbook()
            setWorkbookData(response.data)
            setFilteredData(response.data)
            setTotalPages(Math.ceil(response.data.length / itemsPerPage))
        } catch (error) {
            console.error("Error fetching workbook data:", error)
            setError("Failed to fetch data. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }, [itemsPerPage])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleDelete = async (id, data) => {
        try {
            if (data === "Lead") {
                await deleteLead(id)
            }
            if (data === "Incoming") {
                await deleteIncoming(id)
            }
            toast.success("Data deleted successfully")
            setWorkbookData((prevData) => prevData.filter((item) => item._id !== id))
            setCurrentPage((prevPage) => prevPage)
        } catch (error) {
            console.error("Error deleting item:", error)
            setError("Failed to delete item. Please try again.")
        }
    }

    const handleUpdateClick = async (id, data) => {
        if (data === "Lead") {
            navigate(`/edit-lead-data/${id}`)
        }
        if (data === "Incoming") {
            navigate(`/edit-incoming-data/${id}`)
        }
    }

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const handleSendToPending = async (id, data) => {
        const item = workbookData.find((item) => item._id === id)
        setSelectedItem(item)
        setIsReviewDialogOpen(true)
    }


    const validateForm = (formData) => {
        let isValid = true;
        const phoneRegex = /^\d{10}$/;

        // Check if any field is empty or invalid
        const hasEmptyField = Object.entries(formData).some(([key, value]) => {
            if (value === null || value === undefined) return true;
            if (typeof value === "string" && value.trim() === "") return true;
            if (typeof value === "object" && value !== null && "value" in value && (value.value === null || value.value === "")) return true;
            return false;
        });

        if (hasEmptyField) {
            toast.error("Please fill all the fields");
            return false;
        }

        // Validate primary phone number
        if (!phoneRegex.test(String(formData.cm_phone || ""))) {
            toast.error("Phone number must be 10 digits");
            return false;
        }

        // Validate alternate phone number if provided
        if (formData.alternate_phone && !phoneRegex.test(String(formData.alternate_phone))) {
            toast.error("Alternate phone number must be 10 digits");
            return false;
        }

        return true;
    };

    const refreshData = async () => {
        setRefreshing(true)
        await fetchData()
        setRefreshing(false)
        toast.success("Data refreshed successfully")
    }

    const confirmSendToPending = async () => {
        if (selectedItem) {
            try {
                const isValid = validateForm(selectedItem)
                if (!isValid) {
                    return
                }

                if (selectedItem.data?.value === "Lead") {
                    await sendLeadToPending(selectedItem._id)
                } else if (selectedItem.data?.value === "Incoming") {
                    await sendIncomingToPending(selectedItem._id)
                }

                toast.success("Data sent to pending successfully")

                const updatedWorkbookData = workbookData.map((item) =>
                    item._id === selectedItem._id ? { ...item, is_sent_to_pending: true } : item,
                )

                setWorkbookData(updatedWorkbookData)

                const updatedFilteredData = updatedWorkbookData
                    .filter((item) =>
                        Object.values(item).some(
                            (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()),
                        ),
                    )
                    .filter((item) => {
                        if (filterStatus === "All") return true
                        if (filterStatus === "isSent") return item.is_sent_to_pending
                        if (filterStatus === "isNotSent") return !item.is_sent_to_pending
                        return true
                    })

                setFilteredData(updatedFilteredData)

                const newTotalPages = Math.ceil(updatedFilteredData.length / itemsPerPage)
                setTotalPages(newTotalPages)

                if (currentPage > newTotalPages) {
                    setCurrentPage(newTotalPages || 1)
                } else if (
                    currentPage === newTotalPages &&
                    updatedFilteredData.length % itemsPerPage === 0 &&
                    currentPage > 1
                ) {
                    setCurrentPage(currentPage - 1)
                }

                setIsReviewDialogOpen(false)
                setCurrentPage((prevPage) => prevPage)
            } catch (error) {
                console.error("Error sending item to pending:", error)
                setError("Failed to send item to pending. Please try again.")
            }
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

    const handleFilterChange = (newStatus) => {
        setFilterStatus(newStatus)
        setCurrentPage(1)
    }

    const handleColumnSelect = (value) => {
        setSearchColumn(value)
        setCurrentPage(1)
    }

    // useEffect(() => {
    //     const applyFiltersAndPaginate = () => {
    //         const filtered = workbookData
    //             .filter((item) => {
    //                 // console.log(item, typeof item)

    //                 if (searchColumn === "all") {

    //                     return Object.values(item).some(

    //                         (val) =>
    //                             (typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase())) ||
    //                             (typeof val === "number" && val.toString().includes(searchTerm)),
    //                     )
    //                 } else {
    //                     const value = item[searchColumn]
    //                     console.log(typeof value)
    //                     if (typeof value === "string") {
    //                         return value.toLowerCase().includes(searchTerm.toLowerCase())
    //                     } else if (typeof value === "object" && value !== null && "value" in value) {
    //                         return value.value.toLowerCase().includes(searchTerm.toLowerCase())
    //                     } else if (typeof value === "number") {
    //                         return value.toString().includes(searchTerm)
    //                     }
    //                     return false
    //                 }
    //             })
    //             .filter((item) => {
    //                 if (filterStatus === "All") return true
    //                 if (filterStatus === "isSent") return item.is_sent_to_pending
    //                 if (filterStatus === "isNotSent") return !item.is_sent_to_pending
    //                 return true
    //             })

    //         setFilteredData(filtered)
    //         const newTotalPages = Math.ceil(filtered.length / itemsPerPage)
    //         setTotalPages(newTotalPages)

    //         const startIndex = (currentPage - 1) * itemsPerPage
    //         setPaginatedData(filtered.slice(startIndex, startIndex + itemsPerPage))
    //     }

    //     applyFiltersAndPaginate()
    // }, [workbookData, filterStatus, searchTerm, searchColumn, currentPage, itemsPerPage])
    useEffect(() => {
        const applyFiltersAndPaginate = () => {
            const filtered = workbookData
                .filter((item) => {
                    if (searchColumn === "all") {
                        return Object.values(item).some((val) => {
                            if (val === null || val === undefined) return false // Handle null & undefined values safely
                            return (
                                (typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                (typeof val === "number" && val.toString().includes(searchTerm))
                            )
                        })
                    } else {
                        const value = item[searchColumn]
                        if (value === null || value === undefined) return false // Handle null & undefined safely

                        if (typeof value === "string") {
                            return value.toLowerCase().includes(searchTerm.toLowerCase())
                        } else if (typeof value === "object" && "value" in value && value.value) {
                            return value.value.toLowerCase().includes(searchTerm.toLowerCase())
                        } else if (typeof value === "number") {
                            return value.toString().includes(searchTerm)
                        }
                        return false
                    }
                })
                .filter((item) => {
                    if (filterStatus === "All") return true
                    if (filterStatus === "isSent") return item.is_sent_to_pending
                    if (filterStatus === "isNotSent") return !item.is_sent_to_pending
                    return true
                })

            setFilteredData(filtered)
            const newTotalPages = Math.ceil(filtered.length / itemsPerPage)
            setTotalPages(newTotalPages)

            const startIndex = (currentPage - 1) * itemsPerPage
            setPaginatedData(filtered.slice(startIndex, startIndex + itemsPerPage))
        }

        applyFiltersAndPaginate()
    }, [workbookData, filterStatus, searchTerm, searchColumn, currentPage, itemsPerPage])


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

            <Card className="mb-6">
                {/* Header Section */}
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-3xl font-bold">Workbook Page</CardTitle>

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
                <br />
                {/* Content Section */}
                <CardContent>

                    <div className="flex space-x-2">
                        <Button
                            onClick={() => {
                                setFilterStatus("All")
                                setCurrentPage(1)
                            }}
                            variant={filterStatus === "All" ? "default" : "outline"}
                        >
                            All
                        </Button>
                        <Button
                            onClick={() => {
                                setFilterStatus("isSent")
                                setCurrentPage(1)
                            }}
                            variant={filterStatus === "isSent" ? "default" : "outline"}
                        >
                            Sent to Pending
                        </Button>
                        <Button
                            onClick={() => {
                                setFilterStatus("isNotSent")
                                setCurrentPage(1)
                            }}
                            variant={filterStatus === "isNotSent" ? "default" : "outline"}
                        >
                            Not Sent
                        </Button>
                    </div>





                </CardContent>
            </Card>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Send</TableHead>
                                <TableHead>
                                    <div>
                                        <span>Data</span>
                                        <br />
                                        <span>Source</span>
                                    </div>
                                </TableHead>                                <TableHead>
                                    <div>
                                        <span>First Name</span>
                                        <br />
                                        <span>Last Name</span>
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div>
                                        <span>Phone</span>
                                        <br />
                                        <span>Alternate Phone</span>
                                    </div>
                                </TableHead>
                                <TableHead>Agent</TableHead>
                                <TableHead>
                                    <div>
                                        <span>Disease</span>
                                        <br />
                                        <span>Language</span>
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div>
                                        <span>State</span>
                                        <br />
                                        <span>City/Town/Village</span>
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div>
                                        <span>Remark</span>
                                        <br />
                                        <span>Comment</span>
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div>
                                        <span>Date</span>
                                        <br />
                                        <span>Time</span>
                                    </div>
                                </TableHead>
                                <TableHead>Update</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item, index) => (
                                <TableRow
                                    key={item._id}
                                    className={
                                        item.is_sent_to_pending
                                            ? "bg-green-100"
                                            : index % 2 === 0
                                                ? "bg-gray-50"
                                                : "bg-white"
                                    }
                                >
                                    {/* Send */}
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
                                                !item.is_sent_to_pending && handleSendToPending(item._id)
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            {item.data?.value}
                                            <br />
                                            {item.source?.value}
                                        </div>
                                    </TableCell>
                                    {/* Name (First Name + Last Name) */}
                                    <TableCell>
                                        <div>
                                            {item.cm_first_name}
                                            <br />
                                            {item.cm_last_name}
                                        </div>
                                    </TableCell>
                                    {/* Contact (Phone + Alternate Phone) */}
                                    <TableCell>
                                        <div>
                                            {item.cm_phone}
                                            <br />
                                            {item.alternate_phone}
                                        </div>
                                    </TableCell>
                                    {/* Agent */}
                                    <TableCell>{item.agent_name?.value}</TableCell>
                                    {/* Disease & Language */}
                                    <TableCell>
                                        <div>
                                            {item.disease?.value}
                                            <br />
                                            {item.language?.value}
                                        </div>
                                    </TableCell>
                                    {/* Location (State + City) */}
                                    <TableCell>
                                        <div>
                                            {item.state?.value}
                                            <br />
                                            {item.city}
                                        </div>
                                    </TableCell>
                                    {/* Remark & Comment */}
                                    <TableCell>
                                        <div>
                                            {item.remark?.value}
                                            <br />
                                            {item.comment}
                                        </div>
                                    </TableCell>
                                    {/* Date & Time */}
                                    <TableCell>
                                        <div>
                                            {item.date}
                                            <br />
                                            {item.time}
                                        </div>
                                    </TableCell>
                                    {/* Update */}
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
                                    {/* Actions */}
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
                                                    <AlertDialogAction onClick={() => handleDelete(item._id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="mt-4 flex flex-col items-center justify-center space-y-4">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            if (
                                pageNumber === 1 ||
                                pageNumber === totalPages ||
                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                            ) {
                                return (
                                    <PaginationItem key={index}>
                                        <PaginationLink
                                            onClick={() => handlePageChange(pageNumber)}
                                            isActive={currentPage === pageNumber}
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                return <PaginationEllipsis key={index} />;
                            }
                            return null;
                        })}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>


            <div className="flex items-center space-x-2">
                <Input
                    type="number"
                    placeholder="Go to page"
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && goToPage) {
                            handleGoToPage();
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

            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Review Workbook Data</DialogTitle>
                        <DialogDescription className="mb-4">
                            Please review the data before sending to pending.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="mt-4">
                            <dl className="space-y-3">
                                <div className="flex justify-between border-b pb-1">
                                    <dt className="text-sm font-medium text-gray-600">Data Type:</dt>
                                    <dd className="text-sm text-gray-800">{selectedItem.data?.value}</dd>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <dt className="text-sm font-medium text-gray-600">Source:</dt>
                                    <dd className="text-sm text-gray-800">{selectedItem.source?.value}</dd>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <dt className="text-sm font-medium text-gray-600">Name:</dt>
                                    <dd className="text-sm text-gray-800">
                                        {selectedItem.cm_first_name} {selectedItem.cm_last_name}
                                    </dd>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <dt className="text-sm font-medium text-gray-600">Phone:</dt>
                                    <dd className="text-sm text-gray-800">{selectedItem.cm_phone}</dd>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <dt className="text-sm font-medium text-gray-600">Agent:</dt>
                                    <dd className="text-sm text-gray-800">{selectedItem.agent_name?.value}</dd>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <dt className="text-sm font-medium text-gray-600">Language:</dt>
                                    <dd className="text-sm text-gray-800">{selectedItem.language?.value}</dd>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <dt className="text-sm font-medium text-gray-600">Disease:</dt>
                                    <dd className="text-sm text-gray-800">{selectedItem.disease?.value}</dd>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <dt className="text-sm font-medium text-gray-600">State:</dt>
                                    <dd className="text-sm text-gray-800">{selectedItem.state?.value}</dd>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <dt className="text-sm font-medium text-gray-600">City:</dt>
                                    <dd className="text-sm text-gray-800">{selectedItem.city}</dd>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <dt className="text-sm font-medium text-gray-600">Remark:</dt>
                                    <dd className="text-sm text-gray-800">{selectedItem.remark?.value}</dd>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <dt className="text-sm font-medium text-gray-600">Comment:</dt>
                                    <dd className="text-sm text-gray-800">{selectedItem.comment}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm font-medium text-gray-600">Date:</dt>
                                    <dd className="text-sm text-gray-800">{selectedItem.date}</dd>
                                </div>
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

export default WorkbookPage

















// "use client"

// import React, { useState, useEffect, useCallback, useMemo } from "react"
// import { getAllWorkbook } from "@/services/workbookService"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { toast } from "react-hot-toast"
// import { RotateCw, RefreshCcw } from "lucide-react"
// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"
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
// import { Loader2, Search, Trash2, SendHorizontal } from "lucide-react"
// import { useNavigate } from "react-router-dom"
// import { deleteLead, sendLeadToPending } from "@/services/leadService"
// import { deleteIncoming, sendIncomingToPending } from "@/services/incomingService"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogFooter,
// } from "@/components/ui/dialog"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// const Table = ({ children }) => <table className="w-full border-collapse">{children}</table>
// const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>
// const TableRow = ({ children, className }) => <tr className={className}>{children}</tr>
// const TableHead = ({ children, className }) => (
//     <th className={`${className} p-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-300`}>
//         {children}
//     </th>
// )
// const TableBody = ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
// const TableCell = ({ children, className }) => <td className={`${className} p-3 text-sm text-gray-700`}>{children}</td>

// const WorkbookPage = () => {
//     const [workbookData, setWorkbookData] = useState([])
//     const [filteredData, setFilteredData] = useState([])
//     const [currentPage, setCurrentPage] = useState(1)
//     const [itemsPerPage] = useState(10)
//     const [totalPages, setTotalPages] = useState(1)
//     const [isLoading, setIsLoading] = useState(true)
//     const [error, setError] = useState(null)
//     const [searchTerm, setSearchTerm] = useState("")
//     const [filterStatus, setFilterStatus] = useState("All")
//     const [selectedItem, setSelectedItem] = useState(null)
//     const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
//     const [goToPage, setGoToPage] = useState("")
//     const [paginatedData, setPaginatedData] = useState([])
//     const [searchColumn, setSearchColumn] = useState("all")
//     const [refreshing, setRefreshing] = useState(false)

//     const [totalRecords, setTotalRecords] = useState(0);


//     const navigate = useNavigate()

//     const fetchData = useCallback(async () => {
//         try {
//             setIsLoading(true);
//             const response = await getAllWorkbook(currentPage, itemsPerPage);

//             console.log("Frontend API Response:", response); // Debugging step

//             if (response && response.data) {
//                 console.log("Total Pages from API:", response.data.totalPages);
//                 setWorkbookData(response.data.data);
//                 setTotalRecords(response.data.totalRecords); // Ensure totalRecords updates
//                 setTotalPages(Number(response.data.totalPages) || 1); // Ensure it's a number
//             } else {
//                 setWorkbookData([]);
//                 setTotalPages(1);
//             }
//         } catch (error) {
//             console.error("Error fetching workbook data:", error);
//             setError("Failed to fetch data. Please try again later.");
//         } finally {
//             setIsLoading(false);
//         }
//     }, [currentPage, itemsPerPage]);

//     const paginationNumbers = useMemo(() => {
//         if (totalPages <= 1) return [];
//         return Array.from({ length: totalPages }, (_, index) => index + 1);
//     }, [totalPages]);

//     useEffect(() => {
//         fetchData();
//     }, [fetchData, currentPage]); // Ensure re-fetch when page changes
//     useEffect(() => {
//         if (currentPage > totalPages) {
//             setCurrentPage(totalPages || 1);
//         }
//     }, [totalPages]);


//     const handleDelete = async (id, data) => {
//         try {
//             if (data === "Lead") {
//                 await deleteLead(id)
//             }
//             if (data === "Incoming") {
//                 await deleteIncoming(id)
//             }
//             toast.success("Data deleted successfully")
//             setWorkbookData((prevData) => prevData.filter((item) => item._id !== id))
//             setCurrentPage((prevPage) => prevPage)
//         } catch (error) {
//             console.error("Error deleting item:", error)
//             setError("Failed to delete item. Please try again.")
//         }
//     }

//     const handleUpdateClick = async (id, data) => {
//         if (data === "Lead") {
//             navigate(`/edit-lead-data/${id}`)
//         }
//         if (data === "Incoming") {
//             navigate(`/edit-incoming-data/${id}`)
//         }
//     }

//     const handlePageChange = (page) => {
//         if (page >= 1 && page <= totalPages) {
//             console.log(`Changing to page: ${page}`); // Debugging
//             setCurrentPage(page);
//         }
//     };

//     const handleSendToPending = async (id, data) => {
//         const item = workbookData.find((item) => item._id === id)
//         setSelectedItem(item)
//         setIsReviewDialogOpen(true)
//     }


//     const validateForm = (formData) => {
//         let isValid = true;
//         const phoneRegex = /^\d{10}$/;

//         // Check if any field is empty or invalid
//         const hasEmptyField = Object.entries(formData).some(([key, value]) => {
//             if (value === null || value === undefined) return true;
//             if (typeof value === "string" && value.trim() === "") return true;
//             if (typeof value === "object" && value !== null && "value" in value && (value.value === null || value.value === "")) return true;
//             return false;
//         });

//         if (hasEmptyField) {
//             toast.error("Please fill all the fields");
//             return false;
//         }

//         // Validate primary phone number
//         if (!phoneRegex.test(String(formData.cm_phone || ""))) {
//             toast.error("Phone number must be 10 digits");
//             return false;
//         }

//         // Validate alternate phone number if provided
//         if (formData.alternate_phone && !phoneRegex.test(String(formData.alternate_phone))) {
//             toast.error("Alternate phone number must be 10 digits");
//             return false;
//         }

//         return true;
//     };

//     const refreshData = async () => {
//         setRefreshing(true)
//         await fetchData()
//         setRefreshing(false)
//         toast.success("Data refreshed successfully")
//     }

//     const confirmSendToPending = async () => {
//         if (selectedItem) {
//             try {
//                 const isValid = validateForm(selectedItem)
//                 if (!isValid) {
//                     return
//                 }

//                 if (selectedItem.data?.value === "Lead") {
//                     await sendLeadToPending(selectedItem._id)
//                 } else if (selectedItem.data?.value === "Incoming") {
//                     await sendIncomingToPending(selectedItem._id)
//                 }

//                 toast.success("Data sent to pending successfully")

//                 const updatedWorkbookData = workbookData.map((item) =>
//                     item._id === selectedItem._id ? { ...item, is_sent_to_pending: true } : item,
//                 )

//                 setWorkbookData(updatedWorkbookData)

//                 const updatedFilteredData = updatedWorkbookData
//                     .filter((item) =>
//                         Object.values(item).some(
//                             (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()),
//                         ),
//                     )
//                     .filter((item) => {
//                         if (filterStatus === "All") return true
//                         if (filterStatus === "isSent") return item.is_sent_to_pending
//                         if (filterStatus === "isNotSent") return !item.is_sent_to_pending
//                         return true
//                     })

//                 setFilteredData(updatedFilteredData)

//                 const newTotalPages = Math.ceil(updatedFilteredData.length / itemsPerPage)
//                 setTotalPages(newTotalPages)

//                 if (currentPage > newTotalPages) {
//                     setCurrentPage(newTotalPages || 1)
//                 } else if (
//                     currentPage === newTotalPages &&
//                     updatedFilteredData.length % itemsPerPage === 0 &&
//                     currentPage > 1
//                 ) {
//                     setCurrentPage(currentPage - 1)
//                 }

//                 setIsReviewDialogOpen(false)
//                 setCurrentPage((prevPage) => prevPage)
//             } catch (error) {
//                 console.error("Error sending item to pending:", error)
//                 setError("Failed to send item to pending. Please try again.")
//             }
//         }
//     }

//     const handleGoToPage = () => {
//         const pageNumber = Number.parseInt(goToPage, 10);
//         if (pageNumber >= 1 && pageNumber <= totalPages) {
//             setCurrentPage(pageNumber);
//             setGoToPage(""); // Reset input field
//         } else {
//             toast.error(`Please enter a valid page number between 1 and ${totalPages}`);
//         }
//     };


//     const handleFilterChange = (newStatus) => {
//         setFilterStatus(newStatus)
//         setCurrentPage(1)
//     }

//     const handleColumnSelect = (value) => {
//         setSearchColumn(value)
//         setCurrentPage(1)
//     }

//     useEffect(() => {
//         const applyFiltersAndPaginate = () => {
//             const filtered = workbookData
//                 .filter((item) => {
//                     if (searchColumn === "all") {
//                         return Object.values(item).some(
//                             (val) =>
//                                 (typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase())) ||
//                                 (typeof val === "number" && val.toString().includes(searchTerm)),
//                         )
//                     } else {
//                         const value = item[searchColumn]
//                         if (typeof value === "string") {
//                             return value.toLowerCase().includes(searchTerm.toLowerCase())
//                         } else if (typeof value === "object" && value !== null && "value" in value) {
//                             return value.value.toLowerCase().includes(searchTerm.toLowerCase())
//                         } else if (typeof value === "number") {
//                             return value.toString().includes(searchTerm)
//                         }
//                         return false
//                     }
//                 })
//                 .filter((item) => {
//                     if (filterStatus === "All") return true
//                     if (filterStatus === "isSent") return item.is_sent_to_pending
//                     if (filterStatus === "isNotSent") return !item.is_sent_to_pending
//                     return true
//                 })

//             setFilteredData(filtered)
//             const newTotalPages = Math.ceil(filtered.length / itemsPerPage)
//             setTotalPages(newTotalPages)

//             const startIndex = (currentPage - 1) * itemsPerPage
//             setPaginatedData(filtered.slice(startIndex, startIndex + itemsPerPage))
//         }

//         applyFiltersAndPaginate()
//     }, [workbookData, filterStatus, searchTerm, searchColumn, currentPage, itemsPerPage])

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


//             <div className="bg-white shadow-md rounded-lg overflow-hidden">
//                 <div className="overflow-x-auto max-w-full">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Send</TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Data</span>
//                                         <br />
//                                         <span>Source</span>
//                                     </div>
//                                 </TableHead>                                <TableHead>
//                                     <div>
//                                         <span>First Name</span>
//                                         <br />
//                                         <span>Last Name</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Phone</span>
//                                         <br />
//                                         <span>Alternate Phone</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>Agent</TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Disease</span>
//                                         <br />
//                                         <span>Language</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>State</span>
//                                         <br />
//                                         <span>City/Town/Village</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Remark</span>
//                                         <br />
//                                         <span>Comment</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>
//                                     <div>
//                                         <span>Date</span>
//                                         <br />
//                                         <span>Time</span>
//                                     </div>
//                                 </TableHead>
//                                 <TableHead>Update</TableHead>
//                                 <TableHead>Actions</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {paginatedData.map((item, index) => (
//                                 <TableRow
//                                     key={item._id}
//                                     className={
//                                         item.is_sent_to_pending
//                                             ? "bg-green-100"
//                                             : index % 2 === 0
//                                                 ? "bg-gray-50"
//                                                 : "bg-white"
//                                     }
//                                 >
//                                     {/* Send */}
//                                     <TableCell>
//                                         <SendHorizontal
//                                             size={20}
//                                             color={item.is_sent_to_pending ? "#28a745" : "#007BFF"}
//                                             strokeWidth={2}
//                                             style={{
//                                                 cursor: item.is_sent_to_pending ? "not-allowed" : "pointer",
//                                                 transition: "transform 0.2s ease",
//                                                 opacity: item.is_sent_to_pending ? 0.5 : 1,
//                                             }}
//                                             onClick={() =>
//                                                 !item.is_sent_to_pending && handleSendToPending(item._id)
//                                             }
//                                         />
//                                     </TableCell>
//                                     <TableCell>
//                                         <div>
//                                             {item.data?.value}
//                                             <br />
//                                             {item.source?.value}
//                                         </div>
//                                     </TableCell>
//                                     {/* Name (First Name + Last Name) */}
//                                     <TableCell>
//                                         <div>
//                                             {item.cm_first_name}
//                                             <br />
//                                             {item.cm_last_name}
//                                         </div>
//                                     </TableCell>
//                                     {/* Contact (Phone + Alternate Phone) */}
//                                     <TableCell>
//                                         <div>
//                                             {item.cm_phone}
//                                             <br />
//                                             {item.alternate_phone}
//                                         </div>
//                                     </TableCell>
//                                     {/* Agent */}
//                                     <TableCell>{item.agent_name?.value}</TableCell>
//                                     {/* Disease & Language */}
//                                     <TableCell>
//                                         <div>
//                                             {item.disease?.value}
//                                             <br />
//                                             {item.language?.value}
//                                         </div>
//                                     </TableCell>
//                                     {/* Location (State + City) */}
//                                     <TableCell>
//                                         <div>
//                                             {item.state?.value}
//                                             <br />
//                                             {item.city}
//                                         </div>
//                                     </TableCell>
//                                     {/* Remark & Comment */}
//                                     <TableCell>
//                                         <div>
//                                             {item.remark?.value}
//                                             <br />
//                                             {item.comment}
//                                         </div>
//                                     </TableCell>
//                                     {/* Date & Time */}
//                                     <TableCell>
//                                         <div>
//                                             {item.date}
//                                             <br />
//                                             {item.time}
//                                         </div>
//                                     </TableCell>
//                                     {/* Update */}
//                                     <TableCell>
//                                         <RotateCw
//                                             size={20}
//                                             color="#007BFF"
//                                             strokeWidth={2}
//                                             style={{
//                                                 cursor: item.is_sent_to_pending ? "not-allowed" : "pointer",
//                                                 transition: "transform 0.2s ease",
//                                                 opacity: item.is_sent_to_pending ? 0.5 : 1,
//                                             }}
//                                             onClick={() =>
//                                                 !item.is_sent_to_pending &&
//                                                 handleUpdateClick(item._id, item.is_sent_to_pending)
//                                             }
//                                             onMouseOver={(e) =>
//                                                 !item.is_sent_to_pending &&
//                                                 (e.currentTarget.style.transform = "rotate(90deg)")
//                                             }
//                                             onMouseOut={(e) =>
//                                                 !item.is_sent_to_pending &&
//                                                 (e.currentTarget.style.transform = "rotate(0deg)")
//                                             }
//                                         />
//                                     </TableCell>
//                                     {/* Actions */}
//                                     <TableCell>
//                                         <AlertDialog>
//                                             <AlertDialogTrigger asChild>
//                                                 <Button
//                                                     variant="ghost"
//                                                     className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
//                                                     disabled={item.is_sent_to_pending}
//                                                 >
//                                                     <Trash2 className="h-5 w-5 text-red-500" />
//                                                 </Button>
//                                             </AlertDialogTrigger>
//                                             <AlertDialogContent>
//                                                 <AlertDialogHeader>
//                                                     <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                                                     <AlertDialogDescription>
//                                                         This action cannot be undone. This will permanently delete the selected record.
//                                                     </AlertDialogDescription>
//                                                 </AlertDialogHeader>
//                                                 <AlertDialogFooter>
//                                                     <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                                     <AlertDialogAction onClick={() => handleDelete(item._id)}>
//                                                         Delete
//                                                     </AlertDialogAction>
//                                                 </AlertDialogFooter>
//                                             </AlertDialogContent>
//                                         </AlertDialog>
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </div>
//             </div>
//             <div className="mt-4 flex flex-col items-center justify-center space-y-4">
//                 <Pagination>
//                     <PaginationContent>
//                         <PaginationItem>
//                             <PaginationPrevious onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)} />
//                         </PaginationItem>

//                         {paginationNumbers.map((pageNumber) => (
//                             <PaginationItem key={pageNumber}>
//                                 <PaginationLink
//                                     onClick={() => handlePageChange(pageNumber)}
//                                     isActive={currentPage === pageNumber}
//                                 >
//                                     {pageNumber}
//                                 </PaginationLink>
//                             </PaginationItem>
//                         ))}

//                         <PaginationItem>
//                             <PaginationNext onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)} />
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
//                         if (e.key === 'Enter' && goToPage) {
//                             handleGoToPage();
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

//             <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
//                 <DialogContent className="max-w-md">
//                     <DialogHeader>
//                         <DialogTitle>Review Workbook Data</DialogTitle>
//                         <DialogDescription className="mb-4">
//                             Please review the data before sending to pending.
//                         </DialogDescription>
//                     </DialogHeader>
//                     {selectedItem && (
//                         <div className="mt-4">
//                             <dl className="space-y-3">
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Data Type:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.data?.value}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Source:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.source?.value}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Name:</dt>
//                                     <dd className="text-sm text-gray-800">
//                                         {selectedItem.cm_first_name} {selectedItem.cm_last_name}
//                                     </dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Phone:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.cm_phone}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Agent:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.agent_name?.value}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Language:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.language?.value}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Disease:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.disease?.value}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">State:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.state?.value}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">City:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.city}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Remark:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.remark?.value}</dd>
//                                 </div>
//                                 <div className="flex justify-between border-b pb-1">
//                                     <dt className="text-sm font-medium text-gray-600">Comment:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.comment}</dd>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <dt className="text-sm font-medium text-gray-600">Date:</dt>
//                                     <dd className="text-sm text-gray-800">{selectedItem.date}</dd>
//                                 </div>
//                             </dl>
//                         </div>
//                     )}
//                     <DialogFooter className="mt-6 flex justify-end space-x-4">
//                         <Button onClick={() => setIsReviewDialogOpen(false)} variant="outline">
//                             Cancel
//                         </Button>
//                         <Button onClick={confirmSendToPending}>Confirm Send</Button>
//                     </DialogFooter>
//                 </DialogContent>

//             </Dialog>
//         </div>

//     )
// }

// export default WorkbookPage

