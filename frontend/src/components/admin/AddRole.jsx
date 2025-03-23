
// "use client"

// import { useState, useEffect } from "react"
// import { toast } from "react-hot-toast"
// import { addRole, getPagesAndColumns } from "@/services/adminService"
// import { useNavigate } from "react-router-dom"
// import { Card } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"
// import { ChevronLeft, ChevronRight } from "lucide-react"

// const AddRole = () => {
//     const navigate = useNavigate()
//     const [roleName, setRoleName] = useState("")
//     const [permissions, setPermissions] = useState([])
//     const [availablePages, setAvailablePages] = useState([])
//     const [currentSectionIndex, setCurrentSectionIndex] = useState(0)

//     useEffect(() => {
//         // Fetch all pages & columns
//         getPagesAndColumns()
//             .then((data) => {
//                 console.log(data)
//                 setAvailablePages(data)
//             })
//             .catch(() => toast.error("Failed to load pages"))
//     }, [])

//     // Handle selecting/unselecting a single column
//     const handlePermissionChange = (page, column) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]
//             const pageIndex = updatedPermissions.findIndex((p) => p.page === page)

//             if (pageIndex !== -1) {
//                 // Toggle column selection
//                 const columnIndex = updatedPermissions[pageIndex].columns.indexOf(column)
//                 if (columnIndex !== -1) {
//                     // Remove the column but keep the page entry even if columns array is empty
//                     updatedPermissions[pageIndex].columns.splice(columnIndex, 1)
//                 } else {
//                     updatedPermissions[pageIndex].columns.push(column)
//                 }
//             } else {
//                 // Add new page with column
//                 updatedPermissions.push({ page, columns: [column] })
//             }
//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for a page
//     const handleSelectAll = (page, columns) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]
//             const pageIndex = updatedPermissions.findIndex((p) => p.page === page)

//             if (pageIndex !== -1) {
//                 // If already has any columns selected, unselect all by setting empty array
//                 // but keep the page entry
//                 updatedPermissions[pageIndex].columns = []
//             } else {
//                 // Select all columns
//                 updatedPermissions.push({ page, columns: [...columns] })
//             }
//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for an entire section
//     const handleSelectAllSection = (sectionPages) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]

//             sectionPages.forEach((page) => {
//                 const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                 if (pageIndex === -1) {
//                     // If not already selected, add all columns
//                     updatedPermissions.push({ page: page.name, columns: [...page.columns] })
//                 } else {
//                     // If already exists, ensure all columns are selected
//                     updatedPermissions[pageIndex].columns = [...page.columns]
//                 }
//             })

//             return updatedPermissions
//         })
//     }

//     // Handle "Deselect All" for an entire section
//     const handleDeselectAllSection = (sectionPages) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]

//             // For all pages in this section, set columns to empty array but keep the page entries
//             sectionPages.forEach((page) => {
//                 const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                 if (pageIndex !== -1) {
//                     updatedPermissions[pageIndex].columns = []
//                 }
//             })

//             return updatedPermissions
//         })
//     }

//     // Check if all columns are selected for a page
//     const isAllSelected = (page, columns) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return pagePermissions && pagePermissions.columns.length === columns.length
//     }

//     // Check if all pages in a section are selected
//     const isAllSectionSelected = (sectionPages) => {
//         return sectionPages.every((page) => isAllSelected(page.name, page.columns))
//     }

//     // Check if any columns are selected in a section
//     const isAnySectionSelected = (sectionPages) => {
//         return sectionPages.some((page) => {
//             const pagePermissions = permissions.find((p) => p.page === page.name)
//             return pagePermissions && pagePermissions.columns.length > 0
//         })
//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         if (!roleName || permissions.length === 0) {
//             return toast.error("Role name and permissions are required")
//         }

//         // Filter out any permission entries with empty columns arrays
//         const filteredPermissions = permissions.filter((p) => p.columns.length > 0)

//         if (filteredPermissions.length === 0) {
//             return toast.error("At least one permission is required")
//         }

//         try {
//             await addRole({ roleName, permissions: filteredPermissions })
//             toast.success("Role added successfully!")
//             navigate("/roles")
//         } catch (error) {
//             toast.error("Failed to add role")
//         }
//     }

//     // Navigation between sections
//     const goToNextSection = () => {
//         if (currentSectionIndex < availablePages.length - 1) {
//             setCurrentSectionIndex(currentSectionIndex + 1)
//         }
//     }

//     const goToPreviousSection = () => {
//         if (currentSectionIndex > 0) {
//             setCurrentSectionIndex(currentSectionIndex - 1)
//         }
//     }

//     return (
//         <div className="w-full h-full flex flex-col">
//             <Card className="p-6 shadow-lg w-full flex-1 overflow-auto">
//                 <h1 className="text-2xl font-bold mb-6 text-center">Add Role</h1>
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     {/* Role Name Input */}
//                     <div className="mb-8">
//                         <label className="block font-medium mb-2 text-lg">Role Name</label>
//                         <Input
//                             type="text"
//                             value={roleName}
//                             onChange={(e) => setRoleName(e.target.value)}
//                             required
//                             className="text-lg py-6"
//                             placeholder="Enter role name"
//                         />
//                     </div>

//                     {/* Permissions Section */}
//                     <div className="bg-gray-50 p-6 rounded-lg">
//                         <h2 className="text-xl font-bold mb-4 border-b pb-2">Permissions</h2>

//                         {/* Section Navigation */}
//                         <div className="flex items-center justify-between mb-6">
//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={goToPreviousSection}
//                                 disabled={currentSectionIndex === 0}
//                                 className="flex items-center gap-1"
//                             >
//                                 <ChevronLeft size={16} /> Previous
//                             </Button>

//                             <div className="text-center font-medium">
//                                 Section {currentSectionIndex + 1} of {availablePages.length}
//                             </div>

//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={goToNextSection}
//                                 disabled={currentSectionIndex === availablePages.length - 1}
//                                 className="flex items-center gap-1"
//                             >
//                                 Next <ChevronRight size={16} />
//                             </Button>
//                         </div>

//                         {/* Current Section */}
//                         {availablePages.length > 0 && (
//                             <div key={availablePages[currentSectionIndex]?.section} className="bg-white p-5 rounded-lg shadow-sm">
//                                 <div className="flex items-center justify-between mb-4 border-b pb-3">
//                                     <h3 className="text-xl font-bold text-primary">{availablePages[currentSectionIndex]?.section}</h3>
//                                     <div className="flex gap-3">
//                                         <Button
//                                             type="button"
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={() => handleSelectAllSection(availablePages[currentSectionIndex]?.pages)}
//                                             className="text-sm"
//                                         >
//                                             Select All
//                                         </Button>
//                                         <Button
//                                             type="button"
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={() => handleDeselectAllSection(availablePages[currentSectionIndex]?.pages)}
//                                             disabled={!isAnySectionSelected(availablePages[currentSectionIndex]?.pages)}
//                                             className="text-sm"
//                                         >
//                                             Deselect All
//                                         </Button>
//                                     </div>
//                                 </div>

//                                 {availablePages[currentSectionIndex]?.pages.map((page) => (
//                                     <div key={page.name} className="mb-6 bg-gray-50 p-4 rounded-md">
//                                         <div className="flex items-center justify-between mb-3 border-b pb-2">
//                                             <h4 className="font-semibold text-lg">{page.name}</h4>
//                                             <div className="flex gap-2">
//                                                 <label className="flex items-center space-x-2 cursor-pointer">
//                                                     <Checkbox
//                                                         checked={isAllSelected(page.name, page.columns)}
//                                                         onCheckedChange={() => handleSelectAll(page.name, page.columns)}
//                                                     />
//                                                     <span>Select All</span>
//                                                 </label>
//                                             </div>
//                                         </div>
//                                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
//                                             {page.columns.map((col) => (
//                                                 <label
//                                                     key={col}
//                                                     className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
//                                                 >
//                                                     <Checkbox
//                                                         checked={permissions.find((p) => p.page === page.name)?.columns.includes(col) || false}
//                                                         onCheckedChange={() => handlePermissionChange(page.name, col)}
//                                                     />
//                                                     <span className="text-sm">{col}</span>
//                                                 </label>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}

//                         {/* Section Navigation (Bottom) */}
//                         <div className="flex items-center justify-between mt-6">
//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={goToPreviousSection}
//                                 disabled={currentSectionIndex === 0}
//                                 className="flex items-center gap-1"
//                             >
//                                 <ChevronLeft size={16} /> Previous
//                             </Button>

//                             <div className="flex gap-2">
//                                 {availablePages.map((_, index) => (
//                                     <div
//                                         key={index}
//                                         className={`w-3 h-3 rounded-full cursor-pointer ${index === currentSectionIndex ? "bg-primary" : "bg-gray-300"
//                                             }`}
//                                         onClick={() => setCurrentSectionIndex(index)}
//                                     />
//                                 ))}
//                             </div>

//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={goToNextSection}
//                                 disabled={currentSectionIndex === availablePages.length - 1}
//                                 className="flex items-center gap-1"
//                             >
//                                 Next <ChevronRight size={16} />
//                             </Button>
//                         </div>
//                     </div>

//                     {/* Submit Button */}
//                     <div className="pt-4">
//                         <Button type="submit" className="w-full py-6 text-lg font-bold">
//                             Add Role
//                         </Button>
//                     </div>
//                 </form>
//             </Card>
//         </div>
//     )
// }

// export default AddRole
































// "use client"

// import { useState, useEffect } from "react"
// import { toast } from "react-hot-toast"
// import { addRole, getPagesAndColumns } from "@/services/adminService"
// import { useNavigate } from "react-router-dom"
// import { Card } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ChevronLeft, ChevronRight, Eye, Edit, Plus, X, Check, Filter } from "lucide-react"
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuGroup,
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

// const AddRole = () => {
//     const navigate = useNavigate()
//     const [roleName, setRoleName] = useState("")
//     const [permissions, setPermissions] = useState([])
//     const [availablePages, setAvailablePages] = useState([])
//     const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
//     const [searchFilter, setSearchFilter] = useState("")

//     useEffect(() => {
//         // Fetch all pages & columns
//         getPagesAndColumns()
//             .then((data) => {
//                 console.log("Fetched data:", data)
//                 setAvailablePages(data)
//             })
//             .catch((error) => {
//                 console.error("Error fetching pages:", error)
//                 toast.error("Failed to load pages")
//             })
//     }, [])

//     // Handle selecting/unselecting a single column
//     const handlePermissionChange = (page, column) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]
//             const pageIndex = updatedPermissions.findIndex((p) => p.page === page)

//             if (pageIndex !== -1) {
//                 // Toggle column selection
//                 const columnIndex = updatedPermissions[pageIndex].columns.indexOf(column)
//                 if (columnIndex !== -1) {
//                     // Remove the column but keep the page entry even if columns array is empty
//                     updatedPermissions[pageIndex].columns.splice(columnIndex, 1)
//                 } else {
//                     updatedPermissions[pageIndex].columns.push(column)
//                 }
//             } else {
//                 // Add new page with column
//                 updatedPermissions.push({ page, columns: [column] })
//             }
//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for a page
//     const handleSelectAll = (page, columns) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]
//             const pageIndex = updatedPermissions.findIndex((p) => p.page === page)

//             if (pageIndex !== -1) {
//                 // Check if all columns are already selected
//                 const allSelected = columns.every((col) => updatedPermissions[pageIndex].columns.includes(col))

//                 if (allSelected) {
//                     // If all columns are selected, deselect all
//                     updatedPermissions[pageIndex].columns = []
//                 } else {
//                     // Otherwise, select all columns
//                     updatedPermissions[pageIndex].columns = [...columns]
//                 }
//             } else {
//                 // Select all columns
//                 updatedPermissions.push({ page, columns: [...columns] })
//             }
//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for an entire section and type (view or edit)
//     const handleSelectAllByType = (sectionPages, type) => {
//         const pagesOfType = sectionPages.filter((page) => page.type === type)

//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]

//             // Check if all pages of this type are already fully selected
//             const allTypeSelected = pagesOfType.every((page) => isAllSelected(page.name, page.columns))

