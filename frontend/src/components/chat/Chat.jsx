import React, { useEffect } from 'react';
import useChatStore from '../../store/chatStore';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

const Chat = () => {
    const {
        currentUser,
        initializeSocket,
        joinChat,
        setSelectedChat,
        fetchUsers,
        fetchGroups,
        cleanupSocket
    } = useChatStore();

    // Initialize socket and fetch data on mount
    useEffect(() => {
        if (currentUser) {

            // Initialize socket with listeners
            initializeSocket(true);
            // Join chat with current user's ID
            joinChat(currentUser._id);
            // Fetch initial data
            fetchUsers();
            fetchGroups();
        }

        // Cleanup on unmount
        return () => {

            cleanupSocket();
        };
    }, [currentUser, initializeSocket, joinChat, fetchUsers, fetchGroups, cleanupSocket]);

    // Reset selected chat when component mounts and unmounts
    useEffect(() => {
        // Clear any previously selected chat when component mounts
        setSelectedChat(null);

        // Cleanup function to clear selected chat when component unmounts
        return () => {
            setSelectedChat(null);
        };
    }, [setSelectedChat]);

    return (
        // Removed redundant container styling to fit within the main app layout
        <div className="flex h-full w-full overflow-hidden">
            <ChatSidebar />
            <div className="flex-1">
                <ChatWindow />
            </div>
        </div>
    );
};

export default Chat; 