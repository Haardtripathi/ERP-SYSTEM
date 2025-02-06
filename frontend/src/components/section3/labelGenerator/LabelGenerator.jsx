

// "use client"

// import { useState, useEffect, useCallback } from "react"
// // import { getAllConfirmed, updateAwbNumber } from "@/services/confirmedService"
// import { getAllLabel } from "@/services/labelService"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { toast } from "react-hot-toast"
// import {
//     Pagination,
//     PaginationContent,
//     PaginationItem,
//     PaginationLink,
//     PaginationNext,
//     PaginationPrevious,
//     PaginationEllipsis,
// } from "@/components/ui/pagination"
// import { Loader2 } from "lucide-react"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// const Table = ({ children }) => (
//     <div className="overflow-x-auto">
//         <table className="w-full border-collapse min-w-max">{children}</table>
//     </div>
// )

// const TableHeader = ({ children }) => <thead className="bg-gray-200">{children}</thead>

// const TableRow = ({ children, className }) => <tr className={`${className} hover:bg-gray-100`}>{children}</tr>

// const TableHead = ({ children, className }) => (
//     <th
//         className={`${className} p-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-300 bg-gray-200 sticky top-0 z-10`}
//     >
//         {children}
//     </th>
// )

// const TableBody = ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>

// const TableCell = ({ children, className }) => (
//     <td className={`${className} p-3 text-sm text-gray-700 break-words max-w-[200px]`}>{children}</td>
// )

// const LabelGenerator = () => {
//     const [labelData, setLabelData] = useState([])
//     const [filteredData, setFilteredData] = useState([])
//     const [currentPage, setCurrentPage] = useState(1)
//     const [itemsPerPage] = useState(10)
//     const [totalPages, setTotalPages] = useState(1)
//     const [isLoading, setIsLoading] = useState(true)
//     const [error, setError] = useState(null)
//     const [searchTerm, setSearchTerm] = useState("")
//     const [paginatedData, setPaginatedData] = useState([])
//     const [searchColumn, setSearchColumn] = useState("all")
//     const [goToPage, setGoToPage] = useState("")


//     const fetchData = useCallback(async () => {
//         try {
//             setIsLoading(true)
//             const response = await getAllLabel()
//             setLabelData(response.data.data)
//             setFilteredData(response.data.data)
//             setTotalPages(Math.ceil(response.data.data.length / itemsPerPage))
//         } catch (error) {
//             console.error("Error fetching label data:", error)
//             setError("Failed to fetch data. Please try again later.")
//         } finally {
//             setIsLoading(false)
//         }
//     }, [itemsPerPage])

//     useEffect(() => {
//         fetchData()
//     }, [fetchData])

//     const applyFiltersAndPaginate = useCallback(() => {
//         const results = labelData.filter((item) => {
//             if (searchColumn === "all") {
//                 return Object.values(item).some(
//                     (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()),
//                 )
//             } else {
//                 const value = item[searchColumn]
//                 if (typeof value === "string") {
//                     return value.toLowerCase().includes(searchTerm.toLowerCase())
//                 } else if (typeof value === "object" && value !== null && "value" in value) {
//                     return value.value.toLowerCase().includes(searchTerm.toLowerCase())
//                 }
//                 return false
//             }
//         })
//         setFilteredData(results)
//         const newTotalPages = Math.ceil(results.length / itemsPerPage)
//         setTotalPages(newTotalPages)

//         const startIndex = (currentPage - 1) * itemsPerPage
//         setPaginatedData(results.slice(startIndex, startIndex + itemsPerPage))
//     }, [labelData, searchTerm, searchColumn, itemsPerPage, currentPage])

//     useEffect(() => {
//         applyFiltersAndPaginate()
//     }, [applyFiltersAndPaginate])

//     const handleGoToPage = () => {
//         const pageNumber = Number.parseInt(goToPage, 10)
//         if (pageNumber >= 1 && pageNumber <= totalPages) {
//             setCurrentPage(pageNumber)
//             setGoToPage("")
//         } else {
//             toast.error(`Please enter a valid page number between 1 and ${totalPages}`)
//         }
//     }