//             if (allTypeSelected) {
//                 // If all are selected, deselect all of this type
//                 pagesOfType.forEach((page) => {
//                     const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                     if (pageIndex !== -1) {
//                         updatedPermissions[pageIndex].columns = []
//                     }
//                 })
//             } else {
//                 // Otherwise, select all columns for all pages of this type
//                 pagesOfType.forEach((page) => {
//                     const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                     if (pageIndex === -1) {
//                         // If not already selected, add all columns
//                         updatedPermissions.push({ page: page.name, columns: [...page.columns] })
//                     } else {
//                         // If already exists, ensure all columns are selected
//                         updatedPermissions[pageIndex].columns = [...page.columns]
//                     }
//                 })
//             }

//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for an entire section
//     const handleSelectAllSection = (sectionPages) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]

//             // Check if all pages in the section are already fully selected
//             const allSectionSelected = sectionPages.every((page) => isAllSelected(page.name, page.columns))

//             if (allSectionSelected) {
//                 // If all are selected, this becomes a "Deselect All" operation
//                 return handleDeselectAllSection(sectionPages)
//             }

//             // Otherwise, select all columns for all pages in the section
//             sectionPages.forEach((page) => {
//                 const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                 if (pageIndex === -1) {
//                     // If not already selected, add all columns
//                     updatedPermissions.push({ page: page.name, columns: [...page.columns] })
//                 } else {
//                     // If already exists, ensure all columns are selected
//                     updatedPermissions[pageIndex].columns = [...page.columns]
//                 }
//             })

//             return updatedPermissions
//         })
//     }

//     // Handle "Deselect All" for an entire section
//     const handleDeselectAllSection = (sectionPages) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]

//             // For all pages in this section, set columns to empty array but keep the page entries
//             sectionPages.forEach((page) => {
//                 const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                 if (pageIndex !== -1) {
//                     updatedPermissions[pageIndex].columns = []
//                 }
//             })

//             return updatedPermissions
//         })
//     }

//     // Check if all columns are selected for a page
//     const isAllSelected = (page, columns) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return (
//             pagePermissions &&
//             columns.length > 0 &&
//             pagePermissions.columns.length === columns.length &&
//             columns.every((col) => pagePermissions.columns.includes(col))
//         )
//     }

//     // Check if any columns are selected for a page
//     const isAnySelected = (page) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return pagePermissions && pagePermissions.columns.length > 0
//     }

//     // Get count of selected columns for a page
//     const getSelectedCount = (page, totalColumns) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return pagePermissions ? pagePermissions.columns.length : 0
//     }

//     // Check if all pages in a section are selected
//     const isAllSectionSelected = (sectionPages) => {
//         return sectionPages.every((page) => isAllSelected(page.name, page.columns))
//     }

//     // Check if any columns are selected in a section
//     const isAnySectionSelected = (sectionPages) => {
//         return sectionPages.some((page) => {
//             const pagePermissions = permissions.find((p) => p.page === page.name)
//             return pagePermissions && pagePermissions.columns.length > 0
//         })
//     }

//     // Filter columns based on search term
//     const filterColumns = (columns) => {
//         if (!searchFilter) return columns
//         return columns.filter((col) => col.toLowerCase().includes(searchFilter.toLowerCase()))
//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         if (!roleName) {
//             return toast.error("Role name is required")
//         }

//         // Filter out any permission entries with empty columns arrays
//         const filteredPermissions = permissions.filter((p) => p.columns.length > 0)

//         if (filteredPermissions.length === 0) {
//             return toast.error("At least one permission is required")
//         }

//         try {
//             await addRole({ roleName, permissions: filteredPermissions })
//             toast.success("Role added successfully!")
//             navigate("/roles")
//         } catch (error) {
//             console.error("Error adding role:", error)
//             toast.error("Failed to add role")
//         }
//     }

//     // Navigation between sections
//     const goToNextSection = () => {
//         if (currentSectionIndex < availablePages.length - 1) {
//             setCurrentSectionIndex(currentSectionIndex + 1)
//         }
//     }

//     const goToPreviousSection = () => {
//         if (currentSectionIndex > 0) {
//             setCurrentSectionIndex(currentSectionIndex - 1)
//         }
//     }

//     // Separate pages by type (view/edit)
//     const getPagesByType = (pages, type) => {
//         return pages.filter((page) => page.type === type)
//     }

//     return (
//         <div className="w-full h-full flex flex-col">
//             <Card className="p-6 shadow-lg w-full flex-1 overflow-auto">
//                 <h1 className="text-2xl font-bold mb-6 text-center">Add Role</h1>
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     {/* Role Name Input */}
//                     <div className="mb-8">
//                         <label className="block font-medium mb-2 text-lg">Role Name</label>
//                         <Input
//                             type="text"
//                             value={roleName}
//                             onChange={(e) => setRoleName(e.target.value)}
//                             required
//                             className="text-lg py-6"
//                             placeholder="Enter role name"
//                         />
//                     </div>

//                     {/* Permissions Section */}
//                     <div className="bg-gray-50 p-6 rounded-lg">
//                         <h2 className="text-xl font-bold mb-4 border-b pb-2">Permissions</h2>

//                         {/* Section Navigation */}
//                         <div className="flex items-center justify-between mb-6">
//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={goToPreviousSection}
//                                 disabled={currentSectionIndex === 0}
//                                 className="flex items-center gap-1"
//                             >
//                                 <ChevronLeft size={16} /> Previous
//                             </Button>

//                             <div className="text-center font-medium">
//                                 Section {currentSectionIndex + 1} of {availablePages.length}
//                             </div>

//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={goToNextSection}
//                                 disabled={currentSectionIndex === availablePages.length - 1}
//                                 className="flex items-center gap-1"
//                             >
//                                 Next <ChevronRight size={16} />
//                             </Button>
//                         </div>

//                         {/* Current Section */}
//                         {availablePages.length > 0 && (
//                             <div key={availablePages[currentSectionIndex]?.section} className="bg-white p-5 rounded-lg shadow-sm">
//                                 <div className="flex items-center justify-between mb-4 border-b pb-3">
//                                     <h3 className="text-xl font-bold text-primary">{availablePages[currentSectionIndex]?.section}</h3>
//                                     <div className="flex gap-3">
//                                         <Button
//                                             type="button"
//                                             variant={
//                                                 isAllSectionSelected(availablePages[currentSectionIndex]?.pages) ? "destructive" : "outline"
//                                             }
//                                             size="sm"
//                                             onClick={() => handleSelectAllSection(availablePages[currentSectionIndex]?.pages)}
//                                             className="text-sm"
//                                         >
//                                             {isAllSectionSelected(availablePages[currentSectionIndex]?.pages) ? "Deselect All" : "Select All"}
//                                         </Button>
//                                     </div>
//                                 </div>

//                                 {/* Search Filter */}
//                                 <div className="relative mb-4">
//                                     <Input
//                                         type="text"
//                                         placeholder="Filter columns..."
//                                         value={searchFilter}
//                                         onChange={(e) => setSearchFilter(e.target.value)}
//                                         className="pl-10"
//                                     />
//                                     <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                                     {searchFilter && (
//                                         <Button
//                                             variant="ghost"
//                                             size="sm"
//                                             className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
//                                             onClick={() => setSearchFilter("")}
//                                         >
//                                             <X className="h-4 w-4" />
//                                         </Button>
//                                     )}
//                                 </div>

//                                 {/* Tabs for View/Edit separation */}
//                                 <Tabs defaultValue="view" className="mt-6">
//                                     <TabsList className="grid w-full grid-cols-2 mb-4">
//                                         <TabsTrigger value="view" className="flex items-center gap-2">
//                                             <Eye className="h-4 w-4" /> View Permissions
//                                         </TabsTrigger>
//                                         <TabsTrigger value="edit" className="flex items-center gap-2">
//                                             <Edit className="h-4 w-4" /> Edit Permissions
//                                         </TabsTrigger>
//                                     </TabsList>

//                                     {/* View Permissions Tab */}
//                                     <TabsContent value="view" className="space-y-4">
//                                         <div className="flex justify-between items-center mb-2">
//                                             <h4 className="font-medium text-sm text-muted-foreground">View Pages</h4>
//                                             <Button
//                                                 type="button"
//                                                 variant="outline"
//                                                 size="sm"
//                                                 onClick={() => handleSelectAllByType(availablePages[currentSectionIndex]?.pages, "view")}
//                                                 className="text-xs"
//                                             >
//                                                 Select All View Pages
//                                             </Button>
//                                         </div>

//                                         {getPagesByType(availablePages[currentSectionIndex]?.pages, "view").map((page) => (
//                                             <PagePermissionCard
//                                                 key={page.name}
//                                                 page={page}
//                                                 permissions={permissions}
//                                                 isAllSelected={isAllSelected}
//                                                 isAnySelected={isAnySelected}
//                                                 getSelectedCount={getSelectedCount}
//                                                 handleSelectAll={handleSelectAll}
//                                                 handlePermissionChange={handlePermissionChange}
//                                                 filterColumns={filterColumns}
//                                                 searchFilter={searchFilter}
//                                             />
//                                         ))}
//                                     </TabsContent>

//                                     {/* Edit Permissions Tab */}
//                                     <TabsContent value="edit" className="space-y-4">
//                                         <div className="flex justify-between items-center mb-2">
//                                             <h4 className="font-medium text-sm text-muted-foreground">Edit Pages</h4>
//                                             <Button
//                                                 type="button"
//                                                 variant="outline"
//                                                 size="sm"
//                                                 onClick={() => handleSelectAllByType(availablePages[currentSectionIndex]?.pages, "edit")}
//                                                 className="text-xs"
//                                             >
//                                                 Select All Edit Pages
//                                             </Button>
//                                         </div>

//                                         {getPagesByType(availablePages[currentSectionIndex]?.pages, "edit").map((page) => (
//                                             <PagePermissionCard
//                                                 key={page.name}
//                                                 page={page}
//                                                 permissions={permissions}
//                                                 isAllSelected={isAllSelected}
//                                                 isAnySelected={isAnySelected}
//                                                 getSelectedCount={getSelectedCount}
//                                                 handleSelectAll={handleSelectAll}
//                                                 handlePermissionChange={handlePermissionChange}
//                                                 filterColumns={filterColumns}
//                                                 searchFilter={searchFilter}
//                                             />
//                                         ))}
//                                     </TabsContent>
//                                 </Tabs>
//                             </div>
//                         )}

//                         {/* Section Navigation (Bottom) */}
//                         <div className="flex items-center justify-between mt-6">
//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={goToPreviousSection}
//                                 disabled={currentSectionIndex === 0}
//                                 className="flex items-center gap-1"
//                             >
//                                 <ChevronLeft size={16} /> Previous
//                             </Button>

//                             <div className="flex gap-2">
//                                 {availablePages.map((_, index) => (
//                                     <div
//                                         key={index}
//                                         className={`w-3 h-3 rounded-full cursor-pointer ${index === currentSectionIndex ? "bg-primary" : "bg-gray-300"
//                                             }`}
//                                         onClick={() => setCurrentSectionIndex(index)}
//                                     />
//                                 ))}
//                             </div>

//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={goToNextSection}
//                                 disabled={currentSectionIndex === availablePages.length - 1}
//                                 className="flex items-center gap-1"
//                             >
//                                 Next <ChevronRight size={16} />
//                             </Button>
//                         </div>
//                     </div>

//                     {/* Submit Button */}
//                     <div className="pt-4">
//                         <Button type="submit" className="w-full py-6 text-lg font-bold">
//                             Add Role
//                         </Button>
//                     </div>
//                 </form>
//             </Card>
//         </div>
//     )
// }

// // Component for each page's permission card
// const PagePermissionCard = ({
//     page,
//     permissions,
//     isAllSelected,
//     isAnySelected,
//     getSelectedCount,
//     handleSelectAll,
//     handlePermissionChange,
//     filterColumns,
//     searchFilter,
// }) => {
//     const [showAllColumns, setShowAllColumns] = useState(false)
//     const filteredColumns = filterColumns(page.columns)
//     const selectedCount = getSelectedCount(page.name, page.columns)
//     const totalColumns = page.columns.length

//     // Display only first 6 columns unless showAllColumns is true
//     const displayColumns = showAllColumns ? filteredColumns : filteredColumns.slice(0, 6)
//     const hasMoreColumns = filteredColumns.length > 6 && !showAllColumns

