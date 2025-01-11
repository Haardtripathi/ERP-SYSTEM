// 'use client'

// import React, { useState, useEffect } from "react"
// import { getAllLead, deleteLead } from "@/services/leadService"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { toast } from "react-hot-toast"
// import { RefreshCw, RotateCw, RefreshCcw } from 'lucide-react';
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table"
// import {
//     Pagination,
//     PaginationContent,
//     PaginationEllipsis,
//     PaginationItem,
//     PaginationLink,
//     PaginationNext,
//     PaginationPrevious,
// } from "@/components/ui/pagination"
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
// import { Loader2, Search, Trash2 } from 'lucide-react'
// import { Link, useNavigate, useLocation } from "react-router-dom";


// const LeadPage = () => {
//     const [leadData, setLeadData] = useState([])
//     const [filteredData, setFilteredData] = useState([])
//     const [currentPage, setCurrentPage] = useState(1)
//     const [itemsPerPage] = useState(10)
//     const [totalPages, setTotalPages] = useState(1)
//     const [isLoading, setIsLoading] = useState(true)
//     const [error, setError] = useState(null)
//     const [searchTerm, setSearchTerm] = useState("")

//     const navigate = useNavigate()

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setIsLoading(true)
//                 const response = await getAllLead()
//                 setLeadData(response.data.data)
//                 setFilteredData(response.data.data)
//                 setTotalPages(Math.ceil(response.data.data.length / itemsPerPage))
//             } catch (error) {
//                 console.error("Error fetching lead data:", error)
//                 setError("Failed to fetch data. Please try again later.")
//             } finally {
//                 setIsLoading(false)
//             }
//         }

//         fetchData()
//     }, [itemsPerPage])

//     useEffect(() => {
//         const results = leadData.filter((item) =>
//             Object.values(item).some(
//                 (val) =>
//                     typeof val === "string" &&
//                     val.toLowerCase().includes(searchTerm.toLowerCase())
//             )
//         )
//         setFilteredData(results)
//         setTotalPages(Math.ceil(results.length / itemsPerPage))
//         setCurrentPage(1)
//     }, [searchTerm, leadData, itemsPerPage])

//     const handleDelete = async (id) => {
//         try {
//             const response = await deleteLead(id)
//             toast.success("Data deleted successfully")
//             setLeadData((prevData) => prevData.filter((item) => item._id !== id))
//             setFilteredData((prevData) => prevData.filter((item) => item._id !== id))
//             setTotalPages(Math.ceil((filteredData.length - 1) / itemsPerPage))
//         } catch (error) {
//             console.error("Error deleting item:", error)
//             setError("Failed to delete item. Please try again.")
//         }
//     }

//     const handleUpdateClick = async (id) => {
//         navigate(`/edit-lead-data/${id}`)
//     }

//     const handlePageChange = (page) => {
//         if (page >= 1 && page <= totalPages) {
//             setCurrentPage(page)
//         }
//     }

//     const startIndex = (currentPage - 1) * itemsPerPage
//     const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

//     if (isLoading) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <Loader2 className="h-8 w-8 animate-spin" />
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
//         <div className="container mx-auto p-6">
//             <h1 className="text-3xl font-bold mb-6">Lead Data</h1>

//             {/* <div className="mb-4">
//                 <div className="relative">
//                     <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                     <Input
//                         type="text"
//                         placeholder="Search..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="pl-8"
//                     />
//                 </div>
//             </div> */}
//             <div className="rounded-md border">
//                 <Table>
//                     <TableHeader>
//                         <TableRow>
//                             <TableHead>Source</TableHead>
//                             <TableHead>First Name</TableHead>
//                             <TableHead>Last Name</TableHead>
//                             <TableHead>Phone</TableHead>
//                             <TableHead>Agent</TableHead>
//                             <TableHead>Language</TableHead>
//                             <TableHead>Disease</TableHead>
//                             <TableHead>State</TableHead>
//                             <TableHead>City</TableHead>
//                             <TableHead>Remark</TableHead>
//                             <TableHead>Comment</TableHead>
//                             <TableHead>Date</TableHead>
//                             <TableHead>Update</TableHead>
//                             <TableHead>Actions</TableHead>
//                         </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                         {paginatedData.map((item) => (
//                             <TableRow key={item._id}>
//                                 <TableCell>{item.source?.value}</TableCell>
//                                 <TableCell>{item.cm_first_name}</TableCell>
//                                 <TableCell>{item.cm_last_name}</TableCell>
//                                 <TableCell>{item.cm_phone}</TableCell>
//                                 <TableCell>{item.agent_name?.value}</TableCell>
//                                 <TableCell>{item.language?.value}</TableCell>
//                                 <TableCell>{item.disease?.value}</TableCell>
//                                 <TableCell>{item.state?.value}</TableCell>
//                                 <TableCell>{item.city}</TableCell>
//                                 <TableCell>{item.remark?.value}</TableCell>
//                                 <TableCell>{item.comment}</TableCell>
//                                 <TableCell>{item.date}</TableCell>
//                                 <TableCell>
//                                     <RotateCw
//                                         size={32}
//                                         color="#007BFF"
//                                         strokeWidth={2}
//                                         style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
//                                         onClick={() => handleUpdateClick(item._id)}
//                                         onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
//                                         onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
//                                     />
//                                 </TableCell>
//                                 <TableCell>
//                                     <AlertDialog>
//                                         <AlertDialogTrigger asChild>
//                                             <Button variant="destructive" size="icon">
//                                                 <Trash2 className="h-4 w-4" />
//                                             </Button>
//                                         </AlertDialogTrigger>
//                                         <AlertDialogContent>
//                                             <AlertDialogHeader>
//                                                 <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                                                 <AlertDialogDescription>
//                                                     This action cannot be undone. This will permanently delete the
//                                                     selected record.
//                                                 </AlertDialogDescription>
//                                             </AlertDialogHeader>
//                                             <AlertDialogFooter>
//                                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                                 <AlertDialogAction onClick={() => handleDelete(item._id)}>
//                                                     Delete
//                                                 </AlertDialogAction>
//                                             </AlertDialogFooter>
//                                         </AlertDialogContent>
//                                     </AlertDialog>

