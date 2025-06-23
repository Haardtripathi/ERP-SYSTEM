// import React, { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
// import { getAllRoles } from "@/services/adminService";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// const Roles = () => {
//     const [roles, setRoles] = useState([]);

//     useEffect(() => {
//         getAllRoles()
//             .then((data) => {
//                 setRoles(data);
//             })
//             .catch(() => toast.error("Failed to load roles"));
//     }, []);

//     return (
//         <div className="container mx-auto p-8">
//             <Card className="p-6">
//                 <h1 className="text-2xl font-bold mb-4">All Roles</h1>
//                 {roles.length === 0 ? (
//                     <p>No roles available</p>
//                 ) : (
//                     <ul className="space-y-4">
//                         {roles.map((role) => (
//                             <li key={role._id} className="p-4 border rounded-lg shadow">
//                                 <h2 className="text-lg font-semibold">{role.name}</h2>
//                                 {role.permissions.length > 0 ? (
//                                     <div className="mt-2">
//                                         <h3 className="font-medium">Permissions:</h3>
//                                         <ul className="ml-4 list-disc">
//                                             {role.permissions.map((perm, index) => (
//                                                 <li key={index} className="mt-1">
//                                                     <strong>{perm.page}</strong>: {perm.columns.join(", ")}
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                     </div>
//                                 ) : (
//                                     <p className="text-gray-500">No permissions assigned</p>
//                                 )}
//                             </li>
//                         ))}
//                     </ul>
//                 )}
//             </Card>
//         </div>
//     );
// };

// export default Roles;



import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getAllRoles, deleteRole } from "@/services/adminService";
import { useNavigate } from "react-router-dom";

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedRoles, setExpandedRoles] = useState({});
    const navigate = useNavigate();

    const fetchRoles = () => {
        getAllRoles()
            .then((data) => {
                setRoles(data);
                const expanded = {};
                data.forEach((role) => {
                    expanded[role._id] = false;
                });
                setExpandedRoles(expanded);
            })
            .catch(() => toast.error("Failed to load roles"));
    };

    useEffect(() => {
        fetchRoles();
    }, []);


    const handleEditClick = (id) => {
        navigate(`/edit-role-data/${id}`);
    };

    const handleDeleteClick = async (id) => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this role?");
            if (!confirmDelete) return;

            const res = await deleteRole(id); // assuming backend expects { id } in body
            if (res.success) {
                toast.success("Role deleted successfully");
                fetchRoles(); // call it again to refresh the list
            } else {
                toast.error("Failed to delete role");
            }
        } catch (error) {
            console.error("Error deleting role:", error);
            toast.error("Something went wrong while deleting");
        }
    };

    const toggleRoleExpansion = (roleId) => {
        setExpandedRoles((prev) => ({
            ...prev,
            [roleId]: !prev[roleId],
        }));
    };

    const filteredRoles = roles.filter((role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group permissions by category for better organization
    const groupPermissionsByCategory = (permissions) => {
        const categories = {};

        permissions.forEach((perm) => {
            if (!categories[perm.page]) {
                categories[perm.page] = [];
            }
            categories[perm.page] = [...categories[perm.page], ...perm.columns];
        });

        return categories;
    };

    // Get permission count for a role
    const getPermissionCount = (role) => {
        return role.permissions.reduce((total, perm) => total + perm.columns.length, 0);
    };

    return (
        <div className="container mx-auto p-4 md:p-8 overflow-auto">
            <Card className="shadow-lg border-0">
                <CardContent className="p-0">
                    <div className="px-6 pt-4 border-b">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold">Role Management</h1>
                            <div className="relative">
                                <Input
                                    type="search"
                                    placeholder="Search roles..."
                                    className="pl-8 w-full sm:w-[200px] md:w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {filteredRoles.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No roles found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredRoles.map((role) => (
                                    <Card key={role._id} className="overflow-hidden border">
                                        <div className="flex items-center justify-between p-4 bg-muted/30">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-lg font-semibold">{role.name}</h2>
                                                <Badge variant="outline" className="text-xs">
                                                    {getPermissionCount(role)} permissions
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 px-2"
                                                    onClick={() => handleEditClick(role._id)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only md:not-sr-only md:ml-2">Edit</span>
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 px-2 text-destructive hover:text-destructive"
                                                    onClick={() => handleDeleteClick(role._id)}
                                                >

                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only md:not-sr-only md:ml-2">Delete</span>
                                                </Button>

                                                {/* CollapsibleTrigger inside Collapsible */}
                                                <Collapsible open={expandedRoles[role._id]}>
                                                    <CollapsibleTrigger
                                                        onClick={() => toggleRoleExpansion(role._id)}
                                                        className="rounded-md h-8 px-2 inline-flex items-center justify-center text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
                                                    >
                                                        {expandedRoles[role._id] ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                        <span className="sr-only">Toggle</span>
                                                    </CollapsibleTrigger>
                                                </Collapsible>
                                            </div>
                                        </div>

                                        <Collapsible open={expandedRoles[role._id]}>
                                            <CollapsibleContent>
                                                {role.permissions.length > 0 ? (
                                                    <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                        {Object.entries(groupPermissionsByCategory(role.permissions)).map(
                                                            ([page, columns]) => (
                                                                <div key={page} className="bg-muted/30 p-3 rounded-md">
                                                                    <h3 className="font-medium text-sm mb-2 pb-1 border-b">{page}</h3>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {columns.map((column, idx) => (
                                                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                                                {column}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 text-muted-foreground">
                                                        No permissions assigned to this role
                                                    </div>
                                                )}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Roles;
