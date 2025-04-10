// "use client"

// import { useState, useEffect } from "react"
// import { toast } from "react-hot-toast"
// import { getPagesAndColumns, getEditRoleData, updateRole } from "@/services/adminService"
// import { useNavigate, useParams } from "react-router-dom"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ChevronLeft, ChevronRight, Eye, Edit, X, ArrowLeft, Check, Save } from "lucide-react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Switch } from "@/components/ui/switch"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// const EditRolePage = () => {
//     const navigate = useNavigate()
//     const { id } = useParams()
//     const [roleName, setRoleName] = useState("")
//     const [permissions, setPermissions] = useState([])
//     const [availablePages, setAvailablePages] = useState([])
//     const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
//     const [searchFilter, setSearchFilter] = useState("")
//     const [loading, setLoading] = useState(true)
//     const [activeTab, setActiveTab] = useState("view")
//     const [showSelected, setShowSelected] = useState(false)
//     // Track which sections have been saved
//     const [savedSections, setSavedSections] = useState([])
//     const [originalRole, setOriginalRole] = useState(null)

//     useEffect(() => {
//         // Fetch role data and all pages & columns
//         const fetchData = async () => {
//             try {
//                 // Fetch all available pages & columns first
//                 const pagesData = await getPagesAndColumns()
//                 setAvailablePages(pagesData)

//                 // Fetch role data
//                 const roleData = await getEditRoleData(id)
//                 console.log("Fetched role data:", roleData)
//                 setOriginalRole(roleData)

//                 // Set role name - handle different possible structures
//                 if (roleData && roleData.name) {
//                     setRoleName(roleData.name)
//                 } else if (roleData && roleData[0] && roleData[0].name) {
//                     setRoleName(roleData[0].name)
//                 } else {
//                     console.error("Role name not found in data:", roleData)
//                     toast.error("Could not find role name")
//                 }

//                 // Handle permissions - check if roleData is an array or object
//                 let permissionsData = []

//                 if (Array.isArray(roleData)) {
//                     // If roleData is an array, use the first item
//                     if (roleData[0] && roleData[0].permissions) {
//                         permissionsData = roleData[0].permissions
//                     }
//                 } else if (roleData && roleData.permissions) {
//                     // If roleData is an object with permissions
//                     permissionsData = roleData.permissions
//                 }

//                 console.log("Permissions data:", permissionsData)

//                 // Format permissions for our component state
//                 const formattedPermissions = []

//                 if (Array.isArray(permissionsData) && permissionsData.length > 0) {
//                     permissionsData.forEach((perm) => {
//                         // Handle different permission structures
//                         if (perm) {
//                             const page = perm.page || perm.pageName
//                             const columns = perm.columns || perm.columnNames || []

//                             if (page) {
//                                 formattedPermissions.push({
//                                     page: page,
//                                     columns: Array.isArray(columns) ? columns : [],
//                                 })
//                             }
//                         }
//                     })
//                 }

//                 console.log("Formatted permissions:", formattedPermissions)
//                 setPermissions(formattedPermissions)

//                 // Mark all sections as saved initially since we're editing an existing role
//                 const sectionNames = pagesData.map((section) => section.section)
//                 setSavedSections(sectionNames)

//                 setLoading(false)
//             } catch (error) {
//                 console.error("Error fetching data:", error)
//                 toast.error("Failed to load role data")
//                 setLoading(false)
//             }
//         }

//         fetchData()
//     }, [id])

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

//             // Mark the current section as unsaved when changes are made
//             if (availablePages[currentSectionIndex]) {
//                 const currentSection = availablePages[currentSectionIndex].section
//                 setSavedSections((prev) => prev.filter((section) => section !== currentSection))
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

//             // Mark the current section as unsaved when changes are made
//             if (availablePages[currentSectionIndex]) {
//                 const currentSection = availablePages[currentSectionIndex].section
//                 setSavedSections((prev) => prev.filter((section) => section !== currentSection))
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

//             // Mark the current section as unsaved when changes are made
//             if (availablePages[currentSectionIndex]) {
//                 const currentSection = availablePages[currentSectionIndex].section
//                 setSavedSections((prev) => prev.filter((section) => section !== currentSection))
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

//             // Mark the current section as unsaved when changes are made
//             if (availablePages[currentSectionIndex]) {
//                 const currentSection = availablePages[currentSectionIndex].section
//                 setSavedSections((prev) => prev.filter((section) => section !== currentSection))
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