//     return (
//         <Card className="p-4 shadow-sm">
//             <div className="flex items-center justify-between mb-3 pb-2 border-b">
//                 <div>
//                     <h4 className="font-semibold text-lg">{page.name}</h4>
//                     <div className="flex items-center gap-2 mt-1">
//                         <Badge variant={selectedCount > 0 ? "default" : "outline"} className="text-xs">
//                             {selectedCount} of {totalColumns} selected
//                         </Badge>
//                     </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                     <Button
//                         type="button"
//                         variant={isAllSelected(page.name, page.columns) ? "destructive" : "outline"}
//                         size="sm"
//                         onClick={() => handleSelectAll(page.name, page.columns)}
//                         className="text-xs"
//                     >
//                         {isAllSelected(page.name, page.columns) ? "Deselect All" : "Select All"}
//                     </Button>

//                     <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                             <Button variant="outline" size="sm" className="text-xs">
//                                 <Plus className="h-3 w-3 mr-1" /> Add Columns
//                             </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent className="w-56">
//                             <DropdownMenuLabel>Available Columns</DropdownMenuLabel>
//                             <DropdownMenuSeparator />
//                             <div className="max-h-[300px] overflow-y-auto">
//                                 <DropdownMenuGroup>
//                                     {page.columns.map((col) => {
//                                         const isSelected = permissions.find((p) => p.page === page.name)?.columns.includes(col) || false
//                                         return (
//                                             <DropdownMenuItem
//                                                 key={col}
//                                                 className="flex items-center justify-between cursor-pointer"
//                                                 onClick={() => handlePermissionChange(page.name, col)}
//                                             >
//                                                 <span>{col}</span>
//                                                 {isSelected && <Check className="h-4 w-4 text-primary" />}
//                                             </DropdownMenuItem>
//                                         )
//                                     })}
//                                 </DropdownMenuGroup>
//                             </div>
//                         </DropdownMenuContent>
//                     </DropdownMenu>
//                 </div>
//             </div>

//             {/* Selected columns as tags */}
//             <div className="flex flex-wrap gap-2 mt-3">
//                 {displayColumns.map((col) => {
//                     const isSelected = permissions.find((p) => p.page === page.name)?.columns.includes(col) || false
//                     return (
//                         <div
//                             key={col}
//                             className={`
//                                 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
//                                 transition-colors cursor-pointer
//                                 ${isSelected
//                                     ? "bg-primary text-primary-foreground hover:bg-primary/90"
//                                     : "bg-muted hover:bg-muted/80 text-muted-foreground"
//                                 }
//                             `}
//                             onClick={() => handlePermissionChange(page.name, col)}
//                         >
//                             {col}
//                             {isSelected ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
//                         </div>
//                     )
//                 })}

//                 {hasMoreColumns && (
//                     <Button
//                         variant="ghost"
//                         size="sm"
//                         className="text-xs h-8 rounded-full"
//                         onClick={() => setShowAllColumns(true)}
//                     >
//                         +{filteredColumns.length - 6} more
//                     </Button>
//                 )}

//                 {showAllColumns && filteredColumns.length > 6 && (
//                     <Button
//                         variant="ghost"
//                         size="sm"
//                         className="text-xs h-8 rounded-full"
//                         onClick={() => setShowAllColumns(false)}
//                     >
//                         Show less
//                     </Button>
//                 )}

//                 {filteredColumns.length === 0 && (
//                     <div className="text-sm text-muted-foreground italic">No columns match your filter</div>
//                 )}
//             </div>
//         </Card>
//     )
// }

// export default AddRole



























// "use client"

// import { useState, useEffect } from "react"
// import { toast } from "react-hot-toast"
// import { addRole, getPagesAndColumns } from "@/services/adminService"
// import { useNavigate } from "react-router-dom"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ChevronLeft, ChevronRight, Eye, Edit, Plus, X, Check, Search, ArrowLeft } from "lucide-react"
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuGroup,
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
// import { Progress } from "@/components/ui/progress"
// import { ScrollArea } from "@/components/ui/scroll-area"

// const AddRole = () => {
//     const navigate = useNavigate()
//     const [roleName, setRoleName] = useState("")
//     const [permissions, setPermissions] = useState([])
//     const [availablePages, setAvailablePages] = useState([])
//     const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
//     const [searchFilter, setSearchFilter] = useState("")
//     const [loading, setLoading] = useState(true)

//     useEffect(() => {
//         // Fetch all pages & columns
//         getPagesAndColumns()
//             .then((data) => {
//                 console.log("Fetched data:", data)
//                 setAvailablePages(data)
//                 setLoading(false)
//             })
//             .catch((error) => {
//                 console.error("Error fetching pages:", error)
//                 toast.error("Failed to load pages")
//                 setLoading(false)
//             })
//     }, [])

//     // Handle selecting/unselecting a single column
//     const handlePermissionChange = (page, column) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]
//             const pageIndex = updatedPermissions.findIndex((p) => p.page === page)

//             if (pageIndex !== -1) {
//                 // Toggle column selection
//                 const columnIndex = updatedPermissions[pageIndex].columns.indexOf(column)
//                 if (columnIndex !== -1) {
//                     // Remove the column but keep the page entry even if columns array is empty
//                     updatedPermissions[pageIndex].columns.splice(columnIndex, 1)
//                 } else {
//                     updatedPermissions[pageIndex].columns.push(column)
//                 }
//             } else {
//                 // Add new page with column
//                 updatedPermissions.push({ page, columns: [column] })
//             }
//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for a page
//     const handleSelectAll = (page, columns) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]
//             const pageIndex = updatedPermissions.findIndex((p) => p.page === page)

//             if (pageIndex !== -1) {
//                 // Check if all columns are already selected
//                 const allSelected = columns.every((col) => updatedPermissions[pageIndex].columns.includes(col))

//                 if (allSelected) {
//                     // If all columns are selected, deselect all
//                     updatedPermissions[pageIndex].columns = []
//                 } else {
//                     // Otherwise, select all columns
//                     updatedPermissions[pageIndex].columns = [...columns]
//                 }
//             } else {
//                 // Select all columns
//                 updatedPermissions.push({ page, columns: [...columns] })
//             }
//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for an entire section and type (view or edit)
//     const handleSelectAllByType = (sectionPages, type) => {
//         const pagesOfType = sectionPages.filter((page) => page.type === type)

//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]

//             // Check if all pages of this type are already fully selected
//             const allTypeSelected = pagesOfType.every((page) => isAllSelected(page.name, page.columns))

//             if (allTypeSelected) {
//                 // If all are selected, deselect all of this type
//                 pagesOfType.forEach((page) => {
//                     const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                     if (pageIndex !== -1) {
//                         updatedPermissions[pageIndex].columns = []
//                     }
//                 })
//             } else {
//                 // Otherwise, select all columns for all pages of this type
//                 pagesOfType.forEach((page) => {
//                     const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                     if (pageIndex === -1) {
//                         // If not already selected, add all columns
//                         updatedPermissions.push({ page: page.name, columns: [...page.columns] })
//                     } else {
//                         // If already exists, ensure all columns are selected
//                         updatedPermissions[pageIndex].columns = [...page.columns]
//                     }
//                 })
//             }

//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for an entire section
//     const handleSelectAllSection = (sectionPages) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]

//             // Check if all pages in the section are already fully selected
//             const allSectionSelected = sectionPages.every((page) => isAllSelected(page.name, page.columns))

//             if (allSectionSelected) {
//                 // If all are selected, this becomes a "Deselect All" operation
//                 return handleDeselectAllSection(sectionPages)
//             }

//             // Otherwise, select all columns for all pages in the section
//             sectionPages.forEach((page) => {
//                 const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                 if (pageIndex === -1) {
//                     // If not already selected, add all columns
//                     updatedPermissions.push({ page: page.name, columns: [...page.columns] })
//                 } else {
//                     // If already exists, ensure all columns are selected
//                     updatedPermissions[pageIndex].columns = [...page.columns]
//                 }
//             })

//             return updatedPermissions
//         })
//     }

//     // Handle "Deselect All" for an entire section
//     const handleDeselectAllSection = (sectionPages) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]

//             // For all pages in this section, set columns to empty array but keep the page entries
//             sectionPages.forEach((page) => {
//                 const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                 if (pageIndex !== -1) {
//                     updatedPermissions[pageIndex].columns = []
//                 }
//             })

//             return updatedPermissions
//         })
//     }

//     // Check if all columns are selected for a page
//     const isAllSelected = (page, columns) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return (
//             pagePermissions &&
//             columns.length > 0 &&
//             pagePermissions.columns.length === columns.length &&
//             columns.every((col) => pagePermissions.columns.includes(col))
//         )
//     }

//     // Check if any columns are selected for a page
//     const isAnySelected = (page) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return pagePermissions && pagePermissions.columns.length > 0
//     }

//     // Get count of selected columns for a page
//     const getSelectedCount = (page, totalColumns) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return pagePermissions ? pagePermissions.columns.length : 0
//     }

//     // Check if all pages in a section are selected
//     const isAllSectionSelected = (sectionPages) => {
//         return sectionPages.every((page) => isAllSelected(page.name, page.columns))
//     }

//     // Check if any columns are selected in a section
//     const isAnySectionSelected = (sectionPages) => {
//         return sectionPages.some((page) => {
//             const pagePermissions = permissions.find((p) => p.page === page.name)
//             return pagePermissions && pagePermissions.columns.length > 0
//         })
//     }

//     // Filter columns based on search term
//     const filterColumns = (columns) => {
//         if (!searchFilter) return columns
//         return columns.filter((col) => col.toLowerCase().includes(searchFilter.toLowerCase()))
//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         if (!roleName) {
//             return toast.error("Role name is required")
//         }

//         // Filter out any permission entries with empty columns arrays
//         const filteredPermissions = permissions.filter((p) => p.columns.length > 0)

//         if (filteredPermissions.length === 0) {
//             return toast.error("At least one permission is required")
//         }

//         try {
//             await addRole({ roleName, permissions: filteredPermissions })
//             toast.success("Role added successfully!")
//             navigate("/roles")
//         } catch (error) {
//             console.error("Error adding role:", error)
//             toast.error("Failed to add role")
//         }
//     }

//     // Navigation between sections
//     const goToNextSection = () => {
//         if (currentSectionIndex < availablePages.length - 1) {
//             setCurrentSectionIndex(currentSectionIndex + 1)
//         }
//     }

//     const goToPreviousSection = () => {
//         if (currentSectionIndex > 0) {
//             setCurrentSectionIndex(currentSectionIndex - 1)
//         }
//     }

//     // Separate pages by type (view/edit)
//     const getPagesByType = (pages, type) => {
//         return pages.filter((page) => page.type === type)
//     }

//     // Calculate total permissions selected
//     const getTotalSelectedPermissions = () => {
//         return permissions.reduce((total, page) => total + page.columns.length, 0)
//     }

//     // Calculate total available permissions
//     const getTotalAvailablePermissions = () => {
//         return availablePages.reduce((total, section) => {
//             return (
//                 total +
//                 section.pages.reduce((pageTotal, page) => {
//                     return pageTotal + page.columns.length
//                 }, 0)
//             )
//         }, 0)
//     }

//     const totalSelected = getTotalSelectedPermissions()
//     const totalAvailable = getTotalAvailablePermissions()
//     const percentageComplete = totalAvailable > 0 ? (totalSelected / totalAvailable) * 100 : 0

//     return (
//         <div className="w-full max-w-5xl mx-auto">
//             <Card className="shadow-sm">
//                 <CardHeader className="pb-3 border-b">
//                     <div className="flex items-center justify-between">
//                         <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/roles")}>
//                             <ArrowLeft className="h-4 w-4" /> Back to Roles
//                         </Button>
//                         <CardTitle className="text-xl font-semibold">Add New Role</CardTitle>
//                         <div className="w-20" /> {/* Spacer for alignment */}
//                     </div>
//                 </CardHeader>

//                 <CardContent className="p-4 pt-5">
//                     <form onSubmit={handleSubmit} className="space-y-5">
//                         {/* Role Name Input */}
//                         <div className="space-y-2">
//                             <div className="flex items-center justify-between">
//                                 <label className="text-sm font-medium">Role Name</label>
//                                 <div className="text-xs text-muted-foreground">
//                                     {totalSelected} of {totalAvailable} permissions selected
//                                 </div>
//                             </div>
//                             <Input
//                                 type="text"
//                                 value={roleName}
//                                 onChange={(e) => setRoleName(e.target.value)}
//                                 required
//                                 placeholder="Enter role name"
//                                 className="h-9"
//                             />
//                             <Progress value={percentageComplete} className="h-1.5" />
//                         </div>