//                                 </TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </div>
//             <Pagination className="mt-4">
//                 <PaginationContent>
//                     <PaginationItem>
//                         <PaginationPrevious
//                             onClick={() => handlePageChange(currentPage - 1)}
//                             disabled={currentPage === 1}
//                         />
//                     </PaginationItem>
//                     {[...Array(totalPages)].map((_, index) => (
//                         <PaginationItem key={index}>
//                             <PaginationLink
//                                 onClick={() => handlePageChange(index + 1)}
//                                 isActive={currentPage === index + 1}
//                             >
//                                 {index + 1}
//                             </PaginationLink>
//                         </PaginationItem>
//                     ))}
//                     <PaginationItem>
//                         <PaginationNext
//                             onClick={() => handlePageChange(currentPage + 1)}
//                             disabled={currentPage === totalPages}
//                         />
//                     </PaginationItem>
//                 </PaginationContent>
//             </Pagination>
//         </div>
//     )
// }

// export default LeadPage


'use client'

import React, { useState, useEffect } from "react"
import { getAllLead, deleteLead, sendLeadToPending } from "@/services/leadService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { RotateCw } from 'lucide-react'
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
    PaginationEllipsis
} from "@/components/ui/pagination"
import { Loader2, Search, Trash2, SendHorizontal } from 'lucide-react'
import { useNavigate } from "react-router-dom"

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


const LeadPage = () => {
    const [leadData, setLeadData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")


    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const response = await getAllLead()
                setLeadData(response.data.data)
                setFilteredData(response.data.data)
                setTotalPages(Math.ceil(response.data.data.length / itemsPerPage))
            } catch (error) {
                console.error("Error fetching lead data:", error)
                setError("Failed to fetch data. Please try again later.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [itemsPerPage])

    // useEffect(() => {
    //     const results = leadData.filter((item) =>
    //         Object.values(item).some(
    //             (val) =>
    //                 typeof val === "string" &&
    //                 val.toLowerCase().includes(searchTerm.toLowerCase())
    //         )
    //     )
    //     setFilteredData(results)
    //     setTotalPages(Math.ceil(results.length / itemsPerPage))
    //     setCurrentPage(1)
    // }, [searchTerm, leadData, itemsPerPage])

    useEffect(() => {
        const results = leadData.filter((item) => {
            const matchesSearch = Object.values(item).some(
                (val) =>
                    typeof val === "string" &&
                    val.toLowerCase().includes(searchTerm.toLowerCase())
            )

            // Filter based on is_sent_to_pending status
            let matchesStatus = true
            if (filterStatus === "sent") {
                matchesStatus = item.is_sent_to_pending === true
            } else if (filterStatus === "not-sent") {
                matchesStatus = item.is_sent_to_pending === false
            }

            return matchesSearch && matchesStatus
        })
        setFilteredData(results)
        setTotalPages(Math.ceil(results.length / itemsPerPage))
        setCurrentPage(1)
    }, [searchTerm, leadData, itemsPerPage, filterStatus])

    const handleDelete = async (id) => {
        try {
            await deleteLead(id)
            toast.success("Data deleted successfully")
            setLeadData((prevData) => prevData.filter((item) => item._id !== id))
            setFilteredData((prevData) => prevData.filter((item) => item._id !== id))
            setTotalPages(Math.ceil((filteredData.length - 1) / itemsPerPage))
        } catch (error) {
            console.error("Error deleting item:", error)
            setError("Failed to delete item. Please try again.")
        }
    }

    const handleUpdateClick = async (id) => {
        navigate(`/edit-lead-data/${id}`)
    }

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const handleSendToPending = async (id) => {
        await sendLeadToPending(id)
        toast.success("Lead sent to pending successfully")
        setLeadData((prevData) => prevData.filter((item) => item._id !== id))
        setFilteredData((prevData) => prevData.filter((item) => item._id !== id))
        setTotalPages(Math.ceil((filteredData.length - 1) / itemsPerPage))
    }

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
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-semibold mb-6 text-gray-800">Lead Data</h1>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <Button
                    variant={filterStatus === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                    className={`${filterStatus === "all"
                            ? "bg-white shadow-sm"
                            : "hover:bg-gray-200"
                        }`}
                >
                    All
                </Button>
                <Button
                    variant={filterStatus === "sent" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterStatus("sent")}
                    className={`${filterStatus === "sent"
                            ? "bg-white shadow-sm"
                            : "hover:bg-gray-200"
                        }`}
                >
                    Sent
                </Button>
                <Button
                    variant={filterStatus === "not-sent" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterStatus("not-sent")}
                    className={`${filterStatus === "not-sent"
                            ? "bg-white shadow-sm"
                            : "hover:bg-gray-200"
                        }`}
                >
                    Not Sent
                </Button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
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
                                            color="#007BFF"
                                            strokeWidth={2}
                                            style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                                            onClick={() => handleSendToPending(item._id)}
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
                                            style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                                            onClick={() => handleUpdateClick(item._id)}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200">
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
        </div>
    )
}

export default LeadPage

