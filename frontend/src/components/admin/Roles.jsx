import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getAllRoles } from "@/services/adminService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Roles = () => {
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        getAllRoles()
            .then((data) => {
                setRoles(data);
            })
            .catch(() => toast.error("Failed to load roles"));
    }, []);

    return (
        <div className="container mx-auto p-8">
            <Card className="p-6">
                <h1 className="text-2xl font-bold mb-4">All Roles</h1>
                {roles.length === 0 ? (
                    <p>No roles available</p>
                ) : (
                    <ul className="space-y-4">
                        {roles.map((role) => (
                            <li key={role._id} className="p-4 border rounded-lg shadow">
                                <h2 className="text-lg font-semibold">{role.name}</h2>
                                {role.permissions.length > 0 ? (
                                    <div className="mt-2">
                                        <h3 className="font-medium">Permissions:</h3>
                                        <ul className="ml-4 list-disc">
                                            {role.permissions.map((perm, index) => (
                                                <li key={index} className="mt-1">
                                                    <strong>{perm.page}</strong>: {perm.columns.join(", ")}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No permissions assigned</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
};

export default Roles;