//     // New function to handle saving the current section
//     const handleSaveSection = () => {
//         if (!availablePages[currentSectionIndex]) return

//         const currentSection = availablePages[currentSectionIndex].section

//         // Check if any permissions were selected in this section
//         const hasSelectionsInCurrentSection = availablePages[currentSectionIndex].pages.some((page) => {
//             const pagePermissions = permissions.find((p) => p.page === page.name)
//             return pagePermissions && pagePermissions.columns.length > 0
//         })

//         // Add this section to saved sections if not already saved
//         if (!savedSections.includes(currentSection)) {
//             setSavedSections((prev) => [...prev, currentSection])
//         }

//         toast.success(
//             hasSelectionsInCurrentSection
//                 ? `Saved selections for ${currentSection}`
//                 : `No selections made for ${currentSection}`,
//             { duration: 2000 },
//         )

//         // Auto advance to next section if not on the last section
//         if (currentSectionIndex < availablePages.length - 1) {
//             setTimeout(() => {
//                 goToNextSection()
//             }, 300)
//         }
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
//             console.log(id, { roleName, permissions: filteredPermissions })
//             await updateRole(id, { roleName, permissions: filteredPermissions })
//             toast.success("Role updated successfully!")
//             navigate("/roles")
//         } catch (error) {
//             console.error("Error updating role:", error)
//             toast.error("Failed to update role")
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

//     // Check if current section has any selections
//     const currentSectionHasSelections = () => {
//         if (!availablePages[currentSectionIndex]) return false

//         return availablePages[currentSectionIndex].pages.some((page) => {
//             const pagePermissions = permissions.find((p) => p.page === page.name)
//             return pagePermissions && pagePermissions.columns.length > 0
//         })
//     }

//     // Check if the current section has been saved
//     const isCurrentSectionSaved = () => {
//         if (!availablePages[currentSectionIndex]) return false
//         return savedSections.includes(availablePages[currentSectionIndex].section)
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

//     // Check if there are any changes compared to the original role
//     const hasChanges = () => {
//         if (!originalRole) return false

//         // Check if name changed
//         let originalName = ""
//         if (Array.isArray(originalRole) && originalRole[0]) {
//             originalName = originalRole[0].name || ""
//         } else {
//             originalName = originalRole.name || ""
//         }

//         if (roleName !== originalName) return true

//         // Check if permissions changed
//         let originalPermissions = []
//         if (Array.isArray(originalRole) && originalRole[0] && originalRole[0].permissions) {
//             originalPermissions = originalRole[0].permissions
//         } else if (originalRole && originalRole.permissions) {
//             originalPermissions = originalRole.permissions
//         }

//         const originalPermCount = originalPermissions.reduce(
//             (total, perm) => total + (perm.columns?.length || perm.columnNames?.length || 0),
//             0,
//         )

//         if (totalSelected !== originalPermCount) return true

//         // More detailed check could be implemented here if needed

//         return false
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
//                             type="button"
//                         >
//                             <ArrowLeft className="h-5 w-5" /> Back to Roles
//                         </Button>
//                         <CardTitle className="text-2xl font-bold">Update Role</CardTitle>
//                         <div className="w-28" /> {/* Spacer for alignment */}
//                     </div>
//                 </CardHeader>

//                 <CardContent className="p-6">
//                     {loading ? (
//                         <div className="p-10 text-center">
//                             <div className="animate-pulse text-lg">Loading role data...</div>
//                         </div>
//                     ) : (
//                         <form onSubmit={handleSubmit} className="space-y-6">
//                             {/* Role Name Input */}
//                             <div className="flex items-center justify-between">
//                                 <div className="space-y-2 w-1/2">
//                                     <label className="text-base font-semibold">Role Name</label>
//                                     <Input
//                                         type="text"
//                                         value={roleName}
//                                         onChange={(e) => setRoleName(e.target.value)}
//                                         required
//                                         placeholder="Enter role name"
//                                         className="h-12 text-base px-4"
//                                     />
//                                 </div>

//                                 <div className="text-right">
//                                     <div className="text-sm text-muted-foreground mb-1">
//                                         Sections saved: {savedSections.length} / {availablePages.length}
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <div className="text-sm font-medium">
//                                             Total permissions selected: {totalSelected} / {totalAvailable}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Permissions Section */}
//                             <div className="bg-background rounded-lg border">
//                                 <div className="flex items-center justify-between p-4 border-b bg-muted/30">
//                                     <div className="flex items-center gap-4">
//                                         <h2 className="text-lg font-semibold">Permissions</h2>
//                                         <Select
//                                             value={currentSectionIndex.toString()}
//                                             onValueChange={(value) => setCurrentSectionIndex(Number.parseInt(value))}
//                                         >
//                                             <SelectTrigger className="w-[200px]">
//                                                 <SelectValue placeholder="Select section" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 {availablePages.map((section, index) => (
//                                                     <SelectItem key={index} value={index.toString()}>
//                                                         {section.section}
//                                                         {savedSections.includes(section.section) && " ✓"}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                     </div>

