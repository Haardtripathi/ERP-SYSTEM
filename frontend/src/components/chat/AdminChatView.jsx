import React, { useEffect, useState } from 'react';
import useChatStore from '../../store/chatStore';
import { Eye, Users, MessageSquare, Info } from 'lucide-react';
import ChatWindow from './ChatWindow';

const AdminChatView = () => {
    const { users, messages, fetchMessages, currentUser, fetchUsers, setSelectedChat } = useChatStore();
    const [selectedUserPair, setSelectedUserPair] = useState(null);
    const [userPairs, setUserPairs] = useState([]);
    const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

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
        console.log('AdminChatView - Selected pair:', {
            user1: { id: pair.user1._id, name: pair.user1.agent_name },
            user2: { id: pair.user2._id, name: pair.user2.agent_name }
        });
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

    return (
        <div className="flex h-full bg-white">
            {/* User Pairs List */}
            <div className="w-80 border-r bg-gray-50 h-full overflow-y-auto">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Monitor Chats</h2>
                    <p className="text-sm text-gray-500">Select a conversation to monitor</p>
                    <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center"><Users className="w-4 h-4 mr-2" />User Chats</h3>
                        {isLoadingUsers ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-500">Loading users...</p>
                            </div>
                        ) : userPairs.length > 0 ? (
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