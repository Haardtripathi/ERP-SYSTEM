
"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { addRole, getPagesAndColumns } from "@/services/adminService"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight } from "lucide-react"

const AddRole = () => {
    const navigate = useNavigate()
    const [roleName, setRoleName] = useState("")
    const [permissions, setPermissions] = useState([])
    const [availablePages, setAvailablePages] = useState([])
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)

    useEffect(() => {
        // Fetch all pages & columns
        getPagesAndColumns()
            .then((data) => {
                console.log(data)
                setAvailablePages(data)
            })
            .catch(() => toast.error("Failed to load pages"))
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
                // If already has any columns selected, unselect all by setting empty array
                // but keep the page entry
                updatedPermissions[pageIndex].columns = []
            } else {
                // Select all columns
                updatedPermissions.push({ page, columns: [...columns] })
            }
            return updatedPermissions
        })
    }

    // Handle "Select All" for an entire section
    const handleSelectAllSection = (sectionPages) => {
        setPermissions((prevPermissions) => {
            const updatedPermissions = [...prevPermissions]

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
        return pagePermissions && pagePermissions.columns.length === columns.length
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!roleName || permissions.length === 0) {
            return toast.error("Role name and permissions are required")
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
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSelectAllSection(availablePages[currentSectionIndex]?.pages)}
                                            className="text-sm"
                                        >
                                            Select All
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeselectAllSection(availablePages[currentSectionIndex]?.pages)}
                                            disabled={!isAnySectionSelected(availablePages[currentSectionIndex]?.pages)}
                                            className="text-sm"
                                        >
                                            Deselect All
                                        </Button>
                                    </div>
                                </div>

                                {availablePages[currentSectionIndex]?.pages.map((page) => (
                                    <div key={page.name} className="mb-6 bg-gray-50 p-4 rounded-md">
                                        <div className="flex items-center justify-between mb-3 border-b pb-2">
                                            <h4 className="font-semibold text-lg">{page.name}</h4>
                                            <div className="flex gap-2">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <Checkbox
                                                        checked={isAllSelected(page.name, page.columns)}
                                                        onCheckedChange={() => handleSelectAll(page.name, page.columns)}
                                                    />
                                                    <span>Select All</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                                            {page.columns.map((col) => (
                                                <label
                                                    key={col}
                                                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={permissions.find((p) => p.page === page.name)?.columns.includes(col) || false}
                                                        onCheckedChange={() => handlePermissionChange(page.name, col)}
                                                    />
                                                    <span className="text-sm">{col}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
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

export default AddRole