//                         {/* Permissions Section */}
//                         <div className="bg-muted/40 rounded-md">
//                             <div className="flex items-center justify-between p-3 border-b">
//                                 <h2 className="text-sm font-medium">Permissions</h2>

//                                 {/* Section Navigation */}
//                                 <div className="flex items-center gap-1 text-xs">
//                                     <Button
//                                         type="button"
//                                         variant="ghost"
//                                         size="sm"
//                                         onClick={goToPreviousSection}
//                                         disabled={currentSectionIndex === 0}
//                                         className="h-7 px-2"
//                                     >
//                                         <ChevronLeft size={14} />
//                                     </Button>

//                                     <span className="text-muted-foreground">
//                                         Section {currentSectionIndex + 1} of {availablePages.length}
//                                     </span>

//                                     <Button
//                                         type="button"
//                                         variant="ghost"
//                                         size="sm"
//                                         onClick={goToNextSection}
//                                         disabled={currentSectionIndex === availablePages.length - 1}
//                                         className="h-7 px-2"
//                                     >
//                                         <ChevronRight size={14} />
//                                     </Button>
//                                 </div>
//                             </div>

//                             {/* Current Section */}
//                             {loading ? (
//                                 <div className="p-8 text-center">
//                                     <div className="animate-pulse">Loading permissions...</div>
//                                 </div>
//                             ) : availablePages.length > 0 ? (
//                                 <div className="p-3">
//                                     <div className="flex items-center justify-between mb-3">
//                                         <h3 className="text-sm font-medium text-primary">{availablePages[currentSectionIndex]?.section}</h3>
//                                         <Button
//                                             type="button"
//                                             variant={
//                                                 isAllSectionSelected(availablePages[currentSectionIndex]?.pages) ? "destructive" : "outline"
//                                             }
//                                             size="sm"
//                                             onClick={() => handleSelectAllSection(availablePages[currentSectionIndex]?.pages)}
//                                             className="h-7 text-xs"
//                                         >
//                                             {isAllSectionSelected(availablePages[currentSectionIndex]?.pages) ? "Deselect All" : "Select All"}
//                                         </Button>
//                                     </div>

//                                     {/* Search Filter */}
//                                     <div className="relative mb-3">
//                                         <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
//                                         <Input
//                                             type="text"
//                                             placeholder="Filter columns..."
//                                             value={searchFilter}
//                                             onChange={(e) => setSearchFilter(e.target.value)}
//                                             className="pl-8 h-8 text-sm"
//                                         />
//                                         {searchFilter && (
//                                             <Button
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
//                                                 onClick={() => setSearchFilter("")}
//                                             >
//                                                 <X className="h-3.5 w-3.5" />
//                                             </Button>
//                                         )}
//                                     </div>

//                                     {/* Tabs for View/Edit separation */}
//                                     <Tabs defaultValue="view" className="mt-3">
//                                         <TabsList className="grid w-full grid-cols-2 h-8">
//                                             <TabsTrigger value="view" className="text-xs flex items-center gap-1.5">
//                                                 <Eye className="h-3.5 w-3.5" /> View Permissions
//                                             </TabsTrigger>
//                                             <TabsTrigger value="edit" className="text-xs flex items-center gap-1.5">
//                                                 <Edit className="h-3.5 w-3.5" /> Edit Permissions
//                                             </TabsTrigger>
//                                         </TabsList>

//                                         {/* View Permissions Tab */}
//                                         <TabsContent value="view" className="mt-3">
//                                             <div className="flex justify-between items-center mb-2">
//                                                 <h4 className="text-xs text-muted-foreground">View Pages</h4>
//                                                 <Button
//                                                     type="button"
//                                                     variant="outline"
//                                                     size="sm"
//                                                     onClick={() => handleSelectAllByType(availablePages[currentSectionIndex]?.pages, "view")}
//                                                     className="h-7 text-xs"
//                                                 >
//                                                     Select All View
//                                                 </Button>
//                                             </div>

//                                             <ScrollArea className="h-[calc(100vh-400px)] pr-3">
//                                                 <Accordion type="multiple" className="space-y-2">
//                                                     {getPagesByType(availablePages[currentSectionIndex]?.pages, "view").map((page) => (
//                                                         <PagePermissionCard
//                                                             key={page.name}
//                                                             page={page}
//                                                             permissions={permissions}
//                                                             isAllSelected={isAllSelected}
//                                                             isAnySelected={isAnySelected}
//                                                             getSelectedCount={getSelectedCount}
//                                                             handleSelectAll={handleSelectAll}
//                                                             handlePermissionChange={handlePermissionChange}
//                                                             filterColumns={filterColumns}
//                                                             searchFilter={searchFilter}
//                                                         />
//                                                     ))}
//                                                 </Accordion>
//                                             </ScrollArea>
//                                         </TabsContent>

//                                         {/* Edit Permissions Tab */}
//                                         <TabsContent value="edit" className="mt-3">
//                                             <div className="flex justify-between items-center mb-2">
//                                                 <h4 className="text-xs text-muted-foreground">Edit Pages</h4>
//                                                 <Button
//                                                     type="button"
//                                                     variant="outline"
//                                                     size="sm"
//                                                     onClick={() => handleSelectAllByType(availablePages[currentSectionIndex]?.pages, "edit")}
//                                                     className="h-7 text-xs"
//                                                 >
//                                                     Select All Edit
//                                                 </Button>
//                                             </div>

//                                             <ScrollArea className="h-[calc(100vh-400px)] pr-3">
//                                                 <Accordion type="multiple" className="space-y-2">
//                                                     {getPagesByType(availablePages[currentSectionIndex]?.pages, "edit").map((page) => (
//                                                         <PagePermissionCard
//                                                             key={page.name}
//                                                             page={page}
//                                                             permissions={permissions}
//                                                             isAllSelected={isAllSelected}
//                                                             isAnySelected={isAnySelected}
//                                                             getSelectedCount={getSelectedCount}
//                                                             handleSelectAll={handleSelectAll}
//                                                             handlePermissionChange={handlePermissionChange}
//                                                             filterColumns={filterColumns}
//                                                             searchFilter={searchFilter}
//                                                         />
//                                                     ))}
//                                                 </Accordion>
//                                             </ScrollArea>
//                                         </TabsContent>
//                                     </Tabs>
//                                 </div>
//                             ) : (
//                                 <div className="p-8 text-center text-muted-foreground">No permissions available</div>
//                             )}

//                             {/* Section Navigation (Bottom) */}
//                             <div className="flex items-center justify-center gap-1 p-3 border-t">
//                                 {availablePages.map((_, index) => (
//                                     <div
//                                         key={index}
//                                         className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${index === currentSectionIndex ? "bg-primary" : "bg-gray-300"
//                                             }`}
//                                         onClick={() => setCurrentSectionIndex(index)}
//                                     />
//                                 ))}
//                             </div>
//                         </div>
//                     </form>
//                 </CardContent>

//                 <CardFooter className="border-t p-4">
//                     <div className="flex justify-end gap-3 w-full">
//                         <Button type="button" variant="outline" onClick={() => navigate("/roles")}>
//                             Cancel
//                         </Button>
//                         <Button type="submit" onClick={handleSubmit} disabled={!roleName || getTotalSelectedPermissions() === 0}>
//                             Add Role
//                         </Button>
//                     </div>
//                 </CardFooter>
//             </Card>
//         </div>
//     )
// }

// // Component for each page's permission card
// const PagePermissionCard = ({
//     page,
//     permissions,
//     isAllSelected,
//     isAnySelected,
//     getSelectedCount,
//     handleSelectAll,
//     handlePermissionChange,
//     filterColumns,
//     searchFilter,
// }) => {
//     const [showAllColumns, setShowAllColumns] = useState(false)
//     const filteredColumns = filterColumns(page.columns)
//     const selectedCount = getSelectedCount(page.name, page.columns)
//     const totalColumns = page.columns.length

//     // Display only first 5 columns unless showAllColumns is true
//     const displayColumns = showAllColumns ? filteredColumns : filteredColumns.slice(0, 5)
//     const hasMoreColumns = filteredColumns.length > 5 && !showAllColumns

//     const selectionPercentage = totalColumns > 0 ? (selectedCount / totalColumns) * 100 : 0

//     return (
//         <AccordionItem value={page.name} className="border rounded-md overflow-hidden">
//             <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
//                 <div className="flex items-center justify-between w-full">
//                     <div className="flex items-center gap-2">
//                         <span className="font-medium">{page.name}</span>
//                         <Badge variant={selectedCount > 0 ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
//                             {selectedCount}/{totalColumns}
//                         </Badge>
//                     </div>
//                     <Progress value={selectionPercentage} className="w-16 h-1.5 mr-2" />
//                 </div>
//             </AccordionTrigger>
//             <AccordionContent className="px-3 pb-3">
//                 <div className="flex items-center justify-between mb-2">
//                     <div className="text-xs text-muted-foreground">
//                         {selectedCount} of {totalColumns} columns selected
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <Button
//                             type="button"
//                             variant={isAllSelected(page.name, page.columns) ? "destructive" : "outline"}
//                             size="sm"
//                             onClick={() => handleSelectAll(page.name, page.columns)}
//                             className="h-7 text-xs"
//                         >
//                             {isAllSelected(page.name, page.columns) ? "Deselect All" : "Select All"}
//                         </Button>

//                         <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                                 <Button variant="outline" size="sm" className="h-7 text-xs">
//                                     <Plus className="h-3 w-3 mr-1" /> Columns
//                                 </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent className="w-48">
//                                 <DropdownMenuLabel className="text-xs">Available Columns</DropdownMenuLabel>
//                                 <DropdownMenuSeparator />
//                                 <ScrollArea className="h-[200px]">
//                                     <DropdownMenuGroup>
//                                         {page.columns.map((col) => {
//                                             const isSelected = permissions.find((p) => p.page === page.name)?.columns.includes(col) || false
//                                             return (
//                                                 <DropdownMenuItem
//                                                     key={col}
//                                                     className="flex items-center justify-between cursor-pointer text-xs py-1.5"
//                                                     onClick={() => handlePermissionChange(page.name, col)}
//                                                 >
//                                                     <span>{col}</span>
//                                                     {isSelected && <Check className="h-3 w-3 text-primary" />}
//                                                 </DropdownMenuItem>
//                                             )
//                                         })}
//                                     </DropdownMenuGroup>
//                                 </ScrollArea>
//                             </DropdownMenuContent>
//                         </DropdownMenu>
//                     </div>
//                 </div>

//                 {/* Selected columns as tags */}
//                 <div className="flex flex-wrap gap-1.5 mt-2">
//                     {displayColumns.map((col) => {
//                         const isSelected = permissions.find((p) => p.page === page.name)?.columns.includes(col) || false
//                         return (
//                             <div
//                                 key={col}
//                                 className={`
//                   flex items-center gap-1 px-2 py-1 rounded-md text-xs
//                   transition-colors cursor-pointer
//                   ${isSelected
//                                         ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
//                                         : "bg-muted hover:bg-muted/80 text-muted-foreground border border-transparent"
//                                     }
//                 `}
//                                 onClick={() => handlePermissionChange(page.name, col)}
//                             >
//                                 {col}
//                                 {isSelected ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
//                             </div>
//                         )
//                     })}

//                     {hasMoreColumns && (
//                         <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setShowAllColumns(true)}>
//                             +{filteredColumns.length - 5} more
//                         </Button>
//                     )}

//                     {showAllColumns && filteredColumns.length > 5 && (
//                         <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setShowAllColumns(false)}>
//                             Show less
//                         </Button>
//                     )}

//                     {filteredColumns.length === 0 && (
//                         <div className="text-xs text-muted-foreground italic">No columns match your filter</div>
//                     )}
//                 </div>
//             </AccordionContent>
//         </AccordionItem>
//     )
// }

// export default AddRole

















// "use client"

