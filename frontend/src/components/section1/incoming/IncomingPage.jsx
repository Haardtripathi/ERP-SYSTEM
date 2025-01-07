'use client'

import React, { useState, useEffect } from "react"
import { getAllIncoming } from "@/services/incomingService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
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
import { Loader2, Search, Trash2 } from 'lucide-react'
import { Link, useNavigate, useLocation } from "react-router-dom";


const IncomingPage = () => {
    const [incomingData, setIncomingData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")

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
        )
        setFilteredData(results)
        setTotalPages(Math.ceil(results.length / itemsPerPage))
        setCurrentPage(1)
    }, [searchTerm, incomingData, itemsPerPage])

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/incoming/${id}`, { method: 'DELETE' })
            setIncomingData((prevData) => prevData.filter((item) => item._id !== id))
            setFilteredData((prevData) => prevData.filter((item) => item._id !== id))
            setTotalPages(Math.ceil((filteredData.length - 1) / itemsPerPage))
        } catch (error) {
            console.error("Error deleting item:", error)
            setError("Failed to delete item. Please try again.")
        }
    }

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
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
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Incoming Data</h1>
            {/* <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div> */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
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
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((item) => (
                            <TableRow key={item._id}>
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
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon">
                                                <Trash2 className="h-4 w-4" />
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
            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                        <PaginationItem key={index}>
                            <PaginationLink
                                onClick={() => handlePageChange(index + 1)}
                                isActive={currentPage === index + 1}
                            >
                                {index + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

export default IncomingPage

