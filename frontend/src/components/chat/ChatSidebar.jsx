import React, { useEffect, useState } from 'react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import { Users, UserPlus, MessageSquare, Plus, Loader2, X } from 'lucide-react';

const ChatSidebar = () => {
    const {
        users,
        groups,
        currentUser,
        fetchUsers,
        fetchGroups,
        setSelectedChat,
        createGroup,
        onlineUsers,
        unreadMessages
    } = useChatStore();

    const { isAdmin } = useAuthStore();

    console.log('ChatSidebar isAdmin:', isAdmin, 'currentUser:', currentUser);

    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (currentUser && users.length === 0 && groups.length === 0) {
            fetchUsers();
            fetchGroups();
        }
    }, [currentUser, users.length, groups.length]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim() || selectedUsers.length === 0 || !currentUser || !currentUser._id) {
            return;
        }

        // Ensure the current user (admin) is included in members and visibleTo
        const membersWithAdmin = selectedUsers.includes(currentUser._id) ? selectedUsers : [...selectedUsers, currentUser._id];
        const visibleToWithAdmin = selectedUsers.includes(currentUser._id) ? selectedUsers : [...selectedUsers, currentUser._id];

        try {
            await createGroup(newGroupName, membersWithAdmin, visibleToWithAdmin, currentUser._id);
            setShowCreateGroup(false);
            setNewGroupName('');
            setSelectedUsers([]);
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
                {/* Search Input */}
                {!showCreateGroup && (
                    <input
                        type="text"
                        placeholder="Search users or groups..."
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                )}

                {isAdmin && (
                    <button
                        onClick={() => setShowCreateGroup(!showCreateGroup)}
                        className={`mt-3 flex items-center text-sm transition-colors ${showCreateGroup ? 'text-red-500 hover:text-red-600' : 'text-blue-500 hover:text-blue-600'}`}
                    >
                        {showCreateGroup ? (
                            <X className="w-4 h-4 mr-1" />
                        ) : (
                            <Plus className="w-4 h-4 mr-1" />
                        )}
                        {showCreateGroup ? 'Cancel Create Group' : 'Create New Group'}
                    </button>
                )}
            </div>

            {/* Create Group Form (integrated into sidebar) */}
            {showCreateGroup && isAdmin && (
                <div className="p-4 border-b bg-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">New Group</h3>
                    <form onSubmit={handleCreateGroup} className="space-y-4">
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Group Name"
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <div className="max-h-40 overflow-y-auto border rounded-lg bg-white">
                            {users
                                .filter(user => user._id !== currentUser._id)
                                .map(user => (
                                    <div
                                        key={user._id}
                                        className="flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                        onClick={() => toggleUserSelection(user._id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user._id)}
                                            onChange={() => { }}
                                            className="mr-2"
                                        />
                                        <div className="relative flex-shrink-0 rounded-full overflow-hidden w-10 h-10">
                                            {/* User Avatar or Placeholder */}
                                            {user.image_url ? (
                                                <img src={user.image_url} alt={user.agent_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-sm">
                                                    {user.agent_name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="font-medium text-gray-800 text-sm truncate">{user.agent_name}</p>
                                            {/* Display email below name */}
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        {/* Online Status Indicator at the far right */}
                                        {onlineUsers.includes(user._id) && (
                                            <span className="ml-auto w-3 h-3 bg-green-500 rounded-full border-2 border-gray-400 flex-shrink-0" />
                                        )}
                                    </div>
                                ))}
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                        >
                            Create Group
                        </button>
                    </form>
                </div>
            )}

            {/* Users and Groups List */}
            {!showCreateGroup && (
                <div className="flex-1 overflow-y-auto">
                    <div className="p-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Users</h3>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <div
                                    key={user._id}
                                    onClick={() => setSelectedChat({ type: 'user', id: user._id, name: user.agent_name })}
                                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors last:mb-0 mb-2"
                                >
                                    <div className="relative flex-shrink-0 rounded-full overflow-hidden w-10 h-10">
                                        {/* User Avatar or Placeholder */}
                                        {user.image_url ? (
                                            <img src={user.image_url} alt={user.agent_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-sm">
                                                {user.agent_name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="font-medium text-gray-800 text-sm truncate">{user.agent_name}</p>
                                        {/* Display email below name */}
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    {/* Online Status Indicator at the far right */}
                                    {onlineUsers.includes(user._id) && (
                                        <span className="ml-auto w-3 h-3 bg-green-500 rounded-full border-2 border-gray-400 flex-shrink-0" />
                                    )}
                                    {/* Unread Message Count at the far right, vertically centered */}
                                    {unreadMessages[user._id] > 0 && (
                                        <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full flex-shrink-0 flex items-center justify-center">
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
                                    onClick={() => setSelectedChat({ type: 'group', id: group._id, name: group.name })}
                                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors last:mb-0 mb-2"
                                >
                                    <div className="flex-shrink-0">
                                        {/* Group Icon Placeholder */}
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="font-medium text-gray-800 text-sm truncate">{group.name}</p>
                                        <p className="text-xs text-gray-500">{group.members.length} members</p>
                                    </div>
                                    {/* Unread Message Count at the far right, vertically centered */}
                                    {unreadMessages[group._id] > 0 && (
                                        <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full flex-shrink-0 flex items-center justify-center">
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
            )}
        </div>
    );
};

export default ChatSidebar; 