//     const handlePageChange = (page) => {
//         if (page >= 1 && page <= totalPages) {
//             setCurrentPage(page)
//         }
//     }

//     const handleSearch = (e) => {
//         setSearchTerm(e.target.value)
//         setCurrentPage(1)
//     }

//     const handleColumnSelect = (value) => {
//         setSearchColumn(value)
//         setCurrentPage(1)
//     }

//     const startIndex = (currentPage - 1) * itemsPerPage

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
//         <div className="container mx-auto p-4 bg-gray-50 min-h-screen max-w-[95vw]">
//             <h1 className="text-3xl font-semibold mb-6 text-gray-800">Label Data</h1>

//             <div className="mb-4 flex items-center space-x-2">
//                 <Select onValueChange={handleColumnSelect} defaultValue="all">
//                     <SelectTrigger className="w-[180px]">
//                         <SelectValue placeholder="Select column" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="all">All Columns</SelectItem>
//                         <SelectItem value="ref">Reference</SelectItem>
//                         <SelectItem value="date">Date</SelectItem>
//                         <SelectItem value="time">Time</SelectItem>
//                         <SelectItem value="source">Source</SelectItem>
//                         <SelectItem value="payment_type">Payment Type</SelectItem>
//                         <SelectItem value="sale_type">Sale Type</SelectItem>
//                         <SelectItem value="agent_name">Agent</SelectItem>
//                         <SelectItem value="cm_first_name">First Name</SelectItem>
//                         <SelectItem value="cm_last_name">Last Name</SelectItem>
//                         <SelectItem value="cm_phone">Phone</SelectItem>
//                         <SelectItem value="alternate_phone">Alternate Number</SelectItem>
//                         <SelectItem value="email">Email</SelectItem>
//                         <SelectItem value="status">Status</SelectItem>
//                         <SelectItem value="shipment_type">Shipment Type</SelectItem>
//                         <SelectItem value="address">Address</SelectItem>
//                         <SelectItem value="post_type">Post Type</SelectItem>
//                         <SelectItem value="post">Post</SelectItem>
//                         <SelectItem value="sub_district_taluka">Sub District / Taluka</SelectItem>
//                         <SelectItem value="city">City / District</SelectItem>
//                         <SelectItem value="pincode">Pincode</SelectItem>
//                         <SelectItem value="state">State</SelectItem>
//                         <SelectItem value="disease">Disease</SelectItem>
//                         <SelectItem value="amount">Amount</SelectItem>
//                         <SelectItem value="products">Products</SelectItem>
//                     </SelectContent>
//                 </Select>
//                 <Input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} className="max-w-sm" />
//             </div>

//             <div className="bg-white shadow-md rounded-lg overflow-hidden">
//                 <div className="max-w-full">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Ref</TableHead>
//                                 <TableHead>Date</TableHead>
//                                 <TableHead>Time</TableHead>
//                                 <TableHead>Source</TableHead>

//                                 <TableHead>Payment Type</TableHead>
//                                 <TableHead>Sale Type</TableHead>
//                                 <TableHead>Agent</TableHead>

//                                 <TableHead>First Name</TableHead>
//                                 <TableHead>Last Name</TableHead>
//                                 <TableHead>Phone</TableHead>
//                                 <TableHead>Alternate Number</TableHead>
//                                 <TableHead>Email</TableHead>
//                                 <TableHead>AWB Number</TableHead>

//                                 <TableHead>Comment</TableHead>
//                                 <TableHead>Shipment Type</TableHead>
//                                 <TableHead>Address</TableHead>
//                                 <TableHead>Post Type</TableHead>
//                                 <TableHead>Post</TableHead>

//                                 <TableHead>Sub District / Taluka</TableHead>
//                                 <TableHead>City / District</TableHead>
//                                 <TableHead>Pincode</TableHead>

//                                 <TableHead>State</TableHead>

//                                 <TableHead>Disease</TableHead>
//                                 <TableHead>Amount</TableHead>
//                                 <TableHead>Products</TableHead>

