import React, { useEffect, useState } from 'react';
import useChatStore from '../../store/chatStore';
import { Eye, Users, MessageSquare } from 'lucide-react';
import ChatWindow from './ChatWindow';

const AdminChatView = () => {
    const { users, messages, fetchMessages, currentUser, groups, fetchGroups, fetchUsers } = useChatStore();
    const [selectedUserPair, setSelectedUserPair] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [userPairs, setUserPairs] = useState([]);

    useEffect(() => {
        if (currentUser) {
            fetchUsers();
            fetchGroups();
        }

        // Create pairs of users for monitoring
        const pairs = [];
        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                if (users[i]._id !== currentUser._id && users[j]._id !== currentUser._id) {
                    pairs.push({
                        user1: users[i],
                        user2: users[j]
                    });
                }
            }
        }
        setUserPairs(pairs);
    }, [users, currentUser, fetchUsers, fetchGroups]);

    const handleSelectPair = (pair) => {
        setSelectedUserPair(pair);
        setSelectedGroup(null);
        fetchMessages(pair.user1._id, pair.user2._id);
        // Set selectedChat in the store for real-time updates
        useChatStore.getState().setSelectedChat({
            type: 'user',
            id: pair.user1._id, // Or user2._id, consistency with fetchMessages is key
            name: `${pair.user1.agent_name} ↔ ${pair.user2.agent_name}`,
            // Add any other properties needed by ChatWindow or receive-message logic
        });
    };

    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
        setSelectedUserPair(null);
        // Assuming fetchGroupMessages exists in chatStore
        useChatStore.getState().fetchGroupMessages(group._id);
        // Set selectedChat in the store for real-time updates
        useChatStore.getState().setSelectedChat({
            type: 'group',
            id: group._id,
            name: group.name,
            // Add any other properties needed
        });
    };

    return (
        <div className="flex h-screen bg-white">
            {/* User Pairs and Groups List */}
            <div className="w-80 border-r bg-gray-50 h-full overflow-y-auto">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Monitor Chats</h2>
                    <p className="text-sm text-gray-500">Select a conversation to monitor</p>
                </div>
                <div className="p-2">
                    {/* User Pairs List */}
                    <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">User Conversations</h3>
                    {userPairs.map((pair, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelectPair(pair)}
                            className={`p-3 hover:bg-gray-100 cursor-pointer rounded ${selectedUserPair?._id === pair._id ? 'bg-blue-50' : ''
                                }`}
                        >
                            <div className="flex items-center">
                                <Users className="w-5 h-5 text-gray-500 mr-2" />
                                <div>
                                    <p className="font-medium">
                                        {pair.user1.agent_name} ↔ {pair.user2.agent_name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Click to monitor conversation
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Groups List */}
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Group Conversations</h3>
                        {groups.map(group => (
                            <div
                                key={group._id}
                                onClick={() => handleSelectGroup(group)}
                                className={`p-3 hover:bg-gray-100 cursor-pointer rounded ${selectedGroup?._id === group._id ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex items-center">
                                    <MessageSquare className="w-5 h-5 text-gray-500 mr-2" />
                                    <div>
                                        <p className="font-medium">{group.name}</p>
                                        <p className="text-sm text-gray-500">{group.members.length} members</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chat View - Displaying selected user pair or group messages */}
            <div className="flex-1 flex flex-col">
                {(selectedUserPair || selectedGroup) ? (
                    <>
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold">
                                Monitoring: {selectedUserPair ? `${selectedUserPair.user1.agent_name} ↔ ${selectedUserPair.user2.agent_name}` : selectedGroup?.name}
                            </h2>
                        </div>
                        {/* Use ChatWindow to display messages */}
                        <ChatWindow
                            messages={messages} // Pass messages from AdminChatView state
                            selectedChat={useChatStore.getState().selectedChat} // Pass the store's selectedChat
                            currentUser={currentUser} // Pass current admin user
                            sendMessage={() => console.log('Send message disabled in monitor view')} // Disable send
                            isTyping={false} // No typing indication in monitor view
                            revokeImageUrl={() => { }} // No image revoke needed here
                            setMessages={(msgs) => console.log('setMessages disabled in monitor view')} // Disable state updates
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                            <Eye className="w-12 h-12 mx-auto mb-4" />
                            <p>Select a conversation to monitor</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChatView; 