// import { useState, useEffect } from "react"
// import { toast } from "react-hot-toast"
// import { addRole, getPagesAndColumns } from "@/services/adminService"
// import { useNavigate } from "react-router-dom"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ChevronLeft, ChevronRight, Eye, Edit, ArrowLeft } from "lucide-react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// const AddRole = () => {
//     const navigate = useNavigate()
//     const [roleName, setRoleName] = useState("")
//     const [permissions, setPermissions] = useState([])
//     const [availablePages, setAvailablePages] = useState([])
//     const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
//     const [loading, setLoading] = useState(true)
//     const [activeTab, setActiveTab] = useState("view")

//     useEffect(() => {
//         // Fetch all pages & columns
//         getPagesAndColumns()
//             .then((data) => {
//                 console.log("Fetched data:", data)
//                 setAvailablePages(data)
//                 setLoading(false)
//             })
//             .catch((error) => {
//                 console.error("Error fetching pages:", error)
//                 toast.error("Failed to load pages")
//                 setLoading(false)
//             })
//     }, [])

//     // Handle selecting/unselecting a single column
//     const handlePermissionChange = (page, column) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]
//             const pageIndex = updatedPermissions.findIndex((p) => p.page === page)

//             if (pageIndex !== -1) {
//                 // Toggle column selection
//                 const columnIndex = updatedPermissions[pageIndex].columns.indexOf(column)
//                 if (columnIndex !== -1) {
//                     // Remove the column but keep the page entry even if columns array is empty
//                     updatedPermissions[pageIndex].columns.splice(columnIndex, 1)
//                 } else {
//                     updatedPermissions[pageIndex].columns.push(column)
//                 }
//             } else {
//                 // Add new page with column
//                 updatedPermissions.push({ page, columns: [column] })
//             }
//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for a page
//     const handleSelectAll = (page, columns) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]
//             const pageIndex = updatedPermissions.findIndex((p) => p.page === page)

//             if (pageIndex !== -1) {
//                 // Check if all columns are already selected
//                 const allSelected = columns.every((col) => updatedPermissions[pageIndex].columns.includes(col))

//                 if (allSelected) {
//                     // If all columns are selected, deselect all
//                     updatedPermissions[pageIndex].columns = []
//                 } else {
//                     // Otherwise, select all columns
//                     updatedPermissions[pageIndex].columns = [...columns]
//                 }
//             } else {
//                 // Select all columns
//                 updatedPermissions.push({ page, columns: [...columns] })
//             }
//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for an entire section and type (view or edit)
//     const handleSelectAllByType = (sectionPages, type) => {
//         const pagesOfType = sectionPages.filter((page) => page.type === type)

//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]

//             // Check if all pages of this type are already fully selected
//             const allTypeSelected = pagesOfType.every((page) => isAllSelected(page.name, page.columns))

//             if (allTypeSelected) {
//                 // If all are selected, deselect all of this type
//                 pagesOfType.forEach((page) => {
//                     const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                     if (pageIndex !== -1) {
//                         updatedPermissions[pageIndex].columns = []
//                     }
//                 })
//             } else {
//                 // Otherwise, select all columns for all pages of this type
//                 pagesOfType.forEach((page) => {
//                     const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                     if (pageIndex === -1) {
//                         // If not already selected, add all columns
//                         updatedPermissions.push({ page: page.name, columns: [...page.columns] })
//                     } else {
//                         // If already exists, ensure all columns are selected
//                         updatedPermissions[pageIndex].columns = [...page.columns]
//                     }
//                 })
//             }

//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for an entire section
//     const handleSelectAllSection = (sectionPages) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]

//             // Check if all pages in the section are already fully selected
//             const allSectionSelected = sectionPages.every((page) => isAllSelected(page.name, page.columns))

//             if (allSectionSelected) {
//                 // If all are selected, this becomes a "Deselect All" operation
//                 return handleDeselectAllSection(sectionPages)
//             }

//             // Otherwise, select all columns for all pages in the section
//             sectionPages.forEach((page) => {
//                 const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                 if (pageIndex === -1) {
//                     // If not already selected, add all columns
//                     updatedPermissions.push({ page: page.name, columns: [...page.columns] })
//                 } else {
//                     // If already exists, ensure all columns are selected
//                     updatedPermissions[pageIndex].columns = [...page.columns]
//                 }
//             })

//             return updatedPermissions
//         })
//     }

//     // Handle "Deselect All" for an entire section
//     const handleDeselectAllSection = (sectionPages) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]

//             // For all pages in this section, set columns to empty array but keep the page entries
//             sectionPages.forEach((page) => {
//                 const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                 if (pageIndex !== -1) {
//                     updatedPermissions[pageIndex].columns = []
//                 }
//             })

//             return updatedPermissions
//         })
//     }

//     // Check if all columns are selected for a page
//     const isAllSelected = (page, columns) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return (
//             pagePermissions &&
//             columns.length > 0 &&
//             pagePermissions.columns.length === columns.length &&
//             columns.every((col) => pagePermissions.columns.includes(col))
//         )
//     }

//     // Check if any columns are selected for a page
//     const isAnySelected = (page) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return pagePermissions && pagePermissions.columns.length > 0
//     }

//     // Get count of selected columns for a page
//     const getSelectedCount = (page, totalColumns) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return pagePermissions ? pagePermissions.columns.length : 0
//     }

//     // Check if all pages in a section are selected
//     const isAllSectionSelected = (sectionPages) => {
//         return sectionPages.every((page) => isAllSelected(page.name, page.columns))
//     }

//     // Check if a column is selected
//     const isColumnSelected = (page, column) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return pagePermissions && pagePermissions.columns.includes(column)
//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         if (!roleName) {
//             return toast.error("Role name is required")
//         }

//         // Filter out any permission entries with empty columns arrays
//         const filteredPermissions = permissions.filter((p) => p.columns.length > 0)

//         if (filteredPermissions.length === 0) {
//             return toast.error("At least one permission is required")
//         }

//         try {
//             await addRole({ roleName, permissions: filteredPermissions })
//             toast.success("Role added successfully!")
//             navigate("/roles")
//         } catch (error) {
//             console.error("Error adding role:", error)
//             toast.error("Failed to add role")
//         }
//     }

//     // Navigation between sections
//     const goToNextSection = () => {
//         if (currentSectionIndex < availablePages.length - 1) {
//             setCurrentSectionIndex(currentSectionIndex + 1)
//         }
//     }

//     const goToPreviousSection = () => {
//         if (currentSectionIndex > 0) {
//             setCurrentSectionIndex(currentSectionIndex - 1)
//         }
//     }

//     // Separate pages by type (view/edit)
//     const getPagesByType = (pages, type) => {
//         return pages.filter((page) => page.type === type)
//     }

//     // Get all columns for the current section and type
//     const getAllColumnsForCurrentSection = () => {
//         if (!availablePages[currentSectionIndex]) return []
//         return availablePages[currentSectionIndex].pages.filter((page) => page.type === activeTab)
//     }

//     return (
//         <div className="w-full max-w-6xl mx-auto p-4">
//             <Card className="shadow-md">
//                 <CardHeader className="pb-4 border-b">
//                     <div className="flex items-center justify-between">
//                         <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/roles")}>
//                             <ArrowLeft className="h-4 w-4" /> Back
//                         </Button>
//                         <CardTitle className="text-xl font-bold">Add New Role</CardTitle>
//                         <div className="w-16" /> {/* Spacer for alignment */}
//                     </div>
//                 </CardHeader>

//                 <CardContent className="p-4">
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         {/* Role Name Input */}
//                         <div className="flex items-center gap-4">
//                             <label className="font-medium whitespace-nowrap">Role Name:</label>
//                             <Input
//                                 type="text"
//                                 value={roleName}
//                                 onChange={(e) => setRoleName(e.target.value)}
//                                 required
//                                 placeholder="Enter role name"
//                                 className="h-9 w-64"
//                             />
//                         </div>

//                         {/* Permissions Section */}
//                         <div className="bg-background rounded-lg border">
//                             <div className="flex items-center justify-between p-3 border-b bg-muted/30">
//                                 <div className="flex items-center gap-3">
//                                     <h2 className="font-semibold">Permissions</h2>
//                                     <Select
//                                         value={currentSectionIndex.toString()}
//                                         onValueChange={(value) => setCurrentSectionIndex(Number.parseInt(value))}
//                                     >
//                                         <SelectTrigger className="w-[180px] h-8">
//                                             <SelectValue placeholder="Select section" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {availablePages.map((section, index) => (
//                                                 <SelectItem key={index} value={index.toString()}>
//                                                     {section.section}
//                                                 </SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>

//                                 <div className="flex items-center gap-2">
//                                     <Button
//                                         type="button"
//                                         variant="outline"
//                                         size="sm"
//                                         onClick={goToPreviousSection}
//                                         disabled={currentSectionIndex === 0}
//                                         className="h-8 w-8 p-0"
//                                     >
//                                         <ChevronLeft size={16} />
//                                     </Button>
//                                     <Button
//                                         type="button"
//                                         variant="outline"
//                                         size="sm"
//                                         onClick={goToNextSection}
//                                         disabled={currentSectionIndex === availablePages.length - 1}
//                                         className="h-8 w-8 p-0"
//                                     >
//                                         <ChevronRight size={16} />
//                                     </Button>
//                                 </div>
//                             </div>

//                             {/* Current Section */}
//                             {loading ? (
//                                 <div className="p-6 text-center">
//                                     <div className="animate-pulse">Loading permissions...</div>
//                                 </div>
//                             ) : availablePages.length > 0 ? (
//                                 <div className="p-3">
//                                     <div className="flex items-center justify-between mb-3">
//                                         <h3 className="font-bold text-primary">{availablePages[currentSectionIndex]?.section}</h3>
//                                         <Button
//                                             type="button"
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={() => handleSelectAllSection(availablePages[currentSectionIndex]?.pages)}
//                                             className="h-8"
//                                         >
//                                             {isAllSectionSelected(availablePages[currentSectionIndex]?.pages) ? "Deselect All" : "Select All"}
//                                         </Button>
//                                     </div>

//                                     {/* Tabs for View/Edit separation */}
//                                     <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
//                                         <TabsList className="grid w-full grid-cols-2 h-9">
//                                             <TabsTrigger value="view" className="text-sm flex items-center gap-1">
//                                                 <Eye className="h-3.5 w-3.5" /> View
//                                             </TabsTrigger>
//                                             <TabsTrigger value="edit" className="text-sm flex items-center gap-1">
//                                                 <Edit className="h-3.5 w-3.5" /> Edit
//                                             </TabsTrigger>
//                                         </TabsList>

//                                         <TabsContent value="view" className="mt-3">
//                                             <PermissionsTable
//                                                 pages={getAllColumnsForCurrentSection()}
//                                                 handlePermissionChange={handlePermissionChange}
//                                                 handleSelectAll={handleSelectAll}
//                                                 isColumnSelected={isColumnSelected}
//                                                 isAllSelected={isAllSelected}
//                                             />
//                                         </TabsContent>

//                                         <TabsContent value="edit" className="mt-3">
//                                             <PermissionsTable
//                                                 pages={getAllColumnsForCurrentSection()}
//                                                 handlePermissionChange={handlePermissionChange}
//                                                 handleSelectAll={handleSelectAll}
//                                                 isColumnSelected={isColumnSelected}
//                                                 isAllSelected={isAllSelected}
//                                             />
//                                         </TabsContent>
//                                     </Tabs>
//                                 </div>
//                             ) : (
//                                 <div className="p-6 text-center text-muted-foreground">No permissions available</div>
//                             )}
//                         </div>
//                     </form>
//                 </CardContent>

//                 <CardFooter className="border-t p-4">
//                     <div className="flex justify-end gap-3 w-full">
//                         <Button type="button" variant="outline" onClick={() => navigate("/roles")}>
//                             Cancel
//                         </Button>
//                         <Button type="submit" onClick={handleSubmit} disabled={!roleName || permissions.length === 0}>
//                             Add Role
//                         </Button>
//                     </div>
//                 </CardFooter>
//             </Card>
//         </div>
//     )
// }

// // Component for permissions table
// const PermissionsTable = ({ pages, handlePermissionChange, handleSelectAll, isColumnSelected, isAllSelected }) => {
//     if (pages.length === 0) {
//         return (
//             <div className="text-center p-4 bg-muted/20 rounded-lg">
//                 <p className="text-muted-foreground">No pages found</p>
//             </div>
//         )
//     }

