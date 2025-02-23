
"use client"

import { useState, useEffect, useCallback } from "react"
import { getAllLabel } from "@/services/labelService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { Checkbox } from "@/components/ui/checkbox"
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
import FormatPDF from "./FormatPDF"
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

const Table = ({ children }) => (
    <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">{children}</table>
    </div>
)

const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

const TableRow = ({ children, className }) => <tr className={`${className} hover:bg-gray-100`}>{children}</tr>
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const TableHead = ({ children, className }) => (
    <th
        className={`${className} p-3 text-left text-sm font-semiRoman text-gray-700 border-b-2 border-gray-300 bg-gray-200 sticky top-0 z-10`}
    >
        {children}
    </th>
)

const TableBody = ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>

const TableCell = ({ children, className }) => (
    <td className={`${className} p-3 text-sm text-gray-700 break-words max-w-[200px]`}>{children}</td>
)

const LabelGenerator = () => {
    const [labelData, setLabelData] = useState([])
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
    const [selectedRows, setSelectedRows] = useState(new Map());
    const [refreshing, setRefreshing] = useState(false)


    const [selectedData, setSelectedData] = useState([])

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await getAllLabel()
            setLabelData(response.data.data)
            setFilteredData(response.data.data)
            setTotalPages(Math.ceil(response.data.data.length / itemsPerPage))
        } catch (error) {
            console.error("Error fetching label data:", error)
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
        const results = labelData.filter((item) => {
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
    }, [labelData, searchTerm, searchColumn, itemsPerPage, currentPage])

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

    const handleRowSelection = (id) => {
        setSelectedRows((prevSelectedRows) => {
            const item = labelData.find((row) => row._id === id);
            if (!item) return prevSelectedRows;

            const newSelectedRows = new Map(prevSelectedRows);

            if (newSelectedRows.has(id)) {
                newSelectedRows.delete(id); // If already selected, remove it
            } else {
                newSelectedRows.set(id, item); // Otherwise, store the whole item
            }

            return newSelectedRows;
        });
    };


    const handleSelectAll = (checked) => {
        if (checked) {
            const newSelectedRows = new Map();
            paginatedData.forEach((item) => {
                newSelectedRows.set(item._id, item); // Store entire object
            });
            setSelectedRows(newSelectedRows);
        } else {
            setSelectedRows(new Map());
        }
    };

    const isAllSelected = paginatedData.length > 0 && paginatedData.every(row => selectedRows.has(row._id));
    const today_date = () => {
        const now = new Date();
        const options = { timeZone: "Asia/Kolkata" };
        const istDate = new Intl.DateTimeFormat("en-GB", options).format(now);
        return istDate;
    }

    const formatShipmentData = (data) => ({
        awb_number: data.awb_number || '',
        payment_type: data.payment_type?.value || '',
        amount: String(data.amount?.value) || '',
        shipment_type: data.shipment_type?.value || '',
        hub_id: data.shipment_type?.hub_id || '',
        date: today_date(), // Auto-fill today’s date
        ref: data.ref || '',
        first_name: data.cm_first_name || '',
        last_name: data.cm_last_name || '',
        cm_phone: String(data.cm_phone) || '',
        alternate_phone: data.alternate_phone ? String(data.alternate_phone) : '',
        address: data.address || '',
        city: data.city || '',
        district: data.district || '',
        post_type: data.post_type?.value || '',
        post: data.post || '',
        state: data.state?.value || '',
        pincode: data.pincode || '',
        quantity: data.products?.value?.reduce((sum, product) => sum + parseInt(product.quantity || 0), 0).toString() || '',
        product_id: data.products?.value?.map(p => p.product).join(', ') || '',
        product_details: formatProductData(data.products?.value)
    });
    function formatProductData(products) {
        return products.map(product => `${product.quantity}${product.product_id}`).join('_');
    }

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

    const createBarcode = (text, availableHeight) => {
        const canvas = document.createElement("canvas");
        const fullWidth = document.body.clientWidth || window.innerWidth;

        JsBarcode(canvas, String(text), {
            format: "CODE128",
            width: fullWidth / 200,
            height: availableHeight,
            displayValue: false,
            margin: 0,
        });

        return canvas.toDataURL("image/png");
    };

    // Main label generation handler
    const handleLabelGeneration = () => {
        const selectedData = Array.from(selectedRows.values());
        if (!selectedData.length) return;

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a5",
            compress: true
        });

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const marginLeft = 10;
        const marginRight = 10;
        const contentWidth = pageWidth - marginLeft - marginRight;

        selectedData.forEach((data, index) => {
            const shipmentData = formatShipmentData(data);

            if (index !== 0) doc.addPage();

            let yOffset = 10;

            // Box dimensions
            const boxWidth = 45;
            const boxHeight = 30;
            const barcodeWidth = contentWidth - boxWidth - 5;

            // Text height calculation
            doc.setFontSize(13);
            doc.setFont("helvetica", "bold");
            const textHeight = doc.getTextDimensions("Sample").h;
            const textMargin = 2;

            // Calculate remaining height for barcode
            const remainingHeight = boxHeight - textHeight - textMargin;

            // First row - AWB Barcode (text at top)
            doc.text(shipmentData.awb_number, marginLeft + (barcodeWidth / 2), yOffset + textHeight, { align: "center" });

            // Add barcode image below text
            const barcodeAWBNumber = createBarcode(shipmentData.awb_number, remainingHeight);
            doc.addImage(
                barcodeAWBNumber,
                "PNG",
                marginLeft,
                yOffset + textHeight + textMargin,
                barcodeWidth,
                remainingHeight
            );

            // Box 1 (COD content)
            doc.setDrawColor(0);
            doc.setLineWidth(1);
            doc.rect(marginLeft + barcodeWidth + 5, yOffset, boxWidth, boxHeight);

            // COD Box content
            doc.setFontSize(15);
            doc.setFont("Times", "Bold");

            // Calculate exact heights for Box 1 content
            const box1Line1 = shipmentData.payment_type === "Online" ? "Pre-Paid" : shipmentData.payment_type;
            const box1Line2 = "Please Collect";
            const box1Line3 = shipmentData.payment_type === "Online" ? "Rs. 0.00" : `Rs. ${shipmentData.amount}.00`;

            // Get precise text dimensions
            const box1Line1Height = doc.getTextDimensions(box1Line1).h;
            const box1Line2Height = doc.getTextDimensions(box1Line2).h;
            const box1Line3Height = doc.getTextDimensions(box1Line3).h;

            // Calculate total content height and spacing
            const lineSpacing = 1.5; // Adjusted line spacing
            const totalBox1Height = box1Line1Height + box1Line2Height + box1Line3Height + (2 * lineSpacing);

            // Calculate starting Y position to center content vertically
            let box1StartY = yOffset + ((boxHeight - totalBox1Height) / 2);
            const box1X = marginLeft + barcodeWidth + 5 + (boxWidth / 2);

            // Draw Box 1 content with precise positioning
            doc.text(box1Line1, box1X, box1StartY + box1Line1Height, { align: "center" });
            doc.setFont("Times", "Roman");
            doc.text(box1Line2, box1X, box1StartY + box1Line1Height + lineSpacing + box1Line2Height, { align: "center" });
            doc.text(box1Line3, box1X, box1StartY + box1Line1Height + box1Line2Height + (2 * lineSpacing) + box1Line3Height, { align: "center" });

            yOffset += boxHeight + 4;

            // Second row - Reference Barcode
            const secondBoxWidth = 45;

            // Box 2 (INDIAN POST content)
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.rect(marginLeft, yOffset, secondBoxWidth, boxHeight);

            // Box 2 content
            doc.setFontSize(14);
            doc.setFont("Times", "Roman");

            // Calculate exact heights for Box 2 content
            const box2Line1 = shipmentData.shipment_type.toUpperCase();
            const box2Line2 = shipmentData.hub_id;
            const box2Line3 = `Date : ${shipmentData.date}`;

            const box2Line1Height = doc.getTextDimensions(box2Line1).h;
            const box2Line2Height = doc.getTextDimensions(box2Line2).h;
            const box2Line3Height = doc.getTextDimensions(box2Line3).h;

            // Calculate total height and spacing for Box 2
            const totalBox2Height = box2Line1Height + box2Line2Height + box2Line3Height + (2 * lineSpacing);

            // Calculate starting Y position to center Box 2 content vertically
            let box2StartY = yOffset + ((boxHeight - totalBox2Height) / 2);
            const box2X = marginLeft + (secondBoxWidth / 2);

            // Draw Box 2 content with precise positioning
            doc.text(box2Line1, box2X, box2StartY + box2Line1Height, { align: "center" });
            doc.text(box2Line2, box2X, box2StartY + box2Line1Height + lineSpacing + box2Line2Height, { align: "center" });
            doc.text(box2Line3, box2X, box2StartY + box2Line1Height + box2Line2Height + (2 * lineSpacing) + box2Line3Height, { align: "center" });

            // Add reference barcode
            const barcodeRef = createBarcode(shipmentData.ref, remainingHeight);
            doc.addImage(
                barcodeRef,
                "PNG",
                marginLeft + secondBoxWidth + 5,
                yOffset,
                barcodeWidth,
                remainingHeight
            );

            // Add reference number text at bottom
            doc.setFontSize(13);
            doc.setFont("helvetica", "bold");
            doc.text(
                shipmentData.ref,
                marginLeft + secondBoxWidth + 5 + (barcodeWidth / 2),
                yOffset + boxHeight - textMargin,
                { align: "center" }
            );

            yOffset += boxHeight + 10;

            // Shipping Details section
            doc.setFontSize(21);
            doc.setFont("Times", "Bold");
            doc.text("Ship To :", marginLeft, yOffset);
            yOffset += 10;

            doc.setFontSize(17);
            doc.setFont("Times", "normal");
            doc.text(`${shipmentData.first_name} ${shipmentData.last_name}`, marginLeft, yOffset);
            yOffset += 8;

            const phoneNumbers = [shipmentData.cm_phone, shipmentData.alternate_phone].filter(Boolean).join(", ");
            doc.text(phoneNumbers, marginLeft, yOffset);
            yOffset += 8;

            // Address handling
            const addressParts = shipmentData.address.split(',');
            const addressLines = [];
            addressParts.forEach(part => {
                if (part.trim()) {
                    const lines = doc.splitTextToSize(part.trim(), contentWidth);
                    addressLines.push(...lines);
                }
            });

            // Print address lines
            addressLines.forEach((line) => {
                doc.text(line, marginLeft, yOffset);
                yOffset += 6;
            });

            // Calculate positions from bottom up
            const bottomMargin = 10;
            let currentY = pageHeight - bottomMargin;

            // Product details at the very bottom
            doc.setTextColor(0);
            doc.setFontSize(25);
            doc.setFont("helvetica", "bold");
            doc.text(`${shipmentData.product_details}`, marginLeft, currentY);
            currentY -= 20;

            // State and Pincode
            doc.setFontSize(19);
            doc.setFont("Times", "normal");
            doc.text(`India - ${shipmentData.pincode}`, marginLeft, currentY);
            currentY -= 8;
            doc.text(`${shipmentData.state}.`, marginLeft, currentY);
            currentY -= 8;

            // District
            doc.setFontSize(17);
            doc.text(`${shipmentData.district}`, marginLeft, currentY);
            currentY -= 8;

            // Post and Post Type
            if (shipmentData.post !== '' || shipmentData.post_type !== '') {
                doc.text(`P.O.${shipmentData.post}, ${shipmentData.post_type}`, marginLeft, currentY);
                currentY -= 8;
            }

            // City
            doc.text(`${shipmentData.city}`, marginLeft, currentY);
        });

        const timestamp = getIndianDateTime();
        doc.save(`Label_${timestamp}.pdf`);
    };


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
                <h1 className="text-3xl font-semibold text-gray-800">Label Page</h1>

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

                    <Button onClick={handleLabelGeneration}>
                        Send
                    </Button>
                </div>

            </div> */}

            <Card className="mb-6">
                {/* Header Section */}
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-3xl font-bold">Label Page</CardTitle>

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
                <CardContent>
                    <br />
                    <Button onClick={handleLabelGeneration}>
                        Send
                    </Button>
                </CardContent>

            </Card>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="max-w-full">
                    <Table>
                        <TableHeader>
                            <tr className="bg-gray-200">
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>
                                    <div>
                                        <span>Ref</span>
                                        <br />
                                        <span>AWB Number</span>
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div>
                                        <span>Date</span>
                                        <br />
                                        <span>Time</span>
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div>
                                        <span>Sale Type</span>
                                        <br />
                                        <span>Source</span>
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div>
                                        <span>Agent Name</span>
                                        <br />
                                        <span>Payment Type</span>
                                    </div>
                                </TableHead>
                                <TableHead>
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
                                        <span>Alternate Number</span>
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div>

                                        <span>Comment</span>
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div>
                                        <span>State</span>
                                        <br />
                                        <span>City</span>
                                    </div>
                                </TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead></TableHead>
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item, index) => (
                                <TableRow key={item._id} item={item} className={`bg-blue-100 hover:bg-blue-100`}>
                                    <TableCell className="w-12">
                                        <Checkbox
                                            checked={selectedRows.has(item._id)}
                                            onCheckedChange={() => handleRowSelection(item._id)}
                                        />

                                    </TableCell>
                                    {/* (Ref, AWB Number) */}

                                    <TableCell>
                                        <div>
                                            {item.ref}
                                            <br />
                                            {item.awb_number}
                                        </div>
                                    </TableCell>
                                    {/* (Date, Time) */}
                                    <TableCell>
                                        <div>
                                            {item.date}
                                            <br />
                                            {item.time}
                                        </div>
                                    </TableCell>
                                    {/* (Sale Type, Source) */}
                                    <TableCell>
                                        <div>
                                            {item.sale_type?.value}
                                            <br />
                                            {item.source?.value}
                                        </div>
                                    </TableCell>
                                    {/* (Agent Name, Payment Type) */}
                                    <TableCell>
                                        <div>
                                            {item.agent_name?.value}
                                            <br />
                                            {item.payment_type?.value}
                                        </div>
                                    </TableCell>
                                    {/* (First Name, Last Name) */}
                                    <TableCell>
                                        <div>
                                            {item.cm_first_name}
                                            <br />
                                            {item.cm_last_name}
                                        </div>
                                    </TableCell>
                                    {/* (Phone, Alternate Number) */}
                                    <TableCell>
                                        <div>
                                            {item.cm_phone}
                                            <br />
                                            {item.alternate_phone}
                                        </div>
                                    </TableCell>
                                    {/* (Status, Comment) */}
                                    <TableCell>
                                        <div>

                                            {item.comment}
                                        </div>
                                    </TableCell>
                                    {/* (State, City) */}
                                    <TableCell>
                                        <div>
                                            {item.state?.value}
                                            <br />
                                            {item.city}
                                        </div>
                                    </TableCell>
                                    {/* Product */}
                                    <TableCell>
                                        {Array.isArray(item.products?.value)
                                            ? item.products.value.map((product, idx) => (
                                                <div key={idx}>
                                                    {product.product} : {product.quantity}
                                                </div>
                                            ))
                                            : null}
                                    </TableCell>
                                    {/* Amount */}
                                    <TableCell>{item.amount?.value}</TableCell>
                                    {/* Show Button */}
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="p-1 rounded hover:bg-gray-200 transition-colors duration-200"
                                                >
                                                    Show More...
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="max-w-md">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Review Label Data</AlertDialogTitle>


                                                </AlertDialogHeader>
                                                {item && (
                                                    <div className="mt-4">
                                                        <dl className="space-y-3">
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Source:</dt>
                                                                <dd className="text-sm text-gray-800">{item.source?.value}</dd>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Name:</dt>
                                                                <dd className="text-sm text-gray-800">
                                                                    {item.cm_first_name} {item.cm_last_name}
                                                                </dd>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Phone:</dt>
                                                                <dd className="text-sm text-gray-800">{item.cm_phone}</dd>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Alternate Phone:</dt>
                                                                <dd className="text-sm text-gray-800">{item.alternate_phone}</dd>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Sale Type:</dt>
                                                                <dd className="text-sm text-gray-800">{item.sale_type.value}</dd>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Payment Type:</dt>
                                                                <dd className="text-sm text-gray-800">{item.payment_type.value}</dd>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Shipment Type:</dt>
                                                                <dd className="text-sm text-gray-800">{item.shipment_type.value}</dd>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Agent:</dt>
                                                                <dd className="text-sm text-gray-800">{item.agent_name?.value}</dd>
                                                            </div>
                                                            {/* <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Language:</dt>
                                                                <dd className="text-sm text-gray-800">{item.language?.value}</dd>
                                                            </div> */}
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Disease:</dt>
                                                                <dd className="text-sm text-gray-800">{item.disease?.value}</dd>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">State:</dt>
                                                                <dd className="text-sm text-gray-800">{item.state?.value}</dd>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">City:</dt>
                                                                <dd className="text-sm text-gray-800">{item.city}</dd>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Products:</dt>
                                                                <dd className="text-sm text-gray-800">{Array.isArray(item.products?.value)
                                                                    ? item.products.value.map((product, idx) => (
                                                                        <div key={idx}>
                                                                            {product.product} : {product.quantity}
                                                                        </div>
                                                                    ))
                                                                    : null}</dd>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Amount:</dt>
                                                                <dd className="text-sm text-gray-800">{item.amount?.value}</dd>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Remark:</dt>
                                                                <dd className="text-sm text-gray-800">{item.remark?.value}</dd>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-1">
                                                                <dt className="text-sm font-medium text-gray-600">Comment:</dt>
                                                                <dd className="text-sm text-gray-800">{item.comment}</dd>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <dt className="text-sm font-medium text-gray-600">Date:</dt>
                                                                <dd className="text-sm text-gray-800">{item.date}</dd>
                                                            </div>
                                                        </dl>
                                                    </div>
                                                )}

                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Close</AlertDialogCancel>
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

export default LabelGenerator