//                                     <div className="flex items-center gap-2">
//                                         <Button
//                                             type="button"
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={goToPreviousSection}
//                                             disabled={currentSectionIndex === 0}
//                                         >
//                                             <ChevronLeft size={16} />
//                                         </Button>
//                                         <span className="text-sm">
//                                             {currentSectionIndex + 1} / {availablePages.length}
//                                         </span>
//                                         <Button
//                                             type="button"
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={goToNextSection}
//                                             disabled={currentSectionIndex === availablePages.length - 1}
//                                         >
//                                             <ChevronRight size={16} />
//                                         </Button>
//                                     </div>
//                                 </div>

//                                 {/* Current Section */}
//                                 {availablePages.length > 0 ? (
//                                     <div className="p-4">
//                                         <div className="flex items-center justify-between mb-4">
//                                             <div className="flex items-center gap-3">
//                                                 <h3 className="text-2xl font-bold text-primary">
//                                                     {availablePages[currentSectionIndex]?.section}
//                                                 </h3>
//                                                 {isCurrentSectionSaved() && (
//                                                     <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
//                                                         <Check className="h-3 w-3 mr-1" /> Saved
//                                                     </Badge>
//                                                 )}
//                                             </div>
//                                             <div className="flex items-center gap-3">
//                                                 <div className="flex items-center space-x-2">
//                                                     <Switch id="show-selected" checked={showSelected} onCheckedChange={setShowSelected} />
//                                                     <label htmlFor="show-selected" className="text-sm cursor-pointer">
//                                                         Show selected only
//                                                     </label>
//                                                 </div>
//                                                 <Button
//                                                     type="button"
//                                                     variant={
//                                                         isAllSectionSelected(availablePages[currentSectionIndex]?.pages) ? "destructive" : "default"
//                                                     }
//                                                     onClick={() => handleSelectAllSection(availablePages[currentSectionIndex]?.pages)}
//                                                     className="h-9 text-sm flex items-center gap-1"
//                                                 >
//                                                     {isAllSectionSelected(availablePages[currentSectionIndex]?.pages) ? (
//                                                         <>
//                                                             <X className="h-4 w-4" /> Deselect All
//                                                         </>
//                                                     ) : (
//                                                         <>Select All</>
//                                                     )}
//                                                 </Button>
//                                             </div>
//                                         </div>

//                                         {/* Tabs for View/Edit separation */}
//                                         <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
//                                             <TabsList className="grid w-full grid-cols-2 h-10">
//                                                 <TabsTrigger value="view" className="text-base flex items-center gap-2">
//                                                     <Eye className="h-4 w-4" /> View Permissions
//                                                 </TabsTrigger>
//                                                 <TabsTrigger value="edit" className="text-base flex items-center gap-2">
//                                                     <Edit className="h-4 w-4" /> Edit Permissions
//                                                 </TabsTrigger>
//                                             </TabsList>

//                                             <TabsContent value="view" className="mt-4">
//                                                 <PermissionsTable
//                                                     pages={getAllColumnsForCurrentSection()}
//                                                     handlePermissionChange={handlePermissionChange}
//                                                     handleSelectAll={handleSelectAll}
//                                                     isColumnSelected={isColumnSelected}
//                                                     isAllSelected={isAllSelected}
//                                                 />
//                                             </TabsContent>

//                                             <TabsContent value="edit" className="mt-4">
//                                                 <PermissionsTable
//                                                     pages={getAllColumnsForCurrentSection()}
//                                                     handlePermissionChange={handlePermissionChange}
//                                                     handleSelectAll={handleSelectAll}
//                                                     isColumnSelected={isColumnSelected}
//                                                     isAllSelected={isAllSelected}
//                                                 />
//                                             </TabsContent>
//                                         </Tabs>