//     return (
//         <div className="border rounded-md">
//             <Table>
//                 <TableHeader>
//                     <TableRow className="bg-muted/30">
//                         <TableHead className="w-[180px]">Page</TableHead>
//                         <TableHead>Columns</TableHead>
//                         <TableHead className="w-[100px] text-right">Actions</TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                     {pages.map((page) => (
//                         <TableRow key={page.name}>
//                             <TableCell className="font-medium py-2.5">{page.name}</TableCell>
//                             <TableCell className="py-2.5">
//                                 <div className="flex flex-wrap gap-1.5">
//                                     {page.columns.map((column) => (
//                                         <Badge
//                                             key={column}
//                                             variant={isColumnSelected(page.name, column) ? "default" : "outline"}
//                                             className="cursor-pointer px-2 py-0.5 text-xs"
//                                             onClick={() => handlePermissionChange(page.name, column)}
//                                         >
//                                             {column}
//                                         </Badge>
//                                     ))}
//                                 </div>
//                             </TableCell>
//                             <TableCell className="text-right py-2.5">
//                                 <Button
//                                     size="sm"
//                                     variant={isAllSelected(page.name, page.columns) ? "default" : "outline"}
//                                     onClick={() => handleSelectAll(page.name, page.columns)}
//                                     className="h-7 text-xs px-2.5"
//                                 >
//                                     {isAllSelected(page.name, page.columns) ? "Deselect All" : "Select All"}
//                                 </Button>
//                             </TableCell>
//                         </TableRow>
//                     ))}
//                 </TableBody>
//             </Table>
//         </div>
//     )
// }

// export default AddRole






















// "use client"

// import { useState, useEffect } from "react"
// import { toast } from "react-hot-toast"
// import { addRole, getPagesAndColumns } from "@/services/adminService"
// import { useNavigate } from "react-router-dom"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ChevronLeft, ChevronRight, Eye, Edit, X, Search, ArrowLeft } from "lucide-react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Switch } from "@/components/ui/switch"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// const AddRole = () => {
//     const navigate = useNavigate()
//     const [roleName, setRoleName] = useState("")
//     const [permissions, setPermissions] = useState([])
//     const [availablePages, setAvailablePages] = useState([])
//     const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
//     const [searchFilter, setSearchFilter] = useState("")
//     const [loading, setLoading] = useState(true)
//     const [activeTab, setActiveTab] = useState("view")
//     const [showSelected, setShowSelected] = useState(false)

//     useEffect(() => {
//         // Fetch all pages & columns
//         getPagesAndColumns()
//             .then((data) => {
//                 console.log("Fetched data:", data)
//                 setAvailablePages(data)
//                 setLoading(false)
//             })
//             .catch((error) => {
//                 console.error("Error fetching pages:", error)
//                 toast.error("Failed to load pages")
//                 setLoading(false)
//             })
//     }, [])

//     // Handle selecting/unselecting a single column
//     const handlePermissionChange = (page, column) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]
//             const pageIndex = updatedPermissions.findIndex((p) => p.page === page)

//             if (pageIndex !== -1) {
//                 // Toggle column selection
//                 const columnIndex = updatedPermissions[pageIndex].columns.indexOf(column)
//                 if (columnIndex !== -1) {
//                     // Remove the column but keep the page entry even if columns array is empty
//                     updatedPermissions[pageIndex].columns.splice(columnIndex, 1)
//                 } else {
//                     updatedPermissions[pageIndex].columns.push(column)
//                 }
//             } else {
//                 // Add new page with column
//                 updatedPermissions.push({ page, columns: [column] })
//             }
//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for a page
//     const handleSelectAll = (page, columns) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]
//             const pageIndex = updatedPermissions.findIndex((p) => p.page === page)

//             if (pageIndex !== -1) {
//                 // Check if all columns are already selected
//                 const allSelected = columns.every((col) => updatedPermissions[pageIndex].columns.includes(col))

//                 if (allSelected) {
//                     // If all columns are selected, deselect all
//                     updatedPermissions[pageIndex].columns = []
//                 } else {
//                     // Otherwise, select all columns
//                     updatedPermissions[pageIndex].columns = [...columns]
//                 }
//             } else {
//                 // Select all columns
//                 updatedPermissions.push({ page, columns: [...columns] })
//             }
//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for an entire section and type (view or edit)
//     const handleSelectAllByType = (sectionPages, type) => {
//         const pagesOfType = sectionPages.filter((page) => page.type === type)

//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]

//             // Check if all pages of this type are already fully selected
//             const allTypeSelected = pagesOfType.every((page) => isAllSelected(page.name, page.columns))

//             if (allTypeSelected) {
//                 // If all are selected, deselect all of this type
//                 pagesOfType.forEach((page) => {
//                     const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                     if (pageIndex !== -1) {
//                         updatedPermissions[pageIndex].columns = []
//                     }
//                 })
//             } else {
//                 // Otherwise, select all columns for all pages of this type
//                 pagesOfType.forEach((page) => {
//                     const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                     if (pageIndex === -1) {
//                         // If not already selected, add all columns
//                         updatedPermissions.push({ page: page.name, columns: [...page.columns] })
//                     } else {
//                         // If already exists, ensure all columns are selected
//                         updatedPermissions[pageIndex].columns = [...page.columns]
//                     }
//                 })
//             }

//             return updatedPermissions
//         })
//     }

//     // Handle "Select All" for an entire section
//     const handleSelectAllSection = (sectionPages) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions]

//             // Check if all pages in the section are already fully selected
//             const allSectionSelected = sectionPages.every((page) => isAllSelected(page.name, page.columns))

//             if (allSectionSelected) {
//                 // If all are selected, this becomes a "Deselect All" operation
//                 sectionPages.forEach((page) => {
//                     const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                     if (pageIndex !== -1) {
//                         updatedPermissions[pageIndex].columns = []
//                     }
//                 })
//             } else {
//                 // Otherwise, select all columns for all pages in the section
//                 sectionPages.forEach((page) => {
//                     const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
//                     if (pageIndex === -1) {
//                         // If not already selected, add all columns
//                         updatedPermissions.push({ page: page.name, columns: [...page.columns] })
//                     } else {
//                         // If already exists, ensure all columns are selected
//                         updatedPermissions[pageIndex].columns = [...page.columns]
//                     }
//                 })
//             }

//             return updatedPermissions
//         })
//     }

//     // Check if all columns are selected for a page
//     const isAllSelected = (page, columns) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return (
//             pagePermissions &&
//             columns.length > 0 &&
//             pagePermissions.columns.length === columns.length &&
//             columns.every((col) => pagePermissions.columns.includes(col))
//         )
//     }

//     // Check if any columns are selected for a page
//     const isAnySelected = (page) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return pagePermissions && pagePermissions.columns.length > 0
//     }

//     // Get count of selected columns for a page
//     const getSelectedCount = (page, totalColumns) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return pagePermissions ? pagePermissions.columns.length : 0
//     }

//     // Check if all pages in a section are selected
//     const isAllSectionSelected = (sectionPages) => {
//         return sectionPages.every((page) => isAllSelected(page.name, page.columns))
//     }

//     // Check if any columns are selected in a section
//     const isAnySectionSelected = (sectionPages) => {
//         return sectionPages.some((page) => {
//             const pagePermissions = permissions.find((p) => p.page === page.name)
//             return pagePermissions && pagePermissions.columns.length > 0
//         })
//     }

//     // Filter columns based on search term
//     const filterColumns = (columns) => {
//         if (!searchFilter) return columns
//         return columns.filter((col) => col.toLowerCase().includes(searchFilter.toLowerCase()))
//     }

//     // Check if a column is selected
//     const isColumnSelected = (page, column) => {
//         const pagePermissions = permissions.find((p) => p.page === page)
//         return pagePermissions && pagePermissions.columns.includes(column)
//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         if (!roleName) {
//             return toast.error("Role name is required")
//         }

//         // Filter out any permission entries with empty columns arrays
//         const filteredPermissions = permissions.filter((p) => p.columns.length > 0)

//         if (filteredPermissions.length === 0) {
//             return toast.error("At least one permission is required")
//         }

//         try {
//             await addRole({ roleName, permissions: filteredPermissions })
//             toast.success("Role added successfully!")
//             navigate("/roles")
//         } catch (error) {
//             console.error("Error adding role:", error)
//             toast.error("Failed to add role")
//         }
//     }

//     // Navigation between sections
//     const goToNextSection = () => {
//         if (currentSectionIndex < availablePages.length - 1) {
//             setCurrentSectionIndex(currentSectionIndex + 1)
//         }
//     }

//     const goToPreviousSection = () => {
//         if (currentSectionIndex > 0) {
//             setCurrentSectionIndex(currentSectionIndex - 1)
//         }
//     }

//     // Separate pages by type (view/edit)
//     const getPagesByType = (pages, type) => {
//         return pages.filter((page) => page.type === type)
//     }

//     // Calculate total permissions selected
//     const getTotalSelectedPermissions = () => {
//         return permissions.reduce((total, page) => total + page.columns.length, 0)
//     }

//     // Calculate total available permissions
//     const getTotalAvailablePermissions = () => {
//         return availablePages.reduce((total, section) => {
//             return (
//                 total +
//                 section.pages.reduce((pageTotal, page) => {
//                     return pageTotal + page.columns.length
//                 }, 0)
//             )
//         }, 0)
//     }

//     const totalSelected = getTotalSelectedPermissions()
//     const totalAvailable = getTotalAvailablePermissions()

//     // Get all columns for the current section and type
//     const getAllColumnsForCurrentSection = () => {
//         if (!availablePages[currentSectionIndex]) return []

//         const pagesOfType = availablePages[currentSectionIndex].pages.filter((page) => page.type === activeTab)

//         // If showing only selected, filter the pages
//         if (showSelected) {
//             return pagesOfType
//                 .map((page) => {
//                     const selectedColumns = page.columns.filter(
//                         (col) =>
//                             isColumnSelected(page.name, col) &&
//                             (!searchFilter || col.toLowerCase().includes(searchFilter.toLowerCase())),
//                     )
//                     return { ...page, filteredColumns: selectedColumns }
//                 })
//                 .filter((page) => page.filteredColumns.length > 0)
//         }

//         // Otherwise, just filter by search term
//         return pagesOfType.map((page) => {
//             const filteredColumns = page.columns.filter(
//                 (col) => !searchFilter || col.toLowerCase().includes(searchFilter.toLowerCase()),
//             )
//             return { ...page, filteredColumns }
//         })
//     }


//     return (
//         <div className="w-full max-w-6xl mx-auto p-4">
//             <Card className="shadow-md border">
//                 <CardHeader className="pb-4 border-b">
//                     <div className="flex items-center justify-between">
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             className="gap-2 text-base font-medium"
//                             onClick={() => navigate("/roles")}
//                             type="button" // Adding explicit type to prevent form submission
//                         >
//                             <ArrowLeft className="h-5 w-5" /> Back to Roles
//                         </Button>
//                         <CardTitle className="text-2xl font-bold">Add New Role</CardTitle>
//                         <div className="w-28" /> {/* Spacer for alignment */}
//                     </div>
//                 </CardHeader>

//                 <CardContent className="p-6">
//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         {/* Role Name Input */}
//                         <div className="flex items-center justify-between">
//                             <div className="space-y-2 w-1/2">
//                                 <label className="text-base font-semibold">Role Name</label>
//                                 <Input
//                                     type="text"
//                                     value={roleName}
//                                     onChange={(e) => setRoleName(e.target.value)}
//                                     required
//                                     placeholder="Enter role name"
//                                     className="h-12 text-base px-4"
//                                 />
//                             </div>
//                         </div>

//                         {/* Permissions Section */}
//                         <div className="bg-background rounded-lg border">
//                             <div className="flex items-center justify-between p-4 border-b bg-muted/30">
//                                 <div className="flex items-center gap-4">
//                                     <h2 className="text-lg font-semibold">Permissions</h2>
//                                     <Select
//                                         value={currentSectionIndex.toString()}
//                                         onValueChange={(value) => setCurrentSectionIndex(Number.parseInt(value))}
//                                     >
//                                         <SelectTrigger className="w-[200px]">
//                                             <SelectValue placeholder="Select section" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {availablePages.map((section, index) => (
//                                                 <SelectItem key={index} value={index.toString()}>
//                                                     {section.section}
//                                                 </SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>

