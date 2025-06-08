import { create } from 'zustand';
import axios from '../axiosInstance';
import io from 'socket.io-client';

const socket = io('http://localhost:5001', {
    withCredentials: true
});

// Function to extract Uint8Array from buffer object
const getUint8ArrayFromBuffer = (buffer) => {
    if (!buffer || !buffer.data || !Array.isArray(buffer.data)) {
        console.error('getUint8ArrayFromBuffer: Invalid buffer data format:', buffer);
        return new Uint8Array();
    }
    const uint8Array = new Uint8Array(buffer.data);
    console.log('getUint8ArrayFromBuffer: Generated Uint8Array (length):', uint8Array.length, 'first 10 bytes:', uint8Array.slice(0, 10));
    return uint8Array;
};

// Function to create Blob URL from Uint8Array
export const createBlobUrl = (uint8Array, contentType) => {
    console.log('createBlobUrl: Received Uint8Array (length):', uint8Array.length, 'contentType:', contentType);
    const blob = new Blob([uint8Array], { type: contentType });
    console.log('createBlobUrl: Created Blob object (size, type):', blob.size, blob.type);
    const url = URL.createObjectURL(blob);
    console.log('createBlobUrl: Generated Blob URL:', url);
    return { url, blob };
};

const processImageBuffer = (buffer, contentType) => {
    if (!buffer || !buffer.data) {
        console.error('processImageBuffer: Invalid buffer data');
        return null;
    }

    try {
        const uint8Array = new Uint8Array(buffer.data);
        console.log('processImageBuffer: Created Uint8Array (length):', uint8Array.length);
        const { url, blob } = createBlobUrl(uint8Array, contentType);
        // Store the blob in the message object for later use
        return { url, blob, uint8Array };
    } catch (error) {
        console.error('processImageBuffer: Error processing image:', error);
        return null;
    }
};

