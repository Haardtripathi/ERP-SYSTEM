import React, { useEffect } from 'react';
import useChatStore from '../../store/chatStore';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

const Chat = () => {
    const { currentUser, initializeSocket, joinChat, setSelectedChat } = useChatStore();

    useEffect(() => {
        // Reset selected chat when the component mounts
        setSelectedChat(null);
    }, [setSelectedChat]);

    useEffect(() => {
        if (currentUser) {
            initializeSocket();
            joinChat(currentUser._id);
        }
    }, [currentUser, initializeSocket, joinChat]);

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