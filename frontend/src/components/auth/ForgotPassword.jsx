import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { resetAdminPassword } from "../../services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Lock, Loader2, KeyRound, Mail, Shield } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const errorShownRef = useRef(false); // Track if we've already shown an error for this request

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!email || !newPassword || !confirmPassword) {
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
        errorShownRef.current = false; // Reset error flag for new request

        try {
            const response = await resetAdminPassword(email, newPassword);
            
            // Only show success if we got a valid response
            if (response) {
                errorShownRef.current = true; // Mark that we've handled this request
                toast.success("Password reset successfully! You can now login with your new password.");
                // Clear form and close dialog
                setEmail("");
                setNewPassword("");
                setConfirmPassword("");
                // Use setTimeout to close dialog after toast is shown
                setTimeout(() => {
                    setOpen(false);
                }, 100);
            }
        } catch (error) {
            // Prevent showing multiple error toasts for the same request
            if (errorShownRef.current) {
                return;
            }

            // Only show error if it's from the reset password endpoint
            // Check both the full URL and the relative path
            const errorConfig = error.config || {};
            const errorUrl = String(errorConfig.url || '');
            const errorMethod = String(errorConfig.method || '').toLowerCase();
            
            // More specific check - must be exactly our reset password endpoint
            const isResetPasswordError = (
                (errorUrl.includes('/auth/reset-admin-password') || 
                 errorUrl.includes('reset-admin-password')) &&
                errorMethod === 'post'
            );
            
            // Only handle errors from our specific reset password request
            if (isResetPasswordError) {
                errorShownRef.current = true; // Mark that we've shown an error
                
                if (error.response) {
                    // API error response
                    const status = error.response.status;
                    const message = error.response?.data?.message;
                    
                    // Only show error for non-success status codes
                    if (status !== 200 && status !== 201) {
                        toast.error(message || "Failed to reset password. Make sure you are an Admin user.");
                    }
                } else {
                    // Network error or other error
                    toast.error("Failed to reset password. Please check your connection and try again.");
                }
            }
            // Silently ignore ALL errors from other endpoints (like checkAuth, etc.)
            // This prevents showing "User not found" or any other errors from unrelated requests
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen) => {
        // Only allow closing if not loading
        if (!loading) {
            setOpen(newOpen);
            // Clear form when dialog closes
            if (!newOpen) {
                setEmail("");
                setNewPassword("");
                setConfirmPassword("");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-2"
                >
                    Forgot Password? (Admin Only)
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="h-6 w-6 text-blue-600" />
                        Reset Admin Password
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        Enter your admin email and set a new password
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Admin Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your admin email"
                                required
                                className="pl-10"
                            />
                        </div>
                        <p className="text-xs text-gray-500">Only Admin users can reset their password</p>
                    </div>

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
                            onClick={() => handleOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    Reset Password
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ForgotPassword;