//                                 <TableHead>City</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {paginatedData.map((item, index) => (
//                                 <TableRow key={item._id} className={item.awb_number ? "bg-green-100" : index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
//                                     <TableCell>{item.ref}</TableCell>
//                                     <TableCell>{item.date}</TableCell>
//                                     <TableCell>{item.time}</TableCell>
//                                     <TableCell>{item.source?.value}</TableCell>

//                                     <TableCell>{item.payment_type?.value}</TableCell>
//                                     <TableCell>{item.sale_type?.value}</TableCell>

//                                     <TableCell>{item.agent_name?.value}</TableCell>
//                                     <TableCell>{item.cm_first_name}</TableCell>
//                                     <TableCell>{item.cm_last_name}</TableCell>
//                                     <TableCell>{item.cm_phone}</TableCell>
//                                     <TableCell>{item.alternate_phone}</TableCell>
//                                     <TableCell>{item.email}</TableCell>
//                                     <TableCell>
//                                         {item.awb_number}
//                                     </TableCell>
//                                     <TableCell>{item.comment}</TableCell>
//                                     <TableCell>{item.shipment_type?.value}</TableCell>
//                                     <TableCell>{item.address}</TableCell>
//                                     <TableCell>{item.post_type?.value}</TableCell>
//                                     <TableCell>{item.post}</TableCell>
//                                     <TableCell>{item.sub_district_taluka}</TableCell>
//                                     <TableCell>{item.city}</TableCell>
//                                     <TableCell>{item.pincode}</TableCell>

//                                     <TableCell>{item.state?.value}</TableCell>

//                                     <TableCell>{item.disease?.value}</TableCell>
//                                     <TableCell>{item.amount?.value}</TableCell>
//                                     <TableCell>
//                                         {Array.isArray(item.products?.value)
//                                             ? item.products.value.map((product, index) => (
//                                                 <div key={index}>
//                                                     {product.product} : {product.quantity}
//                                                 </div>
//                                             ))
//                                             : null}
//                                     </TableCell>

//                                     <TableCell>{item.city}</TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </div>
//             </div>
//             <Pagination className="mt-4 flex justify-center">
//                 <PaginationContent>
//                     <PaginationItem>
//                         <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
//                     </PaginationItem>
//                     {[...Array(totalPages)].map((_, index) => {
//                         const pageNumber = index + 1
//                         if (
//                             pageNumber === 1 ||
//                             pageNumber === totalPages ||
//                             (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
//                         ) {
//                             return (
//                                 <PaginationItem key={index}>
//                                     <PaginationLink onClick={() => handlePageChange(pageNumber)} isActive={currentPage === pageNumber}>
//                                         {pageNumber}
//                                     </PaginationLink>
//                                 </PaginationItem>
//                             )
//                         } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
//                             return <PaginationEllipsis key={index} />
//                         }
//                         return null
//                     })}
//                     <PaginationItem>
//                         <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
//                     </PaginationItem>
//                 </PaginationContent>
//             </Pagination>
//             <div className="flex items-center space-x-2">
//                 <Input
//                     type="number"
//                     placeholder="Go to page"
//                     value={goToPage}
//                     onChange={(e) => setGoToPage(e.target.value)}
//                     onKeyDown={(e) => {
//                         if (e.key === "Enter" && goToPage) {
//                             handleGoToPage()
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
//         </div>
//     )
// }

