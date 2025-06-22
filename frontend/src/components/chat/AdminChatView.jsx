import React, { useEffect, useState, useMemo } from 'react';
import useChatStore from '../../store/chatStore';
import { Eye, Users, MessageSquare, Search, Filter } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const AdminChatView = () => {
    const { users, messages, fetchMessages, currentUser, fetchUsers, setSelectedChat } = useChatStore();
    const [selectedUserPair, setSelectedUserPair] = useState(null);
    const [userPairs, setUserPairs] = useState([]);
    const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser1, setSelectedUser1] = useState('');
    const [selectedUser2, setSelectedUser2] = useState('');

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

    // Clear any previously selected chat when admin opens monitor chats
    useEffect(() => {
        setSelectedChat(null);
    }, [setSelectedChat]);

    useEffect(() => {
        if (currentUser && !hasFetchedInitialData) {
            setIsLoadingUsers(true);
            fetchUsers().finally(() => {
                setIsLoadingUsers(false);
                setHasFetchedInitialData(true);
            });
        }
    }, [currentUser, fetchUsers, hasFetchedInitialData]);

    useEffect(() => {
        // Create user pairs from existing data
        const pairs = [];
        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                if (currentUser && users[i]._id !== currentUser._id && users[j]._id !== currentUser._id) {
                    pairs.push({
                        user1: users[i],
                        user2: users[j],
                        id: `${users[i]._id}-${users[j]._id}`
                    });
                }
            }
        }
        setUserPairs(pairs);
    }, [users, currentUser]);

    // Get filtered users for dropdowns (exclude current user)
    const availableUsers = useMemo(() => {
        return users.filter(user => user._id !== currentUser?._id);
    }, [users, currentUser]);

    // Filter user pairs based on search and user selections
    const filteredPairs = useMemo(() => {
        let filtered = userPairs;

        // Filter by user selections
        if (selectedUser1) {
            filtered = filtered.filter(pair =>
                pair.user1._id === selectedUser1 || pair.user2._id === selectedUser1
            );
        }

        if (selectedUser2) {
            filtered = filtered.filter(pair =>
                pair.user1._id === selectedUser2 || pair.user2._id === selectedUser2
            );
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(pair =>
                pair.user1.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pair.user2.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pair.user1.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pair.user2.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [userPairs, searchQuery, selectedUser1, selectedUser2]);

    const handleSelectPair = (pair) => {
        setSelectedUserPair(pair);

        // Explicitly clean up socket before setting selected chat for monitoring
        useChatStore.getState().cleanupSocket();

        // Set the selected chat first
        useChatStore.getState().setSelectedChat({
            type: 'user',
            id: pair.user1._id,
            name: `${pair.user1.agent_name} ↔ ${pair.user2.agent_name}`,
            user1Id: pair.user1._id,
            user2Id: pair.user2._id
        }, true); // Pass true for isMonitoring

        // Fetch messages for the selected pair
        fetchMessages(pair.user1._id, pair.user2._id);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedUser1('');
        setSelectedUser2('');
    };

    return (
        <div className="flex h-full bg-gray-50">
            {/* Enhanced Sidebar */}
            <div className="w-96 border-r bg-white h-full flex flex-col shadow-sm">
                {/* Header */}
                <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Eye className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Monitor Chats</h2>
                            <p className="text-sm text-gray-600">Select conversations to monitor</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* User Filter Dropdowns */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Filter by Users:</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Select value={selectedUser1} onValueChange={setSelectedUser1}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="User 1" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUsers.map(user => (
                                        <SelectItem key={user._id} value={user._id}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-4 h-4">
                                                    {user.photo ? (
                                                        <AvatarImage
                                                            src={`data:${user.photo.contentType};base64,${bufferToBase64(user.photo.data)}`}
                                                            alt={user.agent_name}
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="text-xs">
                                                        {user.agent_name?.charAt(0)?.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="truncate">{user.agent_name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedUser2} onValueChange={setSelectedUser2}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="User 2" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUsers.map(user => (
                                        <SelectItem key={user._id} value={user._id}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-4 h-4">
                                                    {user.photo ? (
                                                        <AvatarImage
                                                            src={`data:${user.photo.contentType};base64,${bufferToBase64(user.photo.data)}`}
                                                            alt={user.agent_name}
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="text-xs">
                                                        {user.agent_name?.charAt(0)?.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="truncate">{user.agent_name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Clear Filters Button */}
                        {(selectedUser1 || selectedUser2 || searchQuery) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                className="w-full"
                            >
                                Clear All Filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {isLoadingUsers ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                            <p className="text-sm text-gray-500">Loading conversations...</p>
                        </div>
                    ) : filteredPairs.length > 0 ? (
                        filteredPairs.map((pair) => (
                            <Card
                                key={pair.id}
                                className={cn(
                                    "cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
                                    selectedUserPair?.id === pair.id
                                        ? "border-l-blue-500 bg-blue-50 shadow-md"
                                        : "border-l-transparent hover:border-l-gray-300"
                                )}
                                onClick={() => handleSelectPair(pair)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        {/* Avatars with Profile Images */}
                                        <div className="flex -space-x-2">
                                            <Avatar className="w-8 h-8 border-2 border-white">
                                                {pair.user1.photo ? (
                                                    <AvatarImage
                                                        src={`data:${pair.user1.photo.contentType};base64,${bufferToBase64(pair.user1.photo.data)}`}
                                                        alt={pair.user1.agent_name}
                                                    />
                                                ) : null}
                                                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                                    {pair.user1.agent_name?.charAt(0)?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <Avatar className="w-8 h-8 border-2 border-white">
                                                {pair.user2.photo ? (
                                                    <AvatarImage
                                                        src={`data:${pair.user2.photo.contentType};base64,${bufferToBase64(pair.user2.photo.data)}`}
                                                        alt={pair.user2.agent_name}
                                                    />
                                                ) : null}
                                                <AvatarFallback className="text-xs bg-green-100 text-green-700">
                                                    {pair.user2.agent_name?.charAt(0)?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm text-gray-900 truncate mb-1">
                                                {pair.user1.agent_name} ↔ {pair.user2.agent_name}
                                            </h4>
                                            <p className="text-xs text-gray-500 truncate">
                                                {pair.user1.email} • {pair.user2.email}
                                            </p>
                                        </div>

                                        {/* Icon */}
                                        <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 mb-1">
                                {searchQuery || selectedUser1 || selectedUser2 ? 'No conversations found' : 'No conversations to monitor'}
                            </p>
                            {(searchQuery || selectedUser1 || selectedUser2) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="mt-2"
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div className="p-4 border-t bg-gray-50">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{filteredPairs.length} conversations</span>
                        <span>Total: {userPairs.length}</span>
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1">
                <ChatWindow
                    messages={messages}
                    selectedChat={selectedUserPair ? {
                        type: 'user',
                        id: selectedUserPair.user1._id,
                        name: `${selectedUserPair.user1.agent_name} ↔ ${selectedUserPair.user2.agent_name}`,
                        user1Id: selectedUserPair.user1._id,
                        user2Id: selectedUserPair.user2._id
                    } : null}
                    currentUser={currentUser}
                    isReadOnly={true}
                    disableRealtime={true}
                    users={users}
                    showInfoPanel={showInfoPanel}
                    setShowInfoPanel={setShowInfoPanel}
                />
            </div>
        </div>
    );
};

export default AdminChatView; 