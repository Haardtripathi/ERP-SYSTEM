import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, X, Users } from 'lucide-react';
import useChatStore from '@/store/chatStore';
import useAuthStore from '@/store/authStore';

const CreateGroupDialog = ({ open, onOpenChange }) => {
    const { users, currentUser, createGroup } = useChatStore();
    const { isAdmin } = useAuthStore();
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!groupName.trim() || selectedUsers.length === 0 || !currentUser || !currentUser._id) {
            return;
        }

        // Ensure the current user (admin) is included in members
        const membersWithAdmin = selectedUsers.includes(currentUser._id) ? selectedUsers : [...selectedUsers, currentUser._id];

        try {
            await createGroup(groupName, membersWithAdmin, false); // false for isHidden parameter
            onOpenChange(false);
            setGroupName('');
            setSelectedUsers([]);
            setSearchQuery('');
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const filteredUsers = users.filter(user =>
        user._id !== currentUser._id &&
        user.agent_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Create New Group</DialogTitle>
                    <DialogDescription>
                        Create a new group chat and add members to it.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateGroup} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="groupName" className="text-sm font-medium">
                            Group Name
                        </label>
                        <Input
                            id="groupName"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Enter group name"
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Selected Members</label>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-lg min-h-[40px]">
                            {selectedUsers.length > 0 ? (
                                selectedUsers.map(userId => {
                                    const user = users.find(u => u._id === userId);
                                    return user ? (
                                        <Badge
                                            key={userId}
                                            variant="secondary"
                                            className="flex items-center gap-1 px-2 py-1"
                                        >
                                            <span>{user.agent_name}</span>
                                            <button
                                                type="button"
                                                onClick={() => toggleUserSelection(userId)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ) : null;
                                })
                            ) : (
                                <p className="text-sm text-muted-foreground">No members selected</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Add Members</label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <ScrollArea className="h-[200px] rounded-md border p-2">
                            <div className="space-y-2">
                                {filteredUsers.map(user => (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleUserSelection(user._id)}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedUsers.includes(user._id)
                                            ? 'bg-primary/10 hover:bg-primary/20'
                                            : 'hover:bg-muted'
                                            }`}
                                    >
                                        <div className="relative flex-shrink-0 rounded-full overflow-hidden w-8 h-8">
                                            {user.photo ? (
                                                <img
                                                    src={`data:${user.photo.contentType};base64,${bufferToBase64(user.photo.data)}`}
                                                    alt={user.agent_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {user.agent_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{user.agent_name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        {selectedUsers.includes(user._id) && (
                                            <Badge variant="secondary" className="ml-auto">
                                                Selected
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!groupName.trim() || selectedUsers.length === 0}
                        >
                            Create Group
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// Helper function to convert buffer to base64
const bufferToBase64 = (buffer) => {
    if (!buffer) return '';
    if (typeof buffer === 'string') return buffer;
    if (buffer.data && Array.isArray(buffer.data)) {
        const chunkSize = 1024;
        let result = '';
        for (let i = 0; i < buffer.data.length; i += chunkSize) {
            const chunk = buffer.data.slice(i, i + chunkSize);
            result += String.fromCharCode.apply(null, chunk);
        }
        return btoa(result);
    }
    return '';
};

export default CreateGroupDialog; 