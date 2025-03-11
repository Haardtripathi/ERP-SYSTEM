// import React, { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
// import { addRole, getPagesAndColumns } from "@/services/adminService";
// import { useNavigate } from "react-router-dom";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";

// const AddRole = () => {
//     const navigate = useNavigate();
//     const [roleName, setRoleName] = useState("");
//     const [permissions, setPermissions] = useState([]);
//     const [availablePages, setAvailablePages] = useState([]);

//     useEffect(() => {
//         // Fetch available pages & columns from backend
//         getPagesAndColumns().then((data) => {
//             setAvailablePages(data);
//         }).catch(() => toast.error("Failed to load pages"));
//     }, []);

//     // Handle selecting/unselecting individual column
//     const handlePermissionChange = (page, column) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions];
//             const pageIndex = updatedPermissions.findIndex((p) => p.page === page);

//             if (pageIndex !== -1) {
//                 // Toggle column selection
//                 const columnIndex = updatedPermissions[pageIndex].columns.indexOf(column);
//                 if (columnIndex !== -1) {
//                     updatedPermissions[pageIndex].columns.splice(columnIndex, 1);
//                 } else {
//                     updatedPermissions[pageIndex].columns.push(column);
//                 }
//             } else {
//                 // Add new page with column
//                 updatedPermissions.push({ page, columns: [column] });
//             }
//             return updatedPermissions;
//         });
//     };

//     // Handle "Select All" for a page
//     const handleSelectAll = (page, columns) => {
//         setPermissions((prevPermissions) => {
//             const updatedPermissions = [...prevPermissions];
//             const pageIndex = updatedPermissions.findIndex((p) => p.page === page);

//             if (pageIndex !== -1) {
//                 // If already selected, unselect all
//                 updatedPermissions.splice(pageIndex, 1);
//             } else {
//                 // Select all columns
//                 updatedPermissions.push({ page, columns });
//             }
//             return updatedPermissions;
//         });
//     };

//     // Check if all columns are selected for a page
//     const isAllSelected = (page, columns) => {
//         const pagePermissions = permissions.find((p) => p.page === page);
//         return pagePermissions && pagePermissions.columns.length === columns.length;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!roleName || permissions.length === 0) {
//             return toast.error("Role name and permissions are required");
//         }

//         try {
//             await addRole({ roleName, permissions });
//             toast.success("Role added successfully!");
//             navigate("/roles");
//         } catch (error) {
//             toast.error("Failed to add role");
//         }
//     };

//     return (
//         <div className="container mx-auto p-8">
//             <Card className="p-6">
//                 <h1 className="text-2xl font-bold mb-4">Add Role</h1>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div>
//                         <label className="block font-medium mb-1">Role Name</label>
//                         <Input
//                             type="text"
//                             value={roleName}
//                             onChange={(e) => setRoleName(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div>
//                         <h2 className="text-lg font-medium mb-2">Permissions</h2>
//                         {availablePages.map((page) => (
//                             <div key={page.name} className="mb-4">
//                                 <div className="flex items-center justify-between">
//                                     <h3 className="font-semibold">{page.name}</h3>
//                                     <label className="flex items-center space-x-2">
//                                         <Checkbox
//                                             checked={isAllSelected(page.name, page.columns)}
//                                             onCheckedChange={() => handleSelectAll(page.name, page.columns)}
//                                         />
//                                         <span>Select All</span>
//                                     </label>
//                                 </div>
//                                 <div className="grid grid-cols-3 gap-2 mt-2">
//                                     {page.columns.map((col) => (
//                                         <label key={col} className="flex items-center space-x-2">
//                                             <Checkbox
//                                                 checked={
//                                                     permissions.find((p) => p.page === page.name)?.columns.includes(col) || false
//                                                 }
//                                                 onCheckedChange={() => handlePermissionChange(page.name, col)}
//                                             />
//                                             <span>{col}</span>
//                                         </label>
//                                     ))}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     <Button type="submit" className="w-full">Add Role</Button>
//                 </form>
//             </Card>
//         </div>
//     );
// };

// export default AddRole;