//                                         {/* Section Save Button */}
//                                         <div className="mt-6 flex justify-end">
//                                             <Button
//                                                 type="button"
//                                                 onClick={handleSaveSection}
//                                                 className="flex items-center gap-2"
//                                                 variant={isCurrentSectionSaved() ? "outline" : "default"}
//                                             >
//                                                 <Save className="h-4 w-4" />
//                                                 {isCurrentSectionSaved()
//                                                     ? `Update ${availablePages[currentSectionIndex]?.section} Selections`
//                                                     : `Save ${availablePages[currentSectionIndex]?.section} Selections`}
//                                             </Button>
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <div className="p-10 text-center text-muted-foreground text-lg">No permissions available</div>
//                                 )}
//                             </div>
//                         </form>
//                     )}
//                 </CardContent>

//                 <CardFooter className="border-t p-6">
//                     <div className="flex justify-between items-center w-full">
//                         <div className="text-sm text-muted-foreground">
//                             {savedSections.length === 0 ? (
//                                 <span>No sections saved yet</span>
//                             ) : (
//                                 <span>
//                                     {savedSections.length} section{savedSections.length !== 1 ? "s" : ""} saved
//                                 </span>
//                             )}
//                         </div>
//                         <div className="flex gap-4">
//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={() => navigate("/roles")}
//                                 className="h-12 px-6 text-base font-medium"
//                             >
//                                 Cancel
//                             </Button>
//                             <Button
//                                 type="submit"
//                                 onClick={(e) => {
//                                     e.preventDefault()
//                                     handleSubmit(e)
//                                 }}
//                                 disabled={!roleName || getTotalSelectedPermissions() === 0 || savedSections.length === 0}
//                                 className="h-12 px-6 text-base font-medium"
//                             >
//                                 Update Role
//                             </Button>
//                         </div>
//                     </div>
//                 </CardFooter>
//             </Card>
//         </div>
//     )
// }

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
//                                         type="button"
//                                         size="sm"
//                                         variant={isAllSelected(page.name, page.filteredColumns) ? "destructive" : "default"}
//                                         onClick={() => handleSelectAll(page.name, page.filteredColumns)}
//                                         className="flex items-center gap-1 min-w-[90px] justify-center"
//                                     >
//                                         {isAllSelected(page.name, page.filteredColumns) ? (
//                                             <>
//                                                 <X className="h-3.5 w-3.5" /> Deselect
//                                             </>
//                                         ) : (
//                                             <>Select All</>
//                                         )}
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

// export default EditRolePage









"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { getPagesAndColumns, getEditRoleData, updateRole } from "@/services/adminService"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Eye, Edit, X, ArrowLeft, Check, Save } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add these constants at the top of the file, after the imports and before the EditRolePage component
const highlightedColumns = [
    "_id",
    "dispatchedId",
    "dataId",
    "isDispatched",
    "isHold",
    "isCancelled",
    "payment_received",
    "confirmedId",
    "isDelivered",
    "isComplain",
    "isReturn",
    "is_sent_to_pending",
]
const pageToActionsMap = {
    "/leads": ["send", "update", "delete"],
    "/incoming": ["send", "update", "delete"],
    "/workbook": ["send", "update", "delete"],
    "/pending": ["send", "update", "delete"],
    "/confirmed": ["action", "delete"],
    "/sheet-generator": ["download", "delete"],
    // "/labels-generator": ["generate_label", "delete"],
    "/labels-generator": ["generate_label"],

    "/dispatched": ["update_location", "delete", "delivered", "raise_complain"],
    // "/delivered": ["delete"],
    // "/complain": ["delete"],
    // "/return": ["delete"],
    // "/payment": ["delete"]
    "/delivered": ["Add Payment"],
    "/complain": [],
    "/return": [],
    "/payment": ["Payment"]
}

const isDeletedColumns = ["isDeleted"]

