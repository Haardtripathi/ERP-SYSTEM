
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



"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { addRole, getPagesAndColumns } from "@/services/adminService"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Eye, Edit, Plus, X, Check, Filter } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const AddRole = () => {
    const navigate = useNavigate()
    const [roleName, setRoleName] = useState("")
    const [permissions, setPermissions] = useState([])
    const [availablePages, setAvailablePages] = useState([])
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
    const [searchFilter, setSearchFilter] = useState("")

    useEffect(() => {
        // Fetch all pages & columns
        getPagesAndColumns()
            .then((data) => {
                console.log("Fetched data:", data)
                setAvailablePages(data)
            })
            .catch((error) => {
                console.error("Error fetching pages:", error)
                toast.error("Failed to load pages")
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
                return handleDeselectAllSection(sectionPages)
            }

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

            return updatedPermissions
        })
    }

    // Handle "Deselect All" for an entire section
    const handleDeselectAllSection = (sectionPages) => {
        setPermissions((prevPermissions) => {
            const updatedPermissions = [...prevPermissions]

            // For all pages in this section, set columns to empty array but keep the page entries
            sectionPages.forEach((page) => {
                const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name)
                if (pageIndex !== -1) {
                    updatedPermissions[pageIndex].columns = []
                }
            })

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

    return (
        <div className="w-full h-full flex flex-col">
            <Card className="p-6 shadow-lg w-full flex-1 overflow-auto">
                <h1 className="text-2xl font-bold mb-6 text-center">Add Role</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Name Input */}
                    <div className="mb-8">
                        <label className="block font-medium mb-2 text-lg">Role Name</label>
                        <Input
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            required
                            className="text-lg py-6"
                            placeholder="Enter role name"
                        />
                    </div>

                    {/* Permissions Section */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Permissions</h2>

                        {/* Section Navigation */}
                        <div className="flex items-center justify-between mb-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={goToPreviousSection}
                                disabled={currentSectionIndex === 0}
                                className="flex items-center gap-1"
                            >
                                <ChevronLeft size={16} /> Previous
                            </Button>

                            <div className="text-center font-medium">
                                Section {currentSectionIndex + 1} of {availablePages.length}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={goToNextSection}
                                disabled={currentSectionIndex === availablePages.length - 1}
                                className="flex items-center gap-1"
                            >
                                Next <ChevronRight size={16} />
                            </Button>
                        </div>

                        {/* Current Section */}
                        {availablePages.length > 0 && (
                            <div key={availablePages[currentSectionIndex]?.section} className="bg-white p-5 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-4 border-b pb-3">
                                    <h3 className="text-xl font-bold text-primary">{availablePages[currentSectionIndex]?.section}</h3>
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant={
                                                isAllSectionSelected(availablePages[currentSectionIndex]?.pages) ? "destructive" : "outline"
                                            }
                                            size="sm"
                                            onClick={() => handleSelectAllSection(availablePages[currentSectionIndex]?.pages)}
                                            className="text-sm"
                                        >
                                            {isAllSectionSelected(availablePages[currentSectionIndex]?.pages) ? "Deselect All" : "Select All"}
                                        </Button>
                                    </div>
                                </div>

                                {/* Search Filter */}
                                <div className="relative mb-4">
                                    <Input
                                        type="text"
                                        placeholder="Filter columns..."
                                        value={searchFilter}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                        className="pl-10"
                                    />
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    {searchFilter && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                            onClick={() => setSearchFilter("")}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                {/* Tabs for View/Edit separation */}
                                <Tabs defaultValue="view" className="mt-6">
                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                        <TabsTrigger value="view" className="flex items-center gap-2">
                                            <Eye className="h-4 w-4" /> View Permissions
                                        </TabsTrigger>
                                        <TabsTrigger value="edit" className="flex items-center gap-2">
                                            <Edit className="h-4 w-4" /> Edit Permissions
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* View Permissions Tab */}
                                    <TabsContent value="view" className="space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-medium text-sm text-muted-foreground">View Pages</h4>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSelectAllByType(availablePages[currentSectionIndex]?.pages, "view")}
                                                className="text-xs"
                                            >
                                                Select All View Pages
                                            </Button>
                                        </div>

                                        {getPagesByType(availablePages[currentSectionIndex]?.pages, "view").map((page) => (
                                            <PagePermissionCard
                                                key={page.name}
                                                page={page}
                                                permissions={permissions}
                                                isAllSelected={isAllSelected}
                                                isAnySelected={isAnySelected}
                                                getSelectedCount={getSelectedCount}
                                                handleSelectAll={handleSelectAll}
                                                handlePermissionChange={handlePermissionChange}
                                                filterColumns={filterColumns}
                                                searchFilter={searchFilter}
                                            />
                                        ))}
                                    </TabsContent>

                                    {/* Edit Permissions Tab */}
                                    <TabsContent value="edit" className="space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-medium text-sm text-muted-foreground">Edit Pages</h4>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSelectAllByType(availablePages[currentSectionIndex]?.pages, "edit")}
                                                className="text-xs"
                                            >
                                                Select All Edit Pages
                                            </Button>
                                        </div>

                                        {getPagesByType(availablePages[currentSectionIndex]?.pages, "edit").map((page) => (
                                            <PagePermissionCard
                                                key={page.name}
                                                page={page}
                                                permissions={permissions}
                                                isAllSelected={isAllSelected}
                                                isAnySelected={isAnySelected}
                                                getSelectedCount={getSelectedCount}
                                                handleSelectAll={handleSelectAll}
                                                handlePermissionChange={handlePermissionChange}
                                                filterColumns={filterColumns}
                                                searchFilter={searchFilter}
                                            />
                                        ))}
                                    </TabsContent>
                                </Tabs>
                            </div>
                        )}

                        {/* Section Navigation (Bottom) */}
                        <div className="flex items-center justify-between mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={goToPreviousSection}
                                disabled={currentSectionIndex === 0}
                                className="flex items-center gap-1"
                            >
                                <ChevronLeft size={16} /> Previous
                            </Button>

                            <div className="flex gap-2">
                                {availablePages.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-3 h-3 rounded-full cursor-pointer ${index === currentSectionIndex ? "bg-primary" : "bg-gray-300"
                                            }`}
                                        onClick={() => setCurrentSectionIndex(index)}
                                    />
                                ))}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={goToNextSection}
                                disabled={currentSectionIndex === availablePages.length - 1}
                                className="flex items-center gap-1"
                            >
                                Next <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button type="submit" className="w-full py-6 text-lg font-bold">
                            Add Role
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

// Component for each page's permission card
const PagePermissionCard = ({
    page,
    permissions,
    isAllSelected,
    isAnySelected,
    getSelectedCount,
    handleSelectAll,
    handlePermissionChange,
    filterColumns,
    searchFilter,
}) => {
    const [showAllColumns, setShowAllColumns] = useState(false)
    const filteredColumns = filterColumns(page.columns)
    const selectedCount = getSelectedCount(page.name, page.columns)
    const totalColumns = page.columns.length

    // Display only first 6 columns unless showAllColumns is true
    const displayColumns = showAllColumns ? filteredColumns : filteredColumns.slice(0, 6)
    const hasMoreColumns = filteredColumns.length > 6 && !showAllColumns

    return (
        <Card className="p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b">
                <div>
                    <h4 className="font-semibold text-lg">{page.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant={selectedCount > 0 ? "default" : "outline"} className="text-xs">
                            {selectedCount} of {totalColumns} selected
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant={isAllSelected(page.name, page.columns) ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleSelectAll(page.name, page.columns)}
                        className="text-xs"
                    >
                        {isAllSelected(page.name, page.columns) ? "Deselect All" : "Select All"}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs">
                                <Plus className="h-3 w-3 mr-1" /> Add Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Available Columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-[300px] overflow-y-auto">
                                <DropdownMenuGroup>
                                    {page.columns.map((col) => {
                                        const isSelected = permissions.find((p) => p.page === page.name)?.columns.includes(col) || false
                                        return (
                                            <DropdownMenuItem
                                                key={col}
                                                className="flex items-center justify-between cursor-pointer"
                                                onClick={() => handlePermissionChange(page.name, col)}
                                            >
                                                <span>{col}</span>
                                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                                            </DropdownMenuItem>
                                        )
                                    })}
                                </DropdownMenuGroup>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Selected columns as tags */}
            <div className="flex flex-wrap gap-2 mt-3">
                {displayColumns.map((col) => {
                    const isSelected = permissions.find((p) => p.page === page.name)?.columns.includes(col) || false
                    return (
                        <div
                            key={col}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                                transition-colors cursor-pointer
                                ${isSelected
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                }
                            `}
                            onClick={() => handlePermissionChange(page.name, col)}
                        >
                            {col}
                            {isSelected ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        </div>
                    )
                })}

                {hasMoreColumns && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 rounded-full"
                        onClick={() => setShowAllColumns(true)}
                    >
                        +{filteredColumns.length - 6} more
                    </Button>
                )}

                {showAllColumns && filteredColumns.length > 6 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 rounded-full"
                        onClick={() => setShowAllColumns(false)}
                    >
                        Show less
                    </Button>
                )}

                {filteredColumns.length === 0 && (
                    <div className="text-sm text-muted-foreground italic">No columns match your filter</div>
                )}
            </div>
        </Card>
    )
}

export default AddRole

