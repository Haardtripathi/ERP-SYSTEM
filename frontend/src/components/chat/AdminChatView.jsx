import React, { useEffect, useState } from 'react';
import useChatStore from '../../store/chatStore';
import { Eye, Users, MessageSquare } from 'lucide-react';
import ChatWindow from './ChatWindow';

const AdminChatView = () => {
    const { users, messages, fetchMessages, currentUser, groups, fetchGroups, fetchUsers } = useChatStore();
    const [selectedUserPair, setSelectedUserPair] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [userPairs, setUserPairs] = useState([]);
    const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);

    useEffect(() => {
        if (currentUser && !hasFetchedInitialData) {
            fetchUsers();
            fetchGroups();
            setHasFetchedInitialData(true);
        }
    }, [currentUser, fetchUsers, fetchGroups, hasFetchedInitialData]);

    useEffect(() => {
        // This effect now solely focuses on creating user pairs
        const pairs = [];
        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                if (currentUser && users[i]._id !== currentUser._id && users[j]._id !== currentUser._id) {
                    pairs.push({
                        user1: users[i],
                        user2: users[j]
                    });
                }
            }
        }
        setUserPairs(pairs);
    }, [users, currentUser]); // Depend only on 'users' and 'currentUser' for pair creation

    const handleSelectPair = (pair) => {
        setSelectedUserPair(pair);
        setSelectedGroup(null);
        // Explicitly clean up socket before setting selected chat for monitoring
        useChatStore.getState().cleanupSocket();
        useChatStore.getState().setSelectedChat({
            type: 'user',
            id: pair.user1._id,
            name: `${pair.user1.agent_name} ↔ ${pair.user2.agent_name}`,
            user1Id: pair.user1._id,
            user2Id: pair.user2._id
        }, true); // Pass true for isMonitoring
        // Pass both user IDs for monitoring
        fetchMessages(pair.user1._id, pair.user2._id);
    };

    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
        setSelectedUserPair(null);
        // Explicitly clean up socket before setting selected chat for monitoring
        useChatStore.getState().cleanupSocket();
        // Assuming fetchGroupMessages exists in chatStore
        useChatStore.getState().setSelectedChat({
            type: 'group',
            id: group._id,
            name: group.name,
            // Add any other properties needed
        }, true); // Pass true for isMonitoring
        useChatStore.getState().fetchGroupMessages(group._id);
    };

    return (
        <div className="flex h-screen bg-white">
            {/* User Pairs and Groups List */}
            <div className="w-80 border-r bg-gray-50 h-full overflow-y-auto">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Monitor Chats</h2>
                    <p className="text-sm text-gray-500">Select a conversation to monitor</p>
                    <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center"><Users className="w-4 h-4 mr-2" />User Chats</h3>
                        {userPairs.length > 0 ? (
                            userPairs.map((pair, index) => (
                                <div
                                    key={`${pair.user1._id}-${pair.user2._id}`}
                                    onClick={() => handleSelectPair(pair)}
                                    className={`p-3 rounded-lg cursor-pointer flex items-center mb-2 last:mb-0 ${selectedUserPair?.user1._id === pair.user1._id &&
                                        selectedUserPair?.user2._id === pair.user2._id
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <MessageSquare className="w-5 h-5 mr-3 text-gray-500" />
                                    <span className="font-medium text-sm truncate">{pair.user1.agent_name} ↔ {pair.user2.agent_name}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No user pairs to monitor.</p>
                        )}
                    </div>

                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center"><Users className="w-4 h-4 mr-2" />Group Chats</h3>
                        {groups.length > 0 ? (
                            groups.map(group => (
                                <div
                                    key={group._id}
                                    onClick={() => handleSelectGroup(group)}
                                    className={`p-3 rounded-lg cursor-pointer flex items-center mb-2 last:mb-0 ${selectedGroup?._id === group._id
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <MessageSquare className="w-5 h-5 mr-3 text-gray-500" />
                                    <span className="font-medium text-sm truncate">{group.name}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No groups to monitor.</p>
                        )}
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
                    } : selectedGroup ? {
                        type: 'group',
                        id: selectedGroup._id,
                        name: selectedGroup.name
                    } : null}
                    currentUser={currentUser}
                    isReadOnly={true}
                    disableRealtime={true}
                    users={users}
                />
            </div>
        </div>
    );
};

export default AdminChatView; 