//                                 <div className="flex items-center gap-2">
//                                     <Button
//                                         type="button"
//                                         variant="outline"
//                                         size="sm"
//                                         onClick={goToPreviousSection}
//                                         disabled={currentSectionIndex === 0}
//                                     >
//                                         <ChevronLeft size={16} />
//                                     </Button>
//                                     <span className="text-sm">
//                                         {currentSectionIndex + 1} / {availablePages.length}
//                                     </span>
//                                     <Button
//                                         type="button"
//                                         variant="outline"
//                                         size="sm"
//                                         onClick={goToNextSection}
//                                         disabled={currentSectionIndex === availablePages.length - 1}
//                                     >
//                                         <ChevronRight size={16} />
//                                     </Button>
//                                 </div>
//                             </div>

//                             {/* Current Section */}
//                             {loading ? (
//                                 <div className="p-10 text-center">
//                                     <div className="animate-pulse text-lg">Loading permissions...</div>
//                                 </div>
//                             ) : availablePages.length > 0 ? (
//                                 <div className="p-4">
//                                     <div className="flex items-center justify-between mb-4">
//                                         <h3 className="text-2xl font-bold text-primary">{availablePages[currentSectionIndex]?.section}</h3>
//                                         <div className="flex items-center gap-3">
//                                             <div className="flex items-center space-x-2">
//                                                 <Switch id="show-selected" checked={showSelected} onCheckedChange={setShowSelected} />
//                                                 <label htmlFor="show-selected" className="text-sm cursor-pointer">
//                                                     Show selected only
//                                                 </label>
//                                             </div>
//                                             <Button
//                                                 type="button" // Add explicit type to prevent form submission
//                                                 variant="outline"
//                                                 onClick={() => handleSelectAllSection(availablePages[currentSectionIndex]?.pages)}
//                                                 className="h-9 text-sm"
//                                             >
//                                                 {isAllSectionSelected(availablePages[currentSectionIndex]?.pages)
//                                                     ? "Deselect All"
//                                                     : "Select All"}
//                                             </Button>
//                                         </div>
//                                     </div>

//                                     {/* Tabs for View/Edit separation */}
//                                     <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
//                                         <TabsList className="grid w-full grid-cols-2 h-10">
//                                             <TabsTrigger value="view" className="text-base flex items-center gap-2">
//                                                 <Eye className="h-4 w-4" /> View Permissions
//                                             </TabsTrigger>
//                                             <TabsTrigger value="edit" className="text-base flex items-center gap-2">
//                                                 <Edit className="h-4 w-4" /> Edit Permissions
//                                             </TabsTrigger>
//                                         </TabsList>

//                                         <TabsContent value="view" className="mt-4">
//                                             <PermissionsTable
//                                                 pages={getAllColumnsForCurrentSection()}
//                                                 handlePermissionChange={handlePermissionChange}
//                                                 handleSelectAll={handleSelectAll}
//                                                 isColumnSelected={isColumnSelected}
//                                                 isAllSelected={isAllSelected}
//                                             />
//                                         </TabsContent>

//                                         <TabsContent value="edit" className="mt-4">
//                                             <PermissionsTable
//                                                 pages={getAllColumnsForCurrentSection()}
//                                                 handlePermissionChange={handlePermissionChange}
//                                                 handleSelectAll={handleSelectAll}
//                                                 isColumnSelected={isColumnSelected}
//                                                 isAllSelected={isAllSelected}
//                                             />
//                                         </TabsContent>
//                                     </Tabs>
//                                 </div>
//                             ) : (
//                                 <div className="p-10 text-center text-muted-foreground text-lg">No permissions available</div>
//                             )}
//                         </div>
//                     </form>
//                 </CardContent>

//                 <CardFooter className="border-t p-6">
//                     <div className="flex justify-end gap-4 w-full">
//                         <Button
//                             type="button" // Add explicit type to prevent form submission
//                             variant="outline"
//                             onClick={() => navigate("/roles")}
//                             className="h-12 px-6 text-base font-medium"
//                         >
//                             Cancel
//                         </Button>
//                         <Button
//                             type="submit" // This is the submit button (proper use)
//                             onClick={(e) => {
//                                 e.preventDefault();
//                                 handleSubmit(e);
//                             }}
//                             disabled={!roleName || getTotalSelectedPermissions() === 0}
//                             className="h-12 px-6 text-base font-medium"
//                         >
//                             Add Role
//                         </Button>
//                     </div>
//                 </CardFooter>
//             </Card>
//         </div>
//     );
// }

// // Component for permissions table
// // Component for permissions table
// const PermissionsTable = ({ pages, handlePermissionChange, handleSelectAll, isColumnSelected, isAllSelected }) => {
//     if (pages.length === 0) {
//         return (
//             <div className="text-center p-6 bg-muted/20 rounded-lg">
//                 <p className="text-muted-foreground">No pages found with the current filters</p>
//             </div>
//         )
//     }

//     return (
//         <div className="border rounded-md">
//             <Table>
//                 <TableHeader>
//                     <TableRow className="bg-muted/30">
//                         <TableHead className="w-[250px]">Page</TableHead>
//                         <TableHead>Columns</TableHead>
//                         <TableHead className="w-[120px] text-right">Actions</TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                     {pages.map((page) => {
//                         // Skip pages with no filtered columns
//                         if (page.filteredColumns.length === 0) return null

//                         return (
//                             <TableRow key={page.name}>
//                                 <TableCell className="font-medium align-top py-4">
//                                     <div className="flex flex-col">
//                                         <span>{page.name}</span>
//                                         <Badge variant="outline" className="mt-1 w-fit">
//                                             {page.filteredColumns.length} column{page.filteredColumns.length !== 1 ? "s" : ""}
//                                         </Badge>
//                                     </div>
//                                 </TableCell>
//                                 <TableCell>
//                                     <div className="flex flex-wrap gap-2 py-1">
//                                         {page.filteredColumns.map((column) => (
//                                             <Badge
//                                                 key={column}
//                                                 variant={isColumnSelected(page.name, column) ? "default" : "outline"}
//                                                 className="cursor-pointer px-3 py-1.5 text-sm"
//                                                 onClick={() => handlePermissionChange(page.name, column)}
//                                             >
//                                                 {column}
//                                             </Badge>
//                                         ))}
//                                     </div>
//                                 </TableCell>
//                                 <TableCell className="text-right">
//                                     <Button
//                                         type="button" // Add explicit type to prevent form submission
//                                         size="sm"
//                                         variant={isAllSelected(page.name, page.filteredColumns) ? "default" : "outline"}
//                                         onClick={() => handleSelectAll(page.name, page.filteredColumns)}
//                                     >
//                                         {isAllSelected(page.name, page.filteredColumns) ? "Deselect All" : "Select All"}
//                                     </Button>
//                                 </TableCell>
//                             </TableRow>
//                         )
//                     })}
//                 </TableBody>
//             </Table>
//         </div>
//     )
// }

// export default AddRole















