import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { changePassword } from "../../services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Lock, Loader2, KeyRound } from "lucide-react";

const ChangePassword = ({ userId, userName, onSuccess }) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await changePassword(userId, newPassword);
            toast.success("Password changed successfully");
            setNewPassword("");
            setConfirmPassword("");
            setOpen(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="text-lg px-4 py-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change Password
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <KeyRound className="h-6 w-6 text-blue-600" />
                        Change Password
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        Change password for <span className="font-semibold text-gray-900">{userName}</span>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium">
                            New Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password (min. 6 characters)"
                                required
                                className="pl-10"
                                minLength={6}
                            />
                        </div>
                        <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                className="pl-10"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setOpen(false);
                                setNewPassword("");
                                setConfirmPassword("");
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Changing...
                                </>
                            ) : (
                                <>
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    Change Password
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ChangePassword;

