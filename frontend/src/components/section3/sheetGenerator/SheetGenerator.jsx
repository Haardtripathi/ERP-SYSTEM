



"use client"

import { useState, useEffect, useCallback } from "react"
import { getAllConfirmed } from "@/services/confirmedService"
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
import { Loader2, Download, Search, Filter, RefreshCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ItemIndicator } from "@radix-ui/react-select"

// Table components remain the same
const Table = ({ children }) => (
    <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">{children}</table>
    </div>
)

const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

const TableRow = ({ children, className }) => <tr className={`${className} hover:bg-gray-100`}>{children}</tr>

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

const SheetGenerator = () => {
    // State declarations remain the same
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
    const [shipmentTypeFilter, setShipmentTypeFilter] = useState("all")
    const [isDownloading, setIsDownloading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    // Fetch data function remains the same
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
            toast.error("Failed to fetch data")
        } finally {
            setIsLoading(false)
        }
    }, [itemsPerPage])

    const refreshData = async () => {
        setRefreshing(true)
        await fetchData()
        setRefreshing(false)
        toast.success("Data refreshed successfully")
    }

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Filter and pagination logic remains the same
    const applyFiltersAndPaginate = useCallback(() => {
        const results = confirmedData.filter((item) => {
            const shipmentType = item.shipment_type?.value || ""
            if (shipmentTypeFilter !== "all") {
                if (shipmentTypeFilter === "smartship") {
                    if (!["Bluedart", "Delhivery"].includes(shipmentType)) {
                        return false
                    }
                } else if (shipmentType !== shipmentTypeFilter) {
                    return false
                }
            }

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
            }
            return false
        })

        setFilteredData(results)
        const newTotalPages = Math.ceil(results.length / itemsPerPage)
        setTotalPages(newTotalPages)
        setCurrentPage((prev) => (prev > newTotalPages ? 1 : prev))

        const startIndex = (currentPage - 1) * itemsPerPage
        setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
    }, [confirmedData, searchTerm, searchColumn, itemsPerPage, currentPage, shipmentTypeFilter])

    useEffect(() => {
        applyFiltersAndPaginate()
    }, [applyFiltersAndPaginate])

    // Download functionality
    const downloadCSV = async (type) => {
        setIsDownloading(true)
        try {
            const getIndianDateTime = () => {
                const now = new Date()
                const formatter = new Intl.DateTimeFormat("en-GB", {
                    timeZone: "Asia/Kolkata",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })

                const parts = formatter.formatToParts(now)
                const year = parts.find((p) => p.type === "year").value
                const month = parts.find((p) => p.type === "month").value
                const day = parts.find((p) => p.type === "day").value
                const hours = parts.find((p) => p.type === "hour").value
                const minutes = parts.find((p) => p.type === "minute").value

                return `${year}${month}${day}_${hours}${minutes}`
            }

            let csvContent
            let filename
            const timestamp = getIndianDateTime()

            if (type === "indian_post") {
                csvContent = convertToCSV(
                    filteredData.filter((item) => item.shipment_type?.value === "Indian Post"),
                    "indian_post",
                )
                filename = `indian_post_${timestamp}.csv`
            } else if (type === "smart_ship") {
                csvContent = convertToCSV(
                    filteredData.filter((item) => ["Bluedart", "Delhivery"].includes(item.shipment_type?.value)),
                    "smart_ship",
                )
                filename = `smart_ship_${timestamp}.csv`
            }

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", filename)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success(`${type === "indian_post" ? "Indian Post" : "SmartShip"} CSV downloaded successfully`)
        } catch (error) {
            console.error("Error downloading CSV:", error)
            toast.error("Failed to download CSV")
        } finally {
            setIsDownloading(false)
        }
    }

    const today_date = () => {
        const now = new Date();
        const options = { timeZone: "Asia/Kolkata" };
        const istDate = new Intl.DateTimeFormat("en-GB", options).format(now);
        return istDate;
    }

    // CSV conversion logic remains the same
    const convertToCSV = (data, type) => {
        if (type === "indian_post") {
            const rows = data.map((item, index) => {
                const values = [
                    index + 1,
                    "",
                    item.ref,
                    item.date,
                    item.city,
                    item.pincode,
                    `${item.cm_first_name} ${item.cm_last_name}`.trim(),
                    item.address,
                    "",
                    "",
                    item.email || "",
                    item.cm_phone,
                    "9825624002",
                    "160",
                    item.amount?.value || "",
                    "",
                    "",
                ]
                return values.join(",")
            })

            const header = [
                "SrNo",
                "Barcode",

                "Reference",
                "Date",
                "City",
                "Pincode",
                "Name",
                "Addr1",
                "Addr2",
                "Addr3",
                "AddrEmail",
                "AddrMobile",
                "SenderMobile",
                "Weight",
                "COD",
                "InsVal",
                "VPP",
            ].join(",")

            return [header, ...rows].join("\n")
        }

        if (type === "smart_ship") {
            const smartShipData = data.filter((item) => ["Bluedart", "Delhivery"].includes(item.shipment_type?.value))
            const rows = smartShipData.map((item, index) => {
                const values = [
                    `${item.cm_first_name} ${item.cm_last_name}`.trim(),
                    item.cm_phone,
                    item.address,
                    item.pincode,
                    "OTC",
                    "",//to be done total value
                    item.amount,
                    500,
                    13,
                    13,
                    13,
                    30049011,
                    12,
                    1,
                    item.ref,
                    item.ref,
                    today_date,
                    "171228"
                ]
                return values.join(",")
            })

            const header = [
                "Consignee Name",
                "Consignee Phone",
                "Consignee Address",
                "Consignee Pincode",
                "Product Name",
                "Product Invoice Value",
                "Collectable Amount",
                "Weight",
                "Height",
                "Width",
                "Lendth",
                "HSN Code",
                "GST Rate",
                "Quantity",
                "Reference Order ID",
                "Invoice No.",
                "Invoice Date(DD-MM-YYYY)",
                "HUB",





            ].join(",")

            return [header, ...rows].join("\n")
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    const handleColumnSelect = (e) => {
        setSearchColumn(e)
    }

    const handleShipmentTypeFilter = (e) => {
        setShipmentTypeFilter(e)
        setCurrentPage(1) // Reset to first page when filter changes
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const handleGoToPage = () => {
        const page = Number.parseInt(goToPage, 10)
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            setCurrentPage(page)
            setGoToPage("")
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading data...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle className="text-red-500">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                        <Button onClick={fetchData} className="mt-4">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen max-w-[95vw]">
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-2xl font-bold">Sheet Generator</CardTitle>
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
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="flex-1"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select onValueChange={handleColumnSelect} defaultValue="all">
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select column" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Columns</SelectItem>
                                    <SelectItem value="ref">Reference</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="shipment_type">Shipment Type</SelectItem>
                                    <SelectItem value="cm_first_name">First Name</SelectItem>
                                    <SelectItem value="cm_last_name">Last Name</SelectItem>
                                    <SelectItem value="cm_phone">Phone</SelectItem>
                                    <SelectItem value="city">City</SelectItem>
                                    <SelectItem value="pincode">Pincode</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select onValueChange={handleShipmentTypeFilter} defaultValue="all">
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Shipment Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="smartship">Smartship (Bluedart+Delhivery)</SelectItem>
                                    <SelectItem value="Indian Post">Indian Post</SelectItem>
                                    <SelectItem value="F2F">F2F</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <Badge variant="outline" className="mb-2">
                            {filteredData.length} records found
                        </Badge>
                        <div className="space-x-2">
                            {(shipmentTypeFilter === "Indian Post") && (
                                <Button
                                    onClick={() => downloadCSV("indian_post")}
                                    className="flex items-center gap-2"
                                    disabled={isDownloading || filteredData.length === 0}
                                    variant="outline"
                                >
                                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    Download Indian Post CSV
                                </Button>
                            )}
                            {(shipmentTypeFilter === "smartship") && (
                                <Button
                                    onClick={() => downloadCSV("smart_ship")}
                                    className="flex items-center gap-2"
                                    disabled={isDownloading || filteredData.length === 0}
                                    variant="outline"
                                >
                                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    Download SmartShip CSV
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mt-4"></div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ref</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Shipment Type</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Pincode</TableHead>
                                    <TableHead>Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((item, index) => (
                                    <TableRow key={item._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                        <TableCell>{item.ref}</TableCell>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{item.shipment_type?.value}</TableCell>
                                        <TableCell>{`${item.cm_first_name} ${item.cm_last_name}`}</TableCell>
                                        <TableCell>{item.cm_phone}</TableCell>
                                        <TableCell>{item.email}</TableCell>
                                        <TableCell>{item.address}</TableCell>
                                        <TableCell>{item.city}</TableCell>
                                        <TableCell>{item.pincode}</TableCell>
                                        <TableCell>{item.amount?.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Pagination>
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
                        className="w-24"
                        min={1}
                        max={totalPages}
                    />
                    <Button onClick={handleGoToPage} disabled={!goToPage} variant="outline" size="sm">
                        Go
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default SheetGenerator

