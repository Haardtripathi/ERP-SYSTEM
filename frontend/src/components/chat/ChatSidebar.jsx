import React, { useEffect, useState } from 'react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import { Users, UserPlus, MessageSquare, Plus, Loader2 } from 'lucide-react';
import CreateGroupDialog from './CreateGroupDialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

    const filteredUsers = users.filter(user =>
        user._id !== currentUser._id &&
        user.agent_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Users</h3>
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
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
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