// export default LabelGenerator












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
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FormatPDF from "./FormatPDF"
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';


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

    const formatShipmentData = (data) => ({
        awb_number: data.awb_number || 'N/A',
        payment_type: data.payment_type?.value || 'N/A',
        amount: String(data.amount?.value) || 'N/A',
        shipment_type: data.shipment_type?.value || 'N/A',
        hub_id: data.shipment_type?.hub_id || 'N/A',
        date: data.date || new Date().toLocaleDateString(), // Auto-fill today’s date
        ref: data.ref || 'N/A',
        first_name: data.cm_first_name || 'N/A',
        last_name: data.cm_last_name || 'N/A',
        cm_phone: String(data.cm_phone) || 'N/A',
        address: data.address || 'N/A',
        city: data.city || 'N/A',
        sub_district: data.sub_district_taluka || 'N/A',
        post_type: data.post_type?.value || 'N/A',
        post: data.post || 'N/A',
        state: data.state?.value || 'N/A',
        pincode: data.pincode || 'N/A',
        quantity: data.products?.value?.reduce((sum, product) => sum + parseInt(product.quantity || 0), 0).toString() || 'N/A',
        product_id: data.products?.value?.map(p => p.product).join(', ') || 'N/A'
    });

    const createBarcode = (text) => {
        const canvas = document.createElement("canvas")
        JsBarcode(canvas, String(text), {
            format: "CODE128",
            width: 3, // Further increased width for larger barcode
            height: 60, // Further increased height for larger barcode
            displayValue: true,
            fontSize: 16, // Larger font size for barcode text
            textMargin: 5, // Increased margin for better spacing
            margin: 0,
        })
        return canvas.toDataURL("image/png")
    }



    const handleLabelGeneration = () => {
        const selectedData = Array.from(selectedRows.values());
        if (!selectedData.length) return;

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a5",
        });

        const pageWidth = doc.internal.pageSize.width;
        const marginLeft = 10;
        const marginRight = 10;
        const contentWidth = pageWidth - marginLeft - marginRight;

        selectedData.forEach((data, index) => {
            const shipmentData = formatShipmentData(data);
            const barcodeAWBNumber = createBarcode(shipmentData.awb_number);
            const barcodeRef = createBarcode(shipmentData.ref);


            if (index !== 0) doc.addPage();

            let yOffset = 10;

            // Barcode and Box 1 (COD content)
            const barcodeWidth = 70; // Width for the barcode
            const barcodeHeight = 25; // Height for the barcode
            const boxWidth = contentWidth - barcodeWidth - 5; // Remaining width for the box
            const boxHeight = 30; // Height for the box

            // Barcode on the left
            doc.addImage(barcodeAWBNumber, "PNG", marginLeft, yOffset, barcodeWidth, barcodeHeight);

            // Box 1 on the right (COD content)
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.rect(marginLeft + barcodeWidth + 5, yOffset, boxWidth, boxHeight);

            // Content for Box 1 (COD content)
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            const box1Line1 = "COD";
            const box1Line1X = marginLeft + barcodeWidth + 5 + boxWidth / 2;
            const box1Line1Height = doc.getTextDimensions(box1Line1).h;
            const box1Line1Y = yOffset + (boxHeight / 2) - (box1Line1Height / 2); // Exact vertical centering
            doc.text(box1Line1, box1Line1X, box1Line1Y, { align: "center" });

            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            const box1Line2 = "Please Collect";
            const box1Line2X = marginLeft + barcodeWidth + 5 + boxWidth / 2;
            const box1Line2Height = doc.getTextDimensions(box1Line2).h;
            const box1Line2Y = box1Line1Y + box1Line1Height; // No gap between rows
            doc.text(box1Line2, box1Line2X, box1Line2Y, { align: "center" });

            const box1Line3 = `Rs. ${shipmentData.amount}`;
            const box1Line3X = marginLeft + barcodeWidth + 5 + boxWidth / 2;
            const box1Line3Height = doc.getTextDimensions(box1Line3).h;
            const box1Line3Y = box1Line2Y + box1Line2Height; // No gap between rows
            doc.text(box1Line3, box1Line3X, box1Line3Y, { align: "center" });

            yOffset += boxHeight + 5; // Gap after the box

            // Box 2 (INDIAN POST content) and Barcode
            const secondBoxWidth = contentWidth - barcodeWidth - 5;

            // Box 2 on the left (INDIAN POST content)
            doc.rect(marginLeft, yOffset, secondBoxWidth, boxHeight);

            // Content for Box 2 (INDIAN POST content)
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            const box2Line1 = "INDIAN POST";
            const box2Line1X = marginLeft + secondBoxWidth / 2;
            const box2Line1Height = doc.getTextDimensions(box2Line1).h;
            const box2Line1Y = yOffset + (boxHeight / 2) - (box2Line1Height / 2); // Exact vertical centering
            doc.text(box2Line1, box2Line1X, box2Line1Y, { align: "center" });

            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            const box2Line2 = shipmentData.hub_id;
            const box2Line2X = marginLeft + secondBoxWidth / 2;
            const box2Line2Height = doc.getTextDimensions(box2Line2).h;
            const box2Line2Y = box2Line1Y + box2Line1Height; // No gap between rows
            doc.text(box2Line2, box2Line2X, box2Line2Y, { align: "center" });

            const box2Line3 = `Date: ${shipmentData.date}`;
            const box2Line3X = marginLeft + secondBoxWidth / 2;
            const box2Line3Height = doc.getTextDimensions(box2Line3).h;
            const box2Line3Y = box2Line2Y + box2Line2Height; // No gap between rows
            doc.text(box2Line3, box2Line3X, box2Line3Y, { align: "center" });

            // Barcode on the right
            doc.addImage(barcodeRef, "PNG", marginLeft + secondBoxWidth + 5, yOffset, barcodeWidth, barcodeHeight);

            yOffset += boxHeight + 10; // Gap before "Ship To:"

            // Shipping Details
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Ship To :", marginLeft, yOffset);
            yOffset += 5; // Small gap after "Ship To:"

            doc.setFont("helvetica", "normal");
            doc.text(`${shipmentData.first_name} ${shipmentData.last_name}`, marginLeft, yOffset);
            yOffset += 5; // Small gap

            doc.text(String(shipmentData.cm_phone), marginLeft, yOffset);
            yOffset += 5; // Small gap

            // Address with proper wrapping
            const addressLines = doc.splitTextToSize(String(shipmentData.address), contentWidth);
            addressLines.forEach((line) => {
                doc.text(line, marginLeft, yOffset);
                yOffset += 5; // Small gap
            });

            doc.text(`${shipmentData.city}, ${shipmentData.sub_district}`, marginLeft, yOffset);
            yOffset += 5; // Small gap

            doc.text(`${shipmentData.post}, ${shipmentData.state}`, marginLeft, yOffset);
            yOffset += 5; // Small gap

            // State and Pincode in blue
            doc.setTextColor(0, 0, 255);
            doc.text(`${shipmentData.state}.`, marginLeft, yOffset);
            yOffset += 5; // Small gap
            doc.text(`India - ${shipmentData.pincode}`, marginLeft, yOffset);
            yOffset += 10; // Small gap

            // Bottom code
            doc.setTextColor(0);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("MB/2MG/PEC/3HL", marginLeft, yOffset);
        });

        doc.save("shipping_labels.pdf");
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
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen max-w-[95vw]">
            <h1 className="text-3xl font-semibold mb-6 text-gray-800">Label Data</h1>

            <div className="mb-4 flex items-center space-x-2">
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
                        <SelectItem value="sub_district_taluka">Sub District / Taluka</SelectItem>
                        <SelectItem value="city">City / District</SelectItem>
                        <SelectItem value="pincode">Pincode</SelectItem>
                        <SelectItem value="state">State</SelectItem>
                        <SelectItem value="disease">Disease</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                        <SelectItem value="products">Products</SelectItem>
                    </SelectContent>
                </Select>
                <Input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} className="max-w-sm" />
            </div>
            <Button onClick={handleLabelGeneration}>
                Send
            </Button>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="max-w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
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
                                <TableHead>Sub District / Taluka</TableHead>
                                <TableHead>City / District</TableHead>
                                <TableHead>Pincode</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>Disease</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>City</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item, index) => (
                                <TableRow
                                    key={item._id}
                                    className={`${item.awb_number ? "bg-green-100" : index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                        } ${selectedRows.has(item._id) ? "bg-blue-50" : ""}`}
                                >
                                    <TableCell className="w-12">
                                        <Checkbox
                                            checked={selectedRows.has(item._id)}
                                            onCheckedChange={() => handleRowSelection(item._id)}
                                        />

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
                                    <TableCell>{item.awb_number}</TableCell>
                                    <TableCell>{item.comment}</TableCell>
                                    <TableCell>{item.shipment_type?.value}</TableCell>
                                    <TableCell>{item.address}</TableCell>
                                    <TableCell>{item.post_type?.value}</TableCell>
                                    <TableCell>{item.post}</TableCell>
                                    <TableCell>{item.sub_district_taluka}</TableCell>
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
                                    <TableCell>{item.city}</TableCell>
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