import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { addRole, getPagesAndColumns } from "@/services/adminService";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const AddRole = () => {
    const navigate = useNavigate();
    const [roleName, setRoleName] = useState("");
    const [permissions, setPermissions] = useState([]);
    const [availablePages, setAvailablePages] = useState([]);

    useEffect(() => {
        // Fetch all pages & columns (not just Lead pages)
        getPagesAndColumns()
            .then((data) => {
                setAvailablePages(data);
            })
            .catch(() => toast.error("Failed to load pages"));
    }, []);

    // Handle selecting/unselecting a single column
    const handlePermissionChange = (page, column) => {
        setPermissions((prevPermissions) => {
            const updatedPermissions = [...prevPermissions];
            const pageIndex = updatedPermissions.findIndex((p) => p.page === page);

            if (pageIndex !== -1) {
                // Toggle column selection
                const columnIndex = updatedPermissions[pageIndex].columns.indexOf(column);
                if (columnIndex !== -1) {
                    updatedPermissions[pageIndex].columns.splice(columnIndex, 1);
                } else {
                    updatedPermissions[pageIndex].columns.push(column);
                }
            } else {
                // Add new page with column
                updatedPermissions.push({ page, columns: [column] });
            }
            return updatedPermissions;
        });
    };

    // Handle "Select All" for a page
    const handleSelectAll = (page, columns) => {
        setPermissions((prevPermissions) => {
            const updatedPermissions = [...prevPermissions];
            const pageIndex = updatedPermissions.findIndex((p) => p.page === page);

            if (pageIndex !== -1) {
                // If already selected, unselect all
                updatedPermissions.splice(pageIndex, 1);
            } else {
                // Select all columns
                updatedPermissions.push({ page, columns });
            }
            return updatedPermissions;
        });
    };

    // Handle "Select All" for an entire section (e.g., Lead, Users)
    const handleSelectAllSection = (sectionPages) => {
        setPermissions((prevPermissions) => {
            const updatedPermissions = [...prevPermissions];

            sectionPages.forEach((page) => {
                const pageIndex = updatedPermissions.findIndex((p) => p.page === page.name);
                if (pageIndex === -1) {
                    // If not already selected, add all columns
                    updatedPermissions.push({ page: page.name, columns: page.columns });
                }
            });

            return updatedPermissions;
        });
    };

    // Check if all columns are selected for a page
    const isAllSelected = (page, columns) => {
        const pagePermissions = permissions.find((p) => p.page === page);
        return pagePermissions && pagePermissions.columns.length === columns.length;
    };

    // Check if all pages in a section are selected
    const isAllSectionSelected = (sectionPages) => {
        return sectionPages.every((page) => isAllSelected(page.name, page.columns));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roleName || permissions.length === 0) {
            return toast.error("Role name and permissions are required");
        }

        try {
            await addRole({ roleName, permissions });
            toast.success("Role added successfully!");
            navigate("/roles");
        } catch (error) {
            toast.error("Failed to add role");
        }
    };

    return (
        <div className="container mx-auto p-8">
            <Card className="p-6">
                <h1 className="text-2xl font-bold mb-4">Add Role</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role Name Input */}
                    <div>
                        <label className="block font-medium mb-1">Role Name</label>
                        <Input
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Permissions Section */}
                    <div>
                        <h2 className="text-lg font-medium mb-2">Permissions</h2>
                        {availablePages.map((section) => (
                            <div key={section.section} className="mb-6 border-b pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-semibold">{section.section}</h3>
                                    <label className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={isAllSectionSelected(section.pages)}
                                            onCheckedChange={() => handleSelectAllSection(section.pages)}
                                        />
                                        <span>Select All</span>
                                    </label>
                                </div>

                                {section.pages.map((page) => (
                                    <div key={page.name} className="mb-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold">{page.name}</h4>
                                            <label className="flex items-center space-x-2">
                                                <Checkbox
                                                    checked={isAllSelected(page.name, page.columns)}
                                                    onCheckedChange={() => handleSelectAll(page.name, page.columns)}
                                                />
                                                <span>Select All</span>
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            {page.columns.map((col) => (
                                                <label key={col} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={
                                                            permissions.find((p) => p.page === page.name)?.columns.includes(col) || false
                                                        }
                                                        onCheckedChange={() => handlePermissionChange(page.name, col)}
                                                    />
                                                    <span>{col}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full">Add Role</Button>
                </form>
            </Card>
        </div>
    );
};

export default AddRole;
