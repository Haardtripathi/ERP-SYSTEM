
'use client'

import React, { useState, useEffect } from "react"
import { getAllIncoming, deleteIncoming, sendIncomingToPending } from "@/services/incomingService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { RotateCw, SendHorizontal } from 'lucide-react'
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
import { Loader2, Search, Trash2 } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"

const Table = ({ children }) => (
    <table className="w-full border-collapse">
        {children}
    </table>
)

const TableHeader = ({ children }) => (
    <thead className="bg-gray-200">
        {children}
    </thead>
)

const TableRow = ({ children, className }) => (
    <tr className={className}>
        {children}
    </tr>
)

const TableHead = ({ children, className }) => (
    <th className={`${className} p-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-300`}>
        {children}
    </th>
)

const TableBody = ({ children }) => (
    <tbody className="bg-white divide-y divide-gray-200">
        {children}
    </tbody>
)

const TableCell = ({ children, className }) => (
    <td className={`${className} p-3 text-sm text-gray-700`}>
        {children}
    </td>
)

const IncomingPage = () => {
    const [incomingData, setIncomingData] = useState([])
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


    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const response = await getAllIncoming()
                setIncomingData(response.data.data)
                setFilteredData(response.data.data)
                setTotalPages(Math.ceil(response.data.data.length / itemsPerPage))
            } catch (error) {
                console.error("Error fetching incoming data:", error)
                setError("Failed to fetch data. Please try again later.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [itemsPerPage])

    useEffect(() => {
        const results = incomingData.filter((item) =>
            Object.values(item).some(
                (val) =>
                    typeof val === "string" &&
                    val.toLowerCase().includes(searchTerm.toLowerCase())
            )
        ).filter((item) => {

            if (filterStatus === "All") return true;
            if (filterStatus === "isSent") return item.is_sent_to_pending;
            if (filterStatus === "isNotSent") return !item.is_sent_to_pending;
            return true;
        })
        setFilteredData(results)
        setTotalPages(Math.ceil(results.length / itemsPerPage))
        setCurrentPage(1)
    }, [searchTerm, incomingData, itemsPerPage, filterStatus])


    const handleDelete = async (id) => {
        try {
            await deleteIncoming(id)
            toast.success("Data deleted successfully")
            setIncomingData((prevData) => prevData.filter((item) => item._id !== id))
            setFilteredData((prevData) => prevData.filter((item) => item._id !== id))
            setTotalPages(Math.ceil((filteredData.length - 1) / itemsPerPage))
        } catch (error) {
            console.error("Error deleting item:", error)
            setError("Failed to delete item. Please try again.")
        }
    }

    const handleUpdateClick = async (id) => {
        navigate(`/edit-incoming-data/${id}`)
    }

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const handleSendToPending = async (id) => {
        const item = incomingData.find(item => item._id === id)
        setSelectedItem(item)
        setIsReviewDialogOpen(true)
    }
    const validateForm = (formData) => {
        let isValid = true;
        const phoneRegex = /^\d{10}$/;

        Object.entries(formData).forEach(([key, value]) => {
            console.log(key, value, typeof value)
            if (key !== "alternate_phone" && typeof value === "object" && (value.value === null || value.value === "")) {
                toast.error(`${key.replace(/_/g, " ")} is required`)
                isValid = false
            } else if (key !== "alternate_phone" && typeof value === "string" && value.trim() === "") {
                toast.error(`${key.replace(/_/g, " ")} is required`)
                isValid = false
            }
        })

        if (!phoneRegex.test(formData.cm_phone)) {
            toast.error('Phone number must be 10 digits');
            isValid = false;
        }

        if (formData.alternate_phone && !phoneRegex.test(formData.alternate_phone)) {
            toast.error('Alternate phone number must be 10 digits');
            isValid = false;
        }

        return isValid;
    };

    // const confirmSendToPending = async () => {
    //     if (selectedItem) {
    //         await sendIncomingToPending(selectedItem._id)
    //         toast.success("Incoming sent to pending successfully")
    //         setIncomingData((prevData) => prevData.filter((item) => item._id !== selectedItem._id))
    //         setFilteredData((prevData) => prevData.filter((item) => item._id !== selectedItem._id))
    //         setTotalPages(Math.ceil((filteredData.length - 1) / itemsPerPage))
    //         setIsReviewDialogOpen(false)
    //         window.location.reload()
    //     }
    // }

    const confirmSendToPending = async () => {
        if (selectedItem) {
            try {
                const isValid = validateForm(selectedItem)
                console.log(isValid)
                if (!isValid) {
                    navigate("/incoming")
                    return
                }
                await sendIncomingToPending(selectedItem._id);
                toast.success("Incoming sent to pending successfully");

                setIncomingData((prevData) =>
                    prevData.map((item) =>
                        item._id === selectedItem._id
                            ? { ...item, is_sent_to_pending: true }
                            : item
                    )
                );

                // Update the filtered data based on the new field
                setFilteredData((prevData) =>
                    prevData.map((item) =>
                        item._id === selectedItem._id
                            ? { ...item, is_sent_to_pending: true }
                            : item
                    )
                );

                // Recalculate the total pages (excluding items with is_sent_to_pending === true)
                setTotalPages(
                    Math.ceil(
                        filteredData.filter((item) => !item.is_sent_to_pending).length /
                        itemsPerPage
                    )
                );

                setIsReviewDialogOpen(false);
            } catch (error) {
                toast.error("Failed to send incoming to pending");
                console.error(error);
            }
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

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
            <h1 className="text-3xl font-semibold mb-6 text-gray-800">Incoming Data</h1>
            <div className="mb-4 flex justify-between items-center">
                <div className="flex space-x-2">
                    <Button
                        onClick={() => setFilterStatus("All")}
                        variant={filterStatus === "All" ? "default" : "outline"}
                    >
                        All
                    </Button>
                    <Button
                        onClick={() => setFilterStatus("isSent")}
                        variant={filterStatus === "isSent" ? "default" : "outline"}
                    >
                        Is Sent
                    </Button>
                    <Button
                        onClick={() => setFilterStatus("isNotSent")}
                        variant={filterStatus === "isNotSent" ? "default" : "outline"}
                    >
                        Is Not Sent
                    </Button>
                </div>
                {/* <Input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            /> */}
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Send</TableHead>

                                <TableHead>Source</TableHead>
                                <TableHead>First Name</TableHead>
                                <TableHead>Last Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Agent</TableHead>
                                <TableHead>Language</TableHead>
                                <TableHead>Disease</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>Remark</TableHead>
                                <TableHead>Comment</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Update</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item, index) => (
                                <TableRow key={item._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                    <TableCell>
                                        <SendHorizontal
                                            size={20}
                                            color={item.is_sent_to_pending ? "#28a745" : "#007BFF"}
                                            strokeWidth={2}
                                            style={{
                                                cursor: item.is_sent_to_pending ? 'not-allowed' : 'pointer',
                                                transition: 'transform 0.2s ease',
                                                opacity: item.is_sent_to_pending ? 0.5 : 1
                                            }}
                                            onClick={() => !item.is_sent_to_pending && handleSendToPending(item._id)}
                                        />
                                    </TableCell>
                                    <TableCell>{item.source?.value}</TableCell>
                                    <TableCell>{item.cm_first_name}</TableCell>
                                    <TableCell>{item.cm_last_name}</TableCell>
                                    <TableCell>{item.cm_phone}</TableCell>
                                    <TableCell>{item.agent_name?.value}</TableCell>
                                    <TableCell>{item.language?.value}</TableCell>
                                    <TableCell>{item.disease?.value}</TableCell>
                                    <TableCell>{item.state?.value}</TableCell>
                                    <TableCell>{item.city}</TableCell>
                                    <TableCell>{item.remark?.value}</TableCell>
                                    <TableCell>{item.comment}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>
                                        <RotateCw
                                            size={20}
                                            color="#007BFF"
                                            strokeWidth={2}
                                            style={{
                                                cursor: item.is_sent_to_pending ? 'not-allowed' : 'pointer',
                                                transition: 'transform 0.2s ease',
                                                opacity: item.is_sent_to_pending ? 0.5 : 1
                                            }}
                                            onClick={() => !item.is_sent_to_pending && handleUpdateClick(item._id)}
                                            onMouseOver={(e) => !item.is_sent_to_pending && (e.currentTarget.style.transform = 'rotate(90deg)')}
                                            onMouseOut={(e) => !item.is_sent_to_pending && (e.currentTarget.style.transform = 'rotate(0deg)')}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200" disabled={item.is_sent_to_pending}>
                                                    <Trash2 className="h-5 w-5 text-red-500" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the
                                                        selected record.
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
            <Pagination className="mt-4 flex justify-center">
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
                        } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                        ) {
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
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Data</DialogTitle>
                        <DialogDescription>
                            Please review the data before sending to pending.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="mt-4">
                            <p><strong>Source:</strong> {selectedItem.source?.value}</p>
                            <p><strong>Name:</strong> {selectedItem.cm_first_name} {selectedItem.cm_last_name}</p>
                            <p><strong>Phone:</strong> {selectedItem.cm_phone}</p>
                            <p><strong>Agent:</strong> {selectedItem.agent_name?.value}</p>
                            <p><strong>Language:</strong> {selectedItem.language?.value}</p>
                            <p><strong>Disease:</strong> {selectedItem.disease?.value}</p>
                            <p><strong>State:</strong> {selectedItem.state?.value}</p>
                            <p><strong>City:</strong> {selectedItem.city}</p>
                            <p><strong>Remark:</strong> {selectedItem.remark?.value}</p>
                            <p><strong>Comment:</strong> {selectedItem.comment}</p>
                            <p><strong>Date:</strong> {selectedItem.date}</p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsReviewDialogOpen(false)}>Cancel</Button>
                        <Button onClick={confirmSendToPending}>Confirm Send</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default IncomingPage


