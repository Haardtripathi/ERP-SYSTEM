import React, { useEffect, useState } from 'react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import { Users, UserPlus, MessageSquare, Plus, Loader2, Filter } from 'lucide-react';
import CreateGroupDialog from './CreateGroupDialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getAllRoleNames } from '../../services/adminService';

const ChatSidebar = () => {
    const {
        users,
        groups,
        currentUser,
        fetchUsers,
        fetchGroups,
        setSelectedChat,
        selectedChat,
        onlineUsers,
        unreadMessages
    } = useChatStore();

    const { isAdmin } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('all');
    const [loadingRoles, setLoadingRoles] = useState(false);

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

    // Fetch roles
    const fetchRoles = async () => {
        try {
            setLoadingRoles(true);
            const rolesData = await getAllRoleNames();
            setRoles(rolesData);
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoadingRoles(false);
        }
    };

    useEffect(() => {
        if (currentUser && users.length === 0 && groups.length === 0) {
            fetchUsers();
            fetchGroups();
        }
        // Fetch unread counts for all chats
        if (currentUser) {
            useChatStore.getState().fetchUnreadCounts(currentUser._id);
            // Also refresh group unread counts specifically
            useChatStore.getState().refreshGroupUnreadCounts();
        }
    }, [currentUser, users.length, groups.length]);

    // Fetch roles on mount
    useEffect(() => {
        fetchRoles();
    }, []);

    // Periodic refresh of unread counts
    useEffect(() => {
        if (!currentUser) return;

        const interval = setInterval(() => {
            useChatStore.getState().forceRefreshUnreadCounts();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [currentUser]);

    // Listen for unread message changes
    useEffect(() => {
        const unsubscribe = useChatStore.subscribe(
            (state) => state.unreadMessages,
            (unreadMessages) => {

            }
        );

        return unsubscribe;
    }, []);

    if (!currentUser || (!users || !groups)) {
        return (
            <div className="w-80 border-r bg-gray-50 h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // Filter users based on search query and selected role
    const filteredUsers = users.filter(user => {
        const matchesSearch = user._id !== currentUser._id &&
            user.agent_name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = selectedRole === 'all' ||
            (user.role && user.role.name === selectedRole);

        return matchesSearch && matchesRole;
    });

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-80 border-r bg-white h-full flex flex-col shadow-md">
            {/* Header with Search and Create Group Button */}
            <div className="p-4 border-b bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Chats</h2>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Search users or groups..."
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {/* Role Filter */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <Filter className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-semibold text-blue-700">Role Filter</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="w-full rounded-full border-blue-200 shadow-sm focus:ring-2 focus:ring-blue-400">
                                    <SelectValue placeholder="Select role to filter" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-blue-100 shadow-lg">
                                    <SelectItem value="all" className="rounded-full">
                                        All Roles ({users.filter(u => u._id !== currentUser._id).length})
                                    </SelectItem>
                                    {loadingRoles ? (
                                        <SelectItem value="loading" disabled>
                                            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</span>
                                        </SelectItem>
                                    ) : (
                                        roles.map((role) => {
                                            const roleUserCount = users.filter(u =>
                                                u._id !== currentUser._id &&
                                                u.role &&
                                                u.role.name === role.name
                                            ).length;
                                            return (
                                                <SelectItem key={role._id} value={role.name} className="rounded-full">
                                                    {role.name} ({roleUserCount})
                                                </SelectItem>
                                            );
                                        })
                                    )}
                                </SelectContent>
                            </Select>
                            {selectedRole !== 'all' && (
                                <button
                                    className="ml-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition flex items-center gap-1 border border-blue-200"
                                    onClick={() => setSelectedRole('all')}
                                    title="Clear role filter"
                                >
                                    {selectedRole}
                                    <span className="ml-1 text-blue-500">&times;</span>
                                </button>
                            )}
                        </div>
                        {/* <div className="border-t border-gray-200 my-2" /> */}
                    </div>

                    {isAdmin && (
                        <Button
                            onClick={() => setShowCreateGroup(true)}
                            className="w-full"
                            variant="outline"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Group
                        </Button>
                    )}
                </div>
            </div>

            {/* Users and Groups List */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase">Users</h3>
                        {selectedRole !== 'all' && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                    Filtered by: {selectedRole}
                                </span>
                                <span className="text-xs text-gray-500">
                                    ({filteredUsers.length} of {users.filter(u => u._id !== currentUser._id).length})
                                </span>
                            </div>
                        )}
                    </div>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <div
                                key={user._id}
                                onClick={() => {
                                    // Set the new selected chat directly
                                    setSelectedChat({ type: 'user', id: user._id, name: user.agent_name });
                                    useChatStore.getState().joinChat(user._id);
                                    useChatStore.getState().markMessagesAsSeen(user._id, false);
                                }}
                                className={cn(
                                    "flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors last:mb-0 mb-2",
                                    unreadMessages[user._id] > 0 && "bg-blue-50 border-l-4 border-blue-500",
                                    selectedChat?.type === 'user' && selectedChat?.id === user._id && "bg-blue-100 border-l-4 border-blue-600"
                                )}
                            >
                                <div className="relative flex-shrink-0 rounded-full overflow-hidden w-10 h-10">
                                    {user.photo ? (
                                        <img
                                            src={`data:${user.photo.contentType};base64,${bufferToBase64(user.photo.data)}`}
                                            alt={user.agent_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-sm">
                                            {user.agent_name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className={cn(
                                        "font-medium text-sm truncate",
                                        unreadMessages[user._id] > 0 ? "text-blue-800 font-semibold" : "text-gray-800"
                                    )}>
                                        {user.agent_name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user.email}
                                        {user.role?.name ? (
                                            <span
                                                className={cn(
                                                    "inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                                                    user.role.name.toLowerCase() === "admin"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-200 text-gray-700"
                                                )}
                                                title={user.role.name}
                                            >
                                                {user.role.name}
                                            </span>
                                        ) : (
                                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[11px] font-semibold">
                                                No Role
                                            </span>
                                        )}
                                    </p>
                                </div>
                                {onlineUsers.includes(user._id) && (
                                    <span className="ml-auto w-3 h-3 bg-green-500 rounded-full border-2 border-gray-400 flex-shrink-0" />
                                )}
                                {unreadMessages[user._id] > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full flex-shrink-0 flex items-center justify-center min-w-[20px]">
                                        {unreadMessages[user._id]}
                                    </span>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 text-sm">No users found.</p>
                    )}
                </div>

                {/* Groups List */}
                <div className="p-2 mt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Groups</h3>
                    {filteredGroups.length > 0 ? (
                        filteredGroups.map(group => (
                            <div
                                key={group._id}
                                onClick={() => {
                                    // Set the new selected chat directly
                                    setSelectedChat({ type: 'group', id: group._id, name: group.name });
                                    useChatStore.getState().joinGroup(group._id);
                                    // Mark messages as seen and clear unread count for this group
                                    useChatStore.getState().markMessagesAsSeen(group._id, true);
                                    // Also update the local unread count immediately
                                    useChatStore.getState().updateGroupUnreadCount(group._id, false);
                                }}
                                className={cn(
                                    "flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors last:mb-0 mb-2",
                                    unreadMessages[group._id] > 0 && "bg-blue-50 border-l-4 border-blue-500",
                                    selectedChat?.type === 'group' && selectedChat?.id === group._id && "bg-blue-100 border-l-4 border-blue-600"
                                )}
                            >
                                <div className="flex-shrink-0">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        unreadMessages[group._id] > 0
                                            ? "bg-blue-200 text-blue-700"
                                            : "bg-gray-200 text-gray-700"
                                    )}>
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className={cn(
                                        "font-medium text-sm truncate",
                                        unreadMessages[group._id] > 0 ? "text-blue-800 font-semibold" : "text-gray-800"
                                    )}>
                                        {group.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{group.members.length} members</p>
                                </div>
                                {unreadMessages[group._id] > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full flex-shrink-0 flex items-center justify-center min-w-[20px]">
                                        {unreadMessages[group._id]}
                                    </span>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 text-sm">No groups found.</p>
                    )}
                </div>
            </div>

            {/* Create Group Dialog */}
            <CreateGroupDialog
                open={showCreateGroup}
                onOpenChange={setShowCreateGroup}
            />
        </div>
    );
};

export default ChatSidebar; 