const useChatStore = create((set, get) => ({
    // State
    messages: [],
    users: [],
    groups: [],
    selectedChat: null,
    onlineUsers: [],
    isTyping: false,
    currentUser: null,
    isAdmin: false,
    activeImageUrls: new Set(), // To keep track of active Blob URLs for revocation
    unreadMessages: {},

    // Actions
    setMessages: (newMessages) => {
        console.log('setMessages: Setting messages:', newMessages.length);

        // Identify messages being removed from the state
        const currentMessageIds = new Set(get().messages.map(msg => msg._id));
        const newMessageIds = new Set(newMessages.map(msg => msg._id));

        get().messages.forEach(msg => {
            if (!newMessageIds.has(msg._id) && msg.imageUrl && msg.imageUrl.startsWith('blob:')) {
                // Message is being removed, revoke its Blob URL
                console.log('setMessages: Revoking Blob URL for removed message:', msg._id, msg.imageUrl);
                URL.revokeObjectURL(msg.imageUrl);
                // Also remove from activeImageUrls set
                useChatStore.getState().activeImageUrls.delete(msg.imageUrl);
            }
        });

        // Process new messages with images
        const processedMessages = newMessages.map(msg => {
            if (msg.image && !msg.imageUrl) {
                const imageData = processImageBuffer(msg.image, msg.imageContentType);
                if (imageData) {
                    return {
                        ...msg,
                        imageUrl: imageData.url,
                        imageBlob: imageData.blob,
                        imageData: imageData.uint8Array, // Store the raw data for retries
                        imageProcessing: false,
                        imageError: false,
                        imageRetryCount: 0
                    };
                }
            }
            return msg;
        });

        set({ messages: processedMessages });
    },

    setCurrentUser: (user) => {
        const actualUser = user?.user || user;
        set({ currentUser: actualUser, isAdmin: actualUser?.role === 'admin' });
        if (actualUser) {
            get().fetchUsers();
            get().fetchGroups();
            get().joinChat(actualUser._id);
        }
    },

    initializeSocket: () => {
        socket.on('receive-message', async (message) => {
            console.log('receive-message: Received message:', message);
            const existingMessage = get().messages.find(msg => msg._id === message._id);
            if (!existingMessage) {
                // Determine the chat ID (sender for user chat, group ID for group chat)
                const chatId = message.group || (message.sender === get().currentUser._id ? message.receiver : message.sender);

                if (get().selectedChat?.id !== chatId) {
                    // Increment unread count if not the currently selected chat
                    get().setUnreadMessages(chatId, (get().unreadMessages[chatId] || 0) + 1);
                    console.log(`receive-message: Incremented unread count for chat ${chatId}. Total: ${get().unreadMessages[chatId]}`);
                }

                if (message.image) {
                    console.log('receive-message: Message has image data, processing...');
                    const imageData = processImageBuffer(message.image, message.imageContentType);
                    if (imageData) {
                        // Ensure both URL and Blob are stored on the message object
                        const newMessage = {
                            ...message,
                            imageUrl: imageData.url,
                            imageBlob: imageData.blob,
                            imageProcessing: false,
                            imageError: false,
                            imageRetryCount: 0 // Initialize retry count
                        };
                        get().setMessages([...get().messages, newMessage]);
                        console.log('receive-message: Image processed and message added, imageUrl:', imageData.url);
                    } else {
                        console.error('receive-message: Error processing image for new message.');
                        get().setMessages([...get().messages, { ...message, imageError: true, imageProcessing: false }]);
                    }
                } else {
                    console.log('receive-message: Message has no image data, adding directly.');
                    get().setMessages([...get().messages, message]);
                }
            }
        });

        socket.on('message-error', (error) => {
            console.error('message-error: Received error from server:', error);
            // You might want to show a toast notification here
            alert('Failed to send message: ' + error.error);
        });

        socket.on('update-online-users', (users) => {
            console.log('update-online-users: Received online users update:', users);
            set({ onlineUsers: users });
        });

        socket.on('typing', ({ userId, isTyping }) => {
            console.log(`typing: User ${userId} is typing: ${isTyping}`);
            if (get().selectedChat?.id === userId) {
                set({ isTyping });
            }
        });
    },

    joinChat: (userId) => {
        console.log('joinChat: Joining chat with userId:', userId);
        socket.emit('join', userId);
    },

    joinGroup: (groupId) => {
        console.log('joinGroup: Joining group with groupId:', groupId);
        socket.emit('join-group', groupId);
    },

    sendMessage: async (content, receiverId, groupId = null, imageFile = null) => {
        console.log('sendMessage: Called with content:', content, 'receiverId:', receiverId, 'groupId:', groupId, 'imageFile:', imageFile);
        const { currentUser } = get();
        if (!currentUser || !currentUser._id) {
            console.error('sendMessage: Aborted, currentUser or currentUser._id is null/undefined.', currentUser);
            return;
        }
        if (!content && !imageFile) {
            console.warn('sendMessage: Aborted, No content or image provided.');
            return;
        }

        let imageData = null;
        let imageContentType = null;

        if (imageFile) {
            console.log('sendMessage: Image file detected, reading...', {
                name: imageFile.name,
                type: imageFile.type,
                size: imageFile.size
            });
            imageContentType = imageFile.type;
            try {
                // Read as ArrayBuffer for better binary handling
                const arrayBuffer = await imageFile.arrayBuffer();
                console.log('sendMessage: ArrayBuffer created, size:', arrayBuffer.byteLength);
                imageData = new Uint8Array(arrayBuffer);
                console.log('sendMessage: Uint8Array created, length:', imageData.length, 'first 10 bytes:', Array.from(imageData.slice(0, 10)));
            } catch (error) {
                console.error('sendMessage: Error reading image file:', error);
                return;
            }
        }

        const message = {
            sender: currentUser._id,
            receiver: receiverId,
            group: groupId,
            message: content || null,
            image: imageData ? { data: Array.from(imageData) } : null,
            imageContentType: imageContentType || null
        };
        console.log('sendMessage: Emitting message:', {
            ...message,
            image: imageData ? { dataLength: imageData.length } : null
        });
        socket.emit('send-message', message);
    },

    fetchUsers: async () => {
        console.log('fetchUsers: Fetching users...');
        try {
            const response = await axios.get('/chat/users');
            console.log('fetchUsers: Fetched users successfully:', response.data.length, 'users.');
            set({ users: response.data });
        } catch (error) {
            console.error('fetchUsers: Error fetching users:', error.message, error.response?.data);
        }
    },

    fetchGroups: async () => {
        const { currentUser } = get();
        if (!currentUser || !currentUser._id) {
            console.error('fetchGroups: Aborted, currentUser or currentUser._id is null/undefined.', currentUser);
            return;
        }
        console.log('fetchGroups: Fetching groups for user:', currentUser._id);
        try {
            const response = await axios.get(`/chat/mygroups/${currentUser._id}`);
            console.log('fetchGroups: Fetched groups successfully:', response.data.length, 'groups.');
            set({ groups: response.data });
        } catch (error) {
            console.error('fetchGroups: Error fetching groups:', error.message, error.response?.data);
        }
    },

    fetchMessages: async (userId1, userId2) => {
        const { currentUser } = get();
        if (!currentUser || !currentUser._id) {
            console.error('fetchMessages: Aborted, currentUser or currentUser._id is null/undefined.', currentUser);
            return;
        }
        console.log(`fetchMessages: Fetching messages for users: ${userId1} and ${userId2}`);
        try {
            const response = await axios.get(`/chat/history/${userId1}/${userId2}`);
            console.log('fetchMessages: Raw messages received:', response.data.length);
            const messagesWithProcessedImages = await Promise.all(response.data.map(async (msg) => {
                // Only process if image data exists and imageUrl is not already set (handle potential re-fetching)
                if (msg.image && !msg.imageUrl) {
                    console.log(`fetchMessages: Processing image for message: ${msg._id} (has image: ${!!msg.image}, has imageUrl: ${!!msg.imageUrl})`);
                    const imageData = processImageBuffer(msg.image, msg.imageContentType);
                    if (imageData) {
                        console.log('fetchMessages: Image processed for message:', msg._id, 'imageUrl:', imageData.url);
                        return {
                            ...msg,
                            imageUrl: imageData.url,
                            imageBlob: imageData.blob,
                            imageProcessing: false,
                            imageError: false,
                            imageRetryCount: 0 // Initialize retry count
                        };
                    } else {
                        console.error('fetchMessages: Error processing image for message:', msg._id);
                        return { ...msg, imageError: true, imageProcessing: false };
                    }
                }
                // If message already has imageUrl or no image data, return as is
                return msg;
            }));
            set({ messages: messagesWithProcessedImages });
            console.log('fetchMessages: Messages set with processed images. Total:', messagesWithProcessedImages.length);
        } catch (error) {
            console.error('fetchMessages: Error fetching messages:', error.message, error.response?.data);
        }
    },

    fetchGroupMessages: async (groupId) => {
        console.log('fetchGroupMessages: Fetching group messages for group:', groupId);
        try {
            const response = await axios.get(`/chat/group/${groupId}/messages`);
            console.log('fetchGroupMessages: Raw group messages received:', response.data.length);
            const messagesWithProcessedImages = await Promise.all(response.data.map(async (msg) => {
                // Only process if image data exists and imageUrl is not already set
                if (msg.image && !msg.imageUrl) {
                    console.log(`fetchGroupMessages: Processing image for message: ${msg._id} (has image: ${!!msg.image}, has imageUrl: ${!!msg.imageUrl})`);
                    const imageData = processImageBuffer(msg.image, msg.imageContentType);
                    if (imageData) {
                        console.log('fetchGroupMessages: Image processed for message:', msg._id, 'imageUrl:', imageData.url);
                        return {
                            ...msg,
                            imageUrl: imageData.url,
                            imageBlob: imageData.blob,
                            imageProcessing: false,
                            imageError: false,
                            imageRetryCount: 0 // Initialize retry count
                        };
                    } else {
                        console.error('fetchGroupMessages: Error processing image for message:', msg._id);
                        return { ...msg, imageError: true, imageProcessing: false };
                    }
                }
                // If message already has imageUrl or no image data, return as is
                return msg;
            }));
            set({ messages: messagesWithProcessedImages });
            console.log('fetchGroupMessages: Messages set with processed images. Total:', messagesWithProcessedImages.length);
        } catch (error) {
            console.error('fetchGroupMessages: Error fetching group messages:', error.message, error.response?.data);
        }
    },

    createGroup: async (name, members, isHidden = false) => {
        const { currentUser } = get();
        if (!currentUser || !currentUser._id) {
            console.error('createGroup: Aborted, currentUser or currentUser._id is null/undefined.', currentUser);
            return;
        }
        const validMembers = Array.isArray(members) ? members.filter(member => typeof member === 'string') : [];
        console.log('createGroup: Creating group with name:', name, 'members:', validMembers);
        try {
            const response = await axios.post('/chat/group', {
                name,
                members: validMembers,
                visibleTo: isHidden ? [currentUser._id] : validMembers,
                createdBy: currentUser._id
            });
            console.log('createGroup: Group created successfully:', response.data);
            set((state) => ({
                groups: [...state.groups, response.data]
            }));
            return response.data;
        } catch (error) {
            console.error('createGroup: Error creating group:', error.message, error.response?.data);
            throw error;
        }
    },

    setSelectedChat: (chat) => {
        console.log('setSelectedChat: Called with chat:', chat);
        // Revoke all existing image URLs when changing chats
        get().activeImageUrls.forEach(url => {
            console.log('setSelectedChat: Revoking Blob URL:', url);
            URL.revokeObjectURL(url);
        });
        set({ activeImageUrls: new Set() }); // Clear the set

        set({ selectedChat: chat });
        set({ messages: [] });
        // Mark messages in the newly selected chat as read
        if (chat) {
            get().markMessagesAsRead(chat.id);
        }

        if (chat?.type === 'group') {
            get().fetchGroupMessages(chat.id);
        } else if (chat?.type === 'user') {
            get().fetchMessages(get().currentUser?._id, chat.id);
        }
    },

    // Action to revoke a specific image URL (e.g., when a message is deleted)
    revokeImageUrl: (url) => {
        if (get().activeImageUrls.has(url)) {
            URL.revokeObjectURL(url);
            get().activeImageUrls.delete(url);
            console.log('revokeImageUrl: Revoked Blob URL:', url);
        }
    },

    cleanupSocket: () => {
        console.log('cleanupSocket: Cleaning up socket listeners.');
        socket.off('receive-message');
        socket.off('update-online-users');
        socket.off('typing');
        // Revoke all remaining active image URLs on socket cleanup/app unmount
        get().activeImageUrls.forEach(url => URL.revokeObjectURL(url));
        set({ activeImageUrls: new Set() });
    },

    cleanupBlobUrls: () => {
        console.log('cleanupBlobUrls: Cleaning up all Blob URLs');
        get().activeImageUrls.forEach(url => {
            console.log('cleanupBlobUrls: Revoking Blob URL:', url);
            URL.revokeObjectURL(url);
        });
        set({ activeImageUrls: new Set() });

        // Also clean up any remaining Blob URLs in messages
        set((state) => {
            const messages = [...state.messages];
            messages.forEach((msg) => {
                if (msg.imageUrl && msg.imageUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(msg.imageUrl);
                    msg.imageUrl = null;
                    msg.imageBlob = null;
                }
            });
            return { messages };
        });
    },

    setUnreadMessages: (chatId, count) => {
        set((state) => ({
            unreadMessages: { ...state.unreadMessages, [chatId]: count }
        }));
        console.log(`setUnreadMessages: Updated unread count for ${chatId} to ${count}`);
    },

    markMessagesAsRead: (chatId) => {
        if (get().unreadMessages[chatId] > 0) {
            get().setUnreadMessages(chatId, 0);
            console.log(`markMessagesAsRead: Marked chat ${chatId} as read.`);
        }
    }
}));

export default useChatStore; 