"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { addRole, getPagesAndColumns } from "@/services/adminService"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Eye, Edit, X, Search, ArrowLeft, Check, Save } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const AddRole = () => {
    const navigate = useNavigate()
    const [roleName, setRoleName] = useState("")
    const [permissions, setPermissions] = useState([])
    const [availablePages, setAvailablePages] = useState([])
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
    const [searchFilter, setSearchFilter] = useState("")
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("view")
    const [showSelected, setShowSelected] = useState(false)
    // Track which sections have been saved
    const [savedSections, setSavedSections] = useState([])

    useEffect(() => {
        // Fetch all pages & columns
        getPagesAndColumns()
            .then((data) => {
                console.log("Fetched data:", data)
                setAvailablePages(data)
                setLoading(false)
            })
            .catch((error) => {
                console.error("Error fetching pages:", error)
                toast.error("Failed to load pages")
                setLoading(false)
            })
    }, [])

    // Handle selecting/unselecting a single column
    const handlePermissionChange = (page, column) => {
        setPermissions((prevPermissions) => {
            const updatedPermissions = [...prevPermissions]
            const pageIndex = updatedPermissions.findIndex((p) => p.page === page)

            if (pageIndex !== -1) {
                // Toggle column selection
                const columnIndex = updatedPermissions[pageIndex].columns.indexOf(column)
                if (columnIndex !== -1) {
                    // Remove the column but keep the page entry even if columns array is empty
                    updatedPermissions[pageIndex].columns.splice(columnIndex, 1)
                } else {
                    updatedPermissions[pageIndex].columns.push(column)
                }
            } else {
                // Add new page with column
                updatedPermissions.push({ page, columns: [column] })
            }
            return updatedPermissions
        })
    }

    // Handle "Select All" for a page
    const handleSelectAll = (page, columns) => {
        setPermissions((prevPermissions) => {
            const updatedPermissions = [...prevPermissions]
            const pageIndex = updatedPermissions.findIndex((p) => p.page === page)

            if (pageIndex !== -1) {
                // Check if all columns are already selected
                const allSelected = columns.every((col) => updatedPermissions[pageIndex].columns.includes(col))

                if (allSelected) {
                    // If all columns are selected, deselect all
                    updatedPermissions[pageIndex].columns = []
                } else {
                    // Otherwise, select all columns
                    updatedPermissions[pageIndex].columns = [...columns]
                }
            } else {
                // Select all columns
                updatedPermissions.push({ page, columns: [...columns] })
            }
            return updatedPermissions
        })
    }

    // Handle "Select All" for an entire section and type (view or edit)
    const handleSelectAllByType = (sectionPages, type) => {
        const pagesOfType = sectionPages.filter((page) => page.type === type)

        setPermissions((prevPermissions) => {
            const updatedPermissions = [...prevPermissions]

            // Check if all pages of this type are already fully selected
            const allTypeSelected = pagesOfType.every((page) => isAllSelected(page.name, page.columns))

            if (allTypeSelected) {
                // If all are selected, deselect all of this type
                pagesOfType.forEach((page) => {
                    const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
                    if (pageIndex !== -1) {
                        updatedPermissions[pageIndex].columns = []
                    }
                })
            } else {
                // Otherwise, select all columns for all pages of this type
                pagesOfType.forEach((page) => {
                    const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
                    if (pageIndex === -1) {
                        // If not already selected, add all columns
                        updatedPermissions.push({ page: page.name, columns: [...page.columns] })
                    } else {
                        // If already exists, ensure all columns are selected
                        updatedPermissions[pageIndex].columns = [...page.columns]
                    }
                })
            }

            return updatedPermissions
        })
    }

    // Handle "Select All" for an entire section
    const handleSelectAllSection = (sectionPages) => {
        setPermissions((prevPermissions) => {
            const updatedPermissions = [...prevPermissions]

            // Check if all pages in the section are already fully selected
            const allSectionSelected = sectionPages.every((page) => isAllSelected(page.name, page.columns))

            if (allSectionSelected) {
                // If all are selected, this becomes a "Deselect All" operation
                sectionPages.forEach((page) => {
                    const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
                    if (pageIndex !== -1) {
                        updatedPermissions[pageIndex].columns = []
                    }
                })
            } else {
                // Otherwise, select all columns for all pages in the section
                sectionPages.forEach((page) => {
                    const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
                    if (pageIndex === -1) {
                        // If not already selected, add all columns
                        updatedPermissions.push({ page: page.name, columns: [...page.columns] })
                    } else {
                        // If already exists, ensure all columns are selected
                        updatedPermissions[pageIndex].columns = [...page.columns]
                    }
                })
            }

            return updatedPermissions
        })
    }

    // Check if all columns are selected for a page
    const isAllSelected = (page, columns) => {
        const pagePermissions = permissions.find((p) => p.page === page)
        return (
            pagePermissions &&
            columns.length > 0 &&
            pagePermissions.columns.length === columns.length &&
            columns.every((col) => pagePermissions.columns.includes(col))
        )
    }

    // Check if any columns are selected for a page
    const isAnySelected = (page) => {
        const pagePermissions = permissions.find((p) => p.page === page)
        return pagePermissions && pagePermissions.columns.length > 0
    }

    // Get count of selected columns for a page
    const getSelectedCount = (page, totalColumns) => {
        const pagePermissions = permissions.find((p) => p.page === page)
        return pagePermissions ? pagePermissions.columns.length : 0
    }

    // Check if all pages in a section are selected
    const isAllSectionSelected = (sectionPages) => {
        return sectionPages.every((page) => isAllSelected(page.name, page.columns))
    }

    // Check if any columns are selected in a section
    const isAnySectionSelected = (sectionPages) => {
        return sectionPages.some((page) => {
            const pagePermissions = permissions.find((p) => p.page === page.name)
            return pagePermissions && pagePermissions.columns.length > 0
        })
    }

    // Filter columns based on search term
    const filterColumns = (columns) => {
        if (!searchFilter) return columns
        return columns.filter((col) => col.toLowerCase().includes(searchFilter.toLowerCase()))
    }

    // Check if a column is selected
    const isColumnSelected = (page, column) => {
        const pagePermissions = permissions.find((p) => p.page === page)
        return pagePermissions && pagePermissions.columns.includes(column)
    }

    // New function to handle saving the current section
    const handleSaveSection = () => {
        if (!availablePages[currentSectionIndex]) return

        const currentSection = availablePages[currentSectionIndex].section

        // Check if any permissions were selected in this section
        const hasSelectionsInCurrentSection = availablePages[currentSectionIndex].pages.some(page => {
            const pagePermissions = permissions.find(p => p.page === page.name)
            return pagePermissions && pagePermissions.columns.length > 0
        })

        // Add this section to saved sections if not already saved
        if (!savedSections.includes(currentSection)) {
            setSavedSections(prev => [...prev, currentSection])
        }

        toast.success(
            hasSelectionsInCurrentSection
                ? `Saved selections for ${currentSection}`
                : `No selections made for ${currentSection}`,
            { duration: 2000 }
        )

        // Auto advance to next section if not on the last section
        if (currentSectionIndex < availablePages.length - 1) {
            setTimeout(() => {
                goToNextSection()
            }, 300)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!roleName) {
            return toast.error("Role name is required")
        }

        // Filter out any permission entries with empty columns arrays
        const filteredPermissions = permissions.filter((p) => p.columns.length > 0)

        if (filteredPermissions.length === 0) {
            return toast.error("At least one permission is required")
        }

        try {
            await addRole({ roleName, permissions: filteredPermissions })
            toast.success("Role added successfully!")
            navigate("/roles")
        } catch (error) {
            console.error("Error adding role:", error)
            toast.error("Failed to add role")
        }
    }

    // Navigation between sections
    const goToNextSection = () => {
        if (currentSectionIndex < availablePages.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1)
        }
    }

    const goToPreviousSection = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1)
        }
    }

    // Separate pages by type (view/edit)
    const getPagesByType = (pages, type) => {
        return pages.filter((page) => page.type === type)
    }

    // Calculate total permissions selected
    const getTotalSelectedPermissions = () => {
        return permissions.reduce((total, page) => total + page.columns.length, 0)
    }

    // Calculate total available permissions
    const getTotalAvailablePermissions = () => {
        return availablePages.reduce((total, section) => {
            return (
                total +
                section.pages.reduce((pageTotal, page) => {
                    return pageTotal + page.columns.length
                }, 0)
            )
        }, 0)
    }

    // Check if current section has any selections
    const currentSectionHasSelections = () => {
        if (!availablePages[currentSectionIndex]) return false

        return availablePages[currentSectionIndex].pages.some(page => {
            const pagePermissions = permissions.find(p => p.page === page.name)
            return pagePermissions && pagePermissions.columns.length > 0
        })
    }

    // Check if the current section has been saved
    const isCurrentSectionSaved = () => {
        if (!availablePages[currentSectionIndex]) return false
        return savedSections.includes(availablePages[currentSectionIndex].section)
    }

    const totalSelected = getTotalSelectedPermissions()
    const totalAvailable = getTotalAvailablePermissions()

    // Get all columns for the current section and type
    const getAllColumnsForCurrentSection = () => {
        if (!availablePages[currentSectionIndex]) return []

        const pagesOfType = availablePages[currentSectionIndex].pages.filter((page) => page.type === activeTab)

        // If showing only selected, filter the pages
        if (showSelected) {
            return pagesOfType
                .map((page) => {
                    const selectedColumns = page.columns.filter(
                        (col) =>
                            isColumnSelected(page.name, col) &&
                            (!searchFilter || col.toLowerCase().includes(searchFilter.toLowerCase())),
                    )
                    return { ...page, filteredColumns: selectedColumns }
                })
                .filter((page) => page.filteredColumns.length > 0)
        }

        // Otherwise, just filter by search term
        return pagesOfType.map((page) => {
            const filteredColumns = page.columns.filter(
                (col) => !searchFilter || col.toLowerCase().includes(searchFilter.toLowerCase()),
            )
            return { ...page, filteredColumns }
        })
    }
    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <Card className="shadow-md border">
                <CardHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-base font-medium"
                            onClick={() => navigate("/roles")}
                            type="button"
                        >
                            <ArrowLeft className="h-5 w-5" /> Back to Roles
                        </Button>
                        <CardTitle className="text-2xl font-bold">Add New Role</CardTitle>
                        <div className="w-28" /> {/* Spacer for alignment */}
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Name Input */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-2 w-1/2">
                                <label className="text-base font-semibold">Role Name</label>
                                <Input
                                    type="text"
                                    value={roleName}
                                    onChange={(e) => setRoleName(e.target.value)}
                                    required
                                    placeholder="Enter role name"
                                    className="h-12 text-base px-4"
                                />
                            </div>

                            <div className="text-right">
                                <div className="text-sm text-muted-foreground mb-1">
                                    Sections saved: {savedSections.length} / {availablePages.length}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium">
                                        Total permissions selected: {totalSelected} / {totalAvailable}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Permissions Section */}
                        <div className="bg-background rounded-lg border">
                            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-lg font-semibold">Permissions</h2>
                                    <Select
                                        value={currentSectionIndex.toString()}
                                        onValueChange={(value) => setCurrentSectionIndex(Number.parseInt(value))}
                                    >
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Select section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availablePages.map((section, index) => (
                                                <SelectItem
                                                    key={index}
                                                    value={index.toString()}
                                                    className={savedSections.includes(section.section) ? "bg-green-100" : ""}
                                                >
                                                    {section.section}
                                                    {savedSections.includes(section.section) && " ✓"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={goToPreviousSection}
                                        disabled={currentSectionIndex === 0}
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>
                                    <span className="text-sm">
                                        {currentSectionIndex + 1} / {availablePages.length}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={goToNextSection}
                                        disabled={currentSectionIndex === availablePages.length - 1}
                                    >
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>

                            {/* Current Section */}
                            {loading ? (
                                <div className="p-10 text-center">
                                    <div className="animate-pulse text-lg">Loading permissions...</div>
                                </div>
                            ) : availablePages.length > 0 ? (
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-bold text-primary">{availablePages[currentSectionIndex]?.section}</h3>
                                            {isCurrentSectionSaved() && (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                                    <Check className="h-3 w-3 mr-1" /> Saved
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center space-x-2">
                                                <Switch id="show-selected" checked={showSelected} onCheckedChange={setShowSelected} />
                                                <label htmlFor="show-selected" className="text-sm cursor-pointer">
                                                    Show selected only
                                                </label>
                                            </div>
                                            {/* <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleSelectAllSection(availablePages[currentSectionIndex]?.pages)}
                                                className="h-9 text-sm"
                                            >
                                                {isAllSectionSelected(availablePages[currentSectionIndex]?.pages)
                                                    ? "Deselect All"
                                                    : "Select All"}
                                            </Button> */}
                                            <Button
                                                type="button"
                                                variant={isAllSectionSelected(availablePages[currentSectionIndex]?.pages) ? "destructive" : "default"}
                                                onClick={() => handleSelectAllSection(availablePages[currentSectionIndex]?.pages)}
                                                className="h-9 text-sm flex items-center gap-1"
                                            >
                                                {isAllSectionSelected(availablePages[currentSectionIndex]?.pages) ? (
                                                    <>
                                                        <X className="h-4 w-4" /> Deselect All
                                                    </>
                                                ) : (
                                                    <>
                                                        Select All
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Tabs for View/Edit separation */}
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                                        <TabsList className="grid w-full grid-cols-2 h-10">
                                            <TabsTrigger value="view" className="text-base flex items-center gap-2">
                                                <Eye className="h-4 w-4" /> View Permissions
                                            </TabsTrigger>
                                            <TabsTrigger value="edit" className="text-base flex items-center gap-2">
                                                <Edit className="h-4 w-4" /> Edit Permissions
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="view" className="mt-4">
                                            <PermissionsTable
                                                pages={getAllColumnsForCurrentSection()}
                                                handlePermissionChange={handlePermissionChange}
                                                handleSelectAll={handleSelectAll}
                                                isColumnSelected={isColumnSelected}
                                                isAllSelected={isAllSelected}
                                            />
                                        </TabsContent>

                                        <TabsContent value="edit" className="mt-4">
                                            <PermissionsTable
                                                pages={getAllColumnsForCurrentSection()}
                                                handlePermissionChange={handlePermissionChange}
                                                handleSelectAll={handleSelectAll}
                                                isColumnSelected={isColumnSelected}
                                                isAllSelected={isAllSelected}
                                            />
                                        </TabsContent>
                                    </Tabs>

                                    {/* Section Save Button */}
                                    <div className="mt-6 flex justify-end">
                                        <Button
                                            type="button"
                                            onClick={handleSaveSection}
                                            className="flex items-center gap-2"
                                            variant={isCurrentSectionSaved() ? "outline" : "default"}
                                        >
                                            <Save className="h-4 w-4" />
                                            {isCurrentSectionSaved()
                                                ? `Update ${availablePages[currentSectionIndex]?.section} Selections`
                                                : `Save ${availablePages[currentSectionIndex]?.section} Selections`}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-10 text-center text-muted-foreground text-lg">No permissions available</div>
                            )}
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="border-t p-6">
                    <div className="flex justify-between items-center w-full">
                        <div className="text-sm text-muted-foreground">
                            {savedSections.length === 0 ? (
                                <span>No sections saved yet</span>
                            ) : (
                                <span>
                                    {savedSections.length} section{savedSections.length !== 1 ? 's' : ''} saved
                                </span>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/roles")}
                                className="h-12 px-6 text-base font-medium"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }}
                                disabled={!roleName || getTotalSelectedPermissions() === 0 || savedSections.length === 0}
                                className="h-12 px-6 text-base font-medium"
                            >
                                Add Role
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}



const PermissionsTable = ({ pages, handlePermissionChange, handleSelectAll, isColumnSelected, isAllSelected }) => {
    if (pages.length === 0) {
        return (
            <div className="text-center p-6 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">No pages found with the current filters</p>
            </div>
        )
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30">
                        <TableHead className="w-[250px]">Page</TableHead>
                        <TableHead>Columns</TableHead>
                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pages.map((page) => {
                        // Skip pages with no filtered columns
                        if (page.filteredColumns.length === 0) return null

                        return (
                            <TableRow key={page.name}>
                                <TableCell className="font-medium align-top py-4">
                                    <div className="flex flex-col">
                                        <span>{page.name}</span>
                                        <Badge variant="outline" className="mt-1 w-fit">
                                            {page.filteredColumns.length} column{page.filteredColumns.length !== 1 ? "s" : ""}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2 py-1">
                                        {page.filteredColumns.map((column) => (
                                            <Badge
                                                key={column}
                                                variant={isColumnSelected(page.name, column) ? "default" : "outline"}
                                                className="cursor-pointer px-3 py-1.5 text-sm"
                                                onClick={() => handlePermissionChange(page.name, column)}
                                            >
                                                {column}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                {/* <TableCell className="text-right">
                                    <Button
                                        type="button" // Add explicit type to prevent form submission
                                        size="sm"
                                        variant={isAllSelected(page.name, page.filteredColumns) ? "default" : "outline"}
                                        onClick={() => handleSelectAll(page.name, page.filteredColumns)}
                                    >
                                        {isAllSelected(page.name, page.filteredColumns) ? "Deselect All" : "Select All"}
                                    </Button>
                                </TableCell> */}
                                <TableCell className="text-right">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={isAllSelected(page.name, page.filteredColumns) ? "destructive" : "default"}
                                        onClick={() => handleSelectAll(page.name, page.filteredColumns)}
                                        className="flex items-center gap-1 min-w-[90px] justify-center"
                                    >
                                        {isAllSelected(page.name, page.filteredColumns) ? (
                                            <>
                                                <X className="h-3.5 w-3.5" /> Deselect
                                            </>
                                        ) : (
                                            <>
                                                Select All
                                            </>
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

export default AddRole