const EditRolePage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
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
    const [originalRole, setOriginalRole] = useState(null)

    useEffect(() => {
        // Fetch role data and all pages & columns
        const fetchData = async () => {
            try {
                // Fetch all available pages & columns first
                const pagesData = await getPagesAndColumns()
                setAvailablePages(pagesData)

                // Fetch role data
                const roleData = await getEditRoleData(id)
                console.log("Fetched role data:", roleData)
                setOriginalRole(roleData)

                // Set role name - handle different possible structures
                if (roleData && roleData.name) {
                    setRoleName(roleData.name)
                } else if (roleData && roleData[0] && roleData[0].name) {
                    setRoleName(roleData[0].name)
                } else {
                    console.error("Role name not found in data:", roleData)
                    toast.error("Could not find role name")
                }

                // Handle permissions - check if roleData is an array or object
                let permissionsData = []

                if (Array.isArray(roleData)) {
                    // If roleData is an array, use the first item
                    if (roleData[0] && roleData[0].permissions) {
                        permissionsData = roleData[0].permissions
                    }
                } else if (roleData && roleData.permissions) {
                    // If roleData is an object with permissions
                    permissionsData = roleData.permissions
                }

                console.log("Permissions data:", permissionsData)

                // Format permissions for our component state
                const formattedPermissions = []

                if (Array.isArray(permissionsData) && permissionsData.length > 0) {
                    permissionsData.forEach((perm) => {
                        // Handle different permission structures
                        if (perm) {
                            const page = perm.page || perm.pageName
                            const columns = perm.columns || perm.columnNames || []

                            if (page) {
                                formattedPermissions.push({
                                    page: page,
                                    columns: Array.isArray(columns) ? columns : [],
                                })
                            }
                        }
                    })
                }

                console.log("Formatted permissions:", formattedPermissions)
                setPermissions(formattedPermissions)

                // Mark all sections as saved initially since we're editing an existing role
                const sectionNames = pagesData.map((section) => section.section)
                setSavedSections(sectionNames)

                setLoading(false)
            } catch (error) {
                console.error("Error fetching data:", error)
                toast.error("Failed to load role data")
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

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

            // Mark the current section as unsaved when changes are made
            if (availablePages[currentSectionIndex]) {
                const currentSection = availablePages[currentSectionIndex].section
                setSavedSections((prev) => prev.filter((section) => section !== currentSection))
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

            // Mark the current section as unsaved when changes are made
            if (availablePages[currentSectionIndex]) {
                const currentSection = availablePages[currentSectionIndex].section
                setSavedSections((prev) => prev.filter((section) => section !== currentSection))
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

            // Mark the current section as unsaved when changes are made
            if (availablePages[currentSectionIndex]) {
                const currentSection = availablePages[currentSectionIndex].section
                setSavedSections((prev) => prev.filter((section) => section !== currentSection))
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

            // Mark the current section as unsaved when changes are made
            if (availablePages[currentSectionIndex]) {
                const currentSection = availablePages[currentSectionIndex].section
                setSavedSections((prev) => prev.filter((section) => section !== currentSection))
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
        const hasSelectionsInCurrentSection = availablePages[currentSectionIndex].pages.some((page) => {
            const pagePermissions = permissions.find((p) => p.page === page.name)
            return pagePermissions && pagePermissions.columns.length > 0
        })

        // Add this section to saved sections if not already saved
        if (!savedSections.includes(currentSection)) {
            setSavedSections((prev) => [...prev, currentSection])
        }

        toast.success(
            hasSelectionsInCurrentSection
                ? `Saved selections for ${currentSection}`
                : `No selections made for ${currentSection}`,
            { duration: 2000 },
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
            console.log(id, { roleName, permissions: filteredPermissions })
            await updateRole(id, { roleName, permissions: filteredPermissions })
            toast.success("Role updated successfully!")
            navigate("/roles")
        } catch (error) {
            console.error("Error updating role:", error)
            toast.error("Failed to update role")
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

        return availablePages[currentSectionIndex].pages.some((page) => {
            const pagePermissions = permissions.find((p) => p.page === page.name)
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

        // If showing only selected columns
        if (showSelected) {
            return pagesOfType
                .map((page) => {
                    const selectedColumns = page.columns.filter(
                        (col) =>
                            isColumnSelected(page.name, col) &&
                            (!searchFilter || col.toLowerCase().includes(searchFilter.toLowerCase())),
                    )
                    // Get action columns from the map, if available
                    const actionColumns = pageToActionsMap[page.name] || []
                    // Merge selected columns with action columns (remove duplicates)
                    const mergedColumns = Array.from(new Set([...selectedColumns, ...actionColumns]))
                    return { ...page, filteredColumns: mergedColumns }
                })
                .filter((page) => page.filteredColumns.length > 0)
        }

        // Otherwise, just get filtered columns and merge with action columns
        return pagesOfType.map((page) => {
            const filteredColumns = page.columns.filter(
                (col) => !searchFilter || col.toLowerCase().includes(searchFilter.toLowerCase()),
            )
            // Get action columns from the map, if available
            const actionColumns = pageToActionsMap[page.name] || []
            // Merge filteredColumns with actionColumns (remove duplicates)
            const mergedColumns = Array.from(new Set([...filteredColumns, ...actionColumns]))
            return { ...page, filteredColumns: mergedColumns }
        })
    }

    // Check if there are any changes compared to the original role
    const hasChanges = () => {
        if (!originalRole) return false

        // Check if name changed
        let originalName = ""
        if (Array.isArray(originalRole) && originalRole[0]) {
            originalName = originalRole[0].name || ""
        } else {
            originalName = originalRole.name || ""
        }

        if (roleName !== originalName) return true

        // Check if permissions changed
        let originalPermissions = []
        if (Array.isArray(originalRole) && originalRole[0] && originalRole[0].permissions) {
            originalPermissions = originalRole[0].permissions
        } else if (originalRole && originalRole.permissions) {
            originalPermissions = originalRole.permissions
        }

        const originalPermCount = originalPermissions.reduce(
            (total, perm) => total + (perm.columns?.length || perm.columnNames?.length || 0),
            0,
        )

        if (totalSelected !== originalPermCount) return true

        // More detailed check could be implemented here if needed

        return false
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
                        <CardTitle className="text-2xl font-bold">Update Role</CardTitle>
                        <div className="w-28" /> {/* Spacer for alignment */}
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {loading ? (
                        <div className="p-10 text-center">
                            <div className="animate-pulse text-lg">Loading role data...</div>
                        </div>
                    ) : (
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
                                                    <SelectItem key={index} value={index.toString()}>
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
                                {availablePages.length > 0 ? (
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-bold text-primary">
                                                    {availablePages[currentSectionIndex]?.section}
                                                </h3>
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
                                                <Button
                                                    type="button"
                                                    variant={
                                                        isAllSectionSelected(availablePages[currentSectionIndex]?.pages) ? "destructive" : "default"
                                                    }
                                                    onClick={() => handleSelectAllSection(availablePages[currentSectionIndex]?.pages)}
                                                    className="h-9 text-sm flex items-center gap-1"
                                                >
                                                    {isAllSectionSelected(availablePages[currentSectionIndex]?.pages) ? (
                                                        <>
                                                            <X className="h-4 w-4" /> Deselect All
                                                        </>
                                                    ) : (
                                                        <>Select All</>
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
                                                    isDeletedColumns={isDeletedColumns}
                                                    pageToActionsMap={pageToActionsMap}
                                                    highlightedColumns={highlightedColumns}
                                                />
                                            </TabsContent>

                                            <TabsContent value="edit" className="mt-4">
                                                <PermissionsTable
                                                    pages={getAllColumnsForCurrentSection()}
                                                    handlePermissionChange={handlePermissionChange}
                                                    handleSelectAll={handleSelectAll}
                                                    isColumnSelected={isColumnSelected}
                                                    isAllSelected={isAllSelected}
                                                    isDeletedColumns={isDeletedColumns}
                                                    pageToActionsMap={pageToActionsMap}
                                                    highlightedColumns={highlightedColumns}
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
                    )}
                </CardContent>

                <CardFooter className="border-t p-6">
                    <div className="flex justify-between items-center w-full">
                        <div className="text-sm text-muted-foreground">
                            {savedSections.length === 0 ? (
                                <span>No sections saved yet</span>
                            ) : (
                                <span>
                                    {savedSections.length} section{savedSections.length !== 1 ? "s" : ""} saved
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
                                    e.preventDefault()
                                    handleSubmit(e)
                                }}
                                disabled={!roleName || getTotalSelectedPermissions() === 0 || savedSections.length === 0}
                                className="h-12 px-6 text-base font-medium"
                            >
                                Update Role
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

// Update the PermissionsTable component to include the styling for different column types
const PermissionsTable = ({
    pages,
    handlePermissionChange,
    handleSelectAll,
    isColumnSelected,
    isAllSelected,
    isDeletedColumns,
    pageToActionsMap,
    highlightedColumns,
}) => {
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
                                                className={`cursor-pointer px-3 py-1.5 text-sm border ${isDeletedColumns.includes(column)
                                                    ? "bg-red-100 text-red-800 border-red-300"
                                                    : isColumnSelected(page.name, column)
                                                        ? "bg-green-100 text-green-800 border-green-800"
                                                        : pageToActionsMap[page.name] && pageToActionsMap[page.name].includes(column)
                                                            ? "bg-blue-100 text-blue-800 border-blue-300"
                                                            : highlightedColumns.includes(column)
                                                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                                                : "bg-white text-gray-800 border-gray-300"
                                                    }`}
                                                onClick={() => handlePermissionChange(page.name, column)}
                                            >
                                                {column}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
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
                                            <>Select All</>
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

export default EditRolePage