import { create } from 'zustand';
import axios from '../axiosInstance';
import io from 'socket.io-client';

// Move socket instance outside of store to prevent multiple connections
let socket = null;
let isSocketInitialized = false;

// Helper function to ensure socket is initialized
// This function is now removed. Its logic is integrated into initializeSocket.

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
const createBlobUrl = (uint8Array, contentType) => {
    console.log('createBlobUrl: Received Uint8Array (length):', uint8Array.length, 'contentType:', contentType);
    const blob = new Blob([uint8Array], { type: contentType });
    console.log('createBlobUrl: Created Blob object (size, type):', blob.size, blob.type);
    const url = URL.createObjectURL(blob);
    console.log('createBlobUrl: Generated Blob URL:', url);
    return { url, blob };
};

const processImageBuffer = (buffer, contentType) => {
    console.log('processImageBuffer: Received buffer (before check):', buffer);
    console.log('processImageBuffer: Received buffer.data (before check):', buffer?.data);
    console.log('processImageBuffer: Received contentType:', contentType);

    let uint8ArrayData = null;

    if (buffer && buffer.data && Array.isArray(buffer.data)) {
        // Case 1: Received as a Buffer object with .data property (common from Node.js)
        console.log('processImageBuffer: Processing Buffer object with .data');
        uint8ArrayData = buffer.data;
    } else if (buffer instanceof ArrayBuffer) {
        // Case 2: Received as a raw ArrayBuffer
        console.log('processImageBuffer: Processing raw ArrayBuffer');
        uint8ArrayData = new Uint8Array(buffer);
    } else if (typeof buffer === 'string' && buffer.startsWith('data:')) {
        // Case 3: Received as a data URL (base64 string)
        console.log('processImageBuffer: Processing data URL string');
        try {
            const base64Data = buffer.split('base64,')[1];
            uint8ArrayData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        } catch (error) {
            console.error('processImageBuffer: Error decoding base64 string:', error);
            return null;
        }
    } else if (buffer instanceof Blob) {
        // Case 4: Received as a Blob object
        console.log('processImageBuffer: Processing Blob object');
        // Need to convert Blob to ArrayBuffer or similar to create a Blob URL
        // This path might be less common from a socket, but handle as a fallback
        return null; // For now, don't support Blob directly, expect ArrayBuffer or Buffer structure
    }

    if (!uint8ArrayData) {
        console.error('processImageBuffer: Unrecognized or invalid buffer format', buffer);
        return null;
    }

    try {
        const uint8Array = new Uint8Array(uint8ArrayData);
        console.log('processImageBuffer: Created Uint8Array (length):', uint8Array.length);
        const { url, blob } = createBlobUrl(uint8Array, contentType);
        // Add to active URLs set for cleanup
        useChatStore.getState().activeImageUrls.add(url);
        return { url, blob };
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
    chatPagination: {}, // Stores pagination info per chat: { chatId: { hasMore: true, oldestMessageId: null, isLoading: false } },
    isMonitoringAdminView: false, // New state to indicate if in admin monitoring mode

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

        // Log details of messages with images before updating state
        newMessages.forEach(msg => {
            if (msg.image || msg.imageBlob) {
                console.log('setMessages: Before state update - Message:', msg._id, {
                    hasImage: !!msg.image,
                    hasImageBlob: !!msg.imageBlob,
                    imageUrl: msg.imageUrl,
                    imageRetryCount: msg.imageRetryCount
                });
            }
        });

        set({ messages: newMessages });

        // Log details of messages with images after updating state (note: might not reflect immediate DOM update)
        get().messages.forEach(msg => {
            if (msg.image || msg.imageBlob) {
                console.log('setMessages: After state update (get().messages) - Message:', msg._id, {
                    hasImage: !!msg.image,
                    hasImageBlob: !!msg.imageBlob,
                    imageUrl: msg.imageUrl,
                    imageRetryCount: msg.imageRetryCount
                });
            }
        });
    },

    setCurrentUser: (user) => {
        try {
            const actualUser = user?.user || user;
            set({ currentUser: actualUser, isAdmin: actualUser?.role === 'admin' });
            if (actualUser && !get().isAdmin) { // Only initialize socket and join chat if NOT an admin
                get().initializeSocket(true); // Initialize with listeners
                get().joinChat(actualUser._id);
            } else if (actualUser && get().isAdmin) {
                console.log('setCurrentUser: Admin user detected, skipping automatic socket initialization and chat join.');
                get().cleanupSocket(); // Ensure no socket is active for admin on login
            }
        } catch (error) {
            console.error('Error setting current user:', error);
        }
    },

    initializeSocket: (shouldAttachListeners = true) => {
        try {
            // If socket is already initialized, clear existing listeners to prevent duplicates
            if (socket) {
                console.log('Socket already exists. Clearing existing listeners for re-configuration.');
                socket.off('receive-message');
                socket.off('update-online-users');
                socket.off('typing');
                socket.off('user-online');
                socket.off('user-offline');
                socket.disconnect();
                socket = null;
                isSocketInitialized = false;
            }

            // Only create and connect the socket if we intend to attach listeners
            if (shouldAttachListeners) {
                console.log('Creating new socket connection...');
                socket = io('http://localhost:5001', {
                    withCredentials: true,
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    transports: ['websocket', 'polling'],
                    maxHttpBufferSize: 1e8, // Increase buffer size to 100MB
                    timeout: 60000 // Increase timeout to 60 seconds
                });

                // Attach listeners if socket exists and is connected
                if (socket) {
                    console.log('Attaching socket listeners...');
                    const processedMessageIds = new Set();

                    socket.on('connect', () => {
                        console.log('Socket connected successfully');
                        // Re-join chat if we have a current user
                        if (get().currentUser?._id) {
                            console.log('Re-joining chat after connection:', get().currentUser._id);
                            get().joinChat(get().currentUser._id);
                            // Request current online users list
                            socket.emit('get-online-users');
                        }
                    });

                    socket.on('disconnect', (reason) => {
                        console.log('Socket disconnected:', reason);
                        set({ onlineUsers: [] });
                    });

                    socket.on('connect_error', (error) => {
                        console.error('Socket connection error:', error);
                        set({ onlineUsers: [] });
                    });

                    socket.on('receive-message', async (message) => {
                        console.log('Received message:', message);
                        if (!message || !message._id) {
                            console.error('Invalid message received:', message);
                            return;
                        }

                        // Check for duplicate messages
                        if (processedMessageIds.has(message._id)) {
                            console.log('Duplicate message received, skipping:', message._id);
                            return;
                        }
                        processedMessageIds.add(message._id);

                        // Clean up old message IDs (keep only last 100)
                        if (processedMessageIds.size > 100) {
                            const oldestIds = Array.from(processedMessageIds).slice(0, processedMessageIds.size - 100);
                            oldestIds.forEach(id => processedMessageIds.delete(id));
                        }

                        // Check if this is a response to our sent message (has matching temp ID)
                        const existingMessage = get().messages.find(msg => {
                            if (!msg._id || typeof msg._id !== 'string') return false;
                            if (msg._id === message._id) return true;
                            return msg._id.startsWith('temp_') &&
                                msg.sender === message.sender &&
                                msg.receiver === message.receiver &&
                                msg.group === message.group &&
                                Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 5000;
                        });

                        if (existingMessage) {
                            console.log('Found existing message to replace:', existingMessage._id);
                            // Replace the temporary message with the server message, preserving image data if optimistic
                            const updatedMessages = get().messages.map(msg =>
                                msg._id === existingMessage._id ? {
                                    ...message, // Server message (should have populated replyTo)
                                    imageUrl: existingMessage.imageUrl, // Preserve optimistic image URL
                                    imageBlob: existingMessage.imageBlob // Preserve optimistic image blob
                                } : msg
                            );
                            get().setMessages(updatedMessages);
                            return;
                        }

                        // Process the message (new message or non-optimistic update)
                        const chatId = message.group || (message.sender === get().currentUser._id ? message.receiver : message.sender);

                        if (get().selectedChat && get().selectedChat.id === chatId) {
                            // Add message to current chat
                            if (message.image) {
                                const imageData = processImageBuffer(message.image, message.imageContentType);
                                if (imageData) {
                                    get().setMessages([...get().messages, {
                                        ...message, // Server message (should have populated replyTo)
                                        imageUrl: imageData.url,
                                        imageBlob: imageData.blob
                                    }]);
                                }
                            } else {
                                get().setMessages([...get().messages, message]);
                            }
                        } else {
                            // Increment unread count for other chats
                            get().setUnreadMessages(chatId, (get().unreadMessages[chatId] || 0) + 1);
                        }
                    });

                    socket.on('update-online-users', (users) => {
                        console.log('Received online users update:', users);
                        if (Array.isArray(users)) {
                            const validUsers = users.filter(id => id && typeof id === 'string');
                            set({ onlineUsers: validUsers });
                        }
                    });

                    socket.on('user-online', (userId) => {
                        console.log('User came online:', userId);
                        if (userId && typeof userId === 'string') {
                            set((state) => ({
                                onlineUsers: [...new Set([...state.onlineUsers, userId])]
                            }));
                        }
                    });

                    socket.on('user-offline', (userId) => {
                        console.log('User went offline:', userId);
                        if (userId && typeof userId === 'string') {
                            set((state) => ({
                                onlineUsers: state.onlineUsers.filter(id => id !== userId)
                            }));
                        }
                    });

                    socket.on('typing', ({ userId, isTyping }) => {
                        if (get().selectedChat?.id === userId) {
                            set({ isTyping });
                        }
                    });

                    isSocketInitialized = true;
                    console.log('Socket initialized successfully with listeners');
                }
            }
        } catch (error) {
            console.error('Error initializing socket:', error);
            isSocketInitialized = false;
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        }
    },

    joinChat: (userId) => {
        try {
            console.log('Joining chat with userId:', userId);
            if (socket && socket.connected && !get().isMonitoringAdminView) {
                socket.emit('join', userId);
                // Request online users list after joining
                socket.emit('get-online-users');
            } else {
                console.log('Cannot join chat: Socket not connected or in monitoring view');
            }
        } catch (error) {
            console.error('Error joining chat:', error);
        }
    },

    joinGroup: (groupId) => {
        try {
            console.log('joinGroup: Joining group with groupId:', groupId);
            // Only join if socket exists AND not in monitoring view AND socket is connected
            if (socket && !get().isMonitoringAdminView && socket.connected) {
                socket.emit('join-group', groupId);
            } else {
                console.log(`joinGroup: Skipping join. Socket connected: ${socket?.connected}, isMonitoringAdminView: ${get().isMonitoringAdminView}`);
            }
        } catch (error) {
            console.error('Error joining group:', error);
        }
    },

    sendMessage: async (content, receiverId, groupId = null, imageFile = null, replyToId = null) => {
        try {
            if (get().isMonitoringAdminView) {
                console.warn('sendMessage: Sending messages disabled in admin monitoring view.');
                return;
            }

            console.log('Frontend - sendMessage called with:', {
                content,
                receiverId,
                groupId,
                hasImageFile: !!imageFile,
                imageFileType: imageFile?.type,
                imageFileSize: imageFile?.size,
                replyToId
            });

            const { currentUser } = get();
            if (!currentUser || !currentUser._id) {
                console.error('sendMessage: Aborted, currentUser or currentUser._id is null/undefined.', currentUser);
                return;
            }
            if (!content && !imageFile) {
                console.warn('sendMessage: Aborted, No content or image provided.');
                return;
            }

            // Ensure socket is initialized and connected
            if (!socket || !socket.connected) {
                console.log('sendMessage: Socket not connected, initializing...');
                get().initializeSocket(true);
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (!socket || !socket.connected) {
                    console.error('sendMessage: Socket still not connected after initialization.');
                    return;
                }
            }

            let imageData = null;
            let imageContentType = null;

            if (imageFile) {
                console.log('Frontend - Processing image file:', {
                    name: imageFile.name,
                    type: imageFile.type,
                    size: imageFile.size
                });
                imageContentType = imageFile.type;
                try {
                    // Read the file as ArrayBuffer
                    const arrayBuffer = await imageFile.arrayBuffer();
                    // Convert to Uint8Array
                    const uint8Array = new Uint8Array(arrayBuffer);
                    // Convert to regular array for socket.io transmission
                    imageData = Array.from(uint8Array);
                    console.log('Frontend - Image processed successfully:', {
                        arraySize: imageData.length,
                        contentType: imageContentType,
                        firstFewBytes: imageData.slice(0, 10)
                    });
                } catch (error) {
                    console.error('Frontend - Error processing image:', error);
                    return;
                }
            }

            // Generate a temporary ID for optimistic update
            const tempId = `temp_${Date.now()}`;

            const message = {
                _id: tempId,
                sender: currentUser._id,
                receiver: receiverId,
                group: groupId,
                message: content || null,
                image: imageData ? { data: imageData } : null,
                imageContentType: imageContentType,
                createdAt: new Date(),
                replyTo: replyToId ? get().messages.find(m => m._id === replyToId) : null
            };

            // Log the exact message being sent
            console.log('Frontend - Sending message via socket:', {
                tempId,
                sender: message.sender,
                receiver: message.receiver,
                group: message.group,
                hasMessage: !!message.message,
                hasImage: !!message.image,
                imageContentType: message.imageContentType,
                imageDataLength: message.image?.data?.length,
                imageDataSample: message.image?.data?.slice(0, 10),
                replyTo: message.replyTo,
                fullMessage: message
            });

            // Add optimistic update
            const optimisticMessage = {
                ...message,
                imageUrl: imageFile ? URL.createObjectURL(imageFile) : null,
                imageBlob: imageFile || null
            };
            get().setMessages([...get().messages, optimisticMessage]);

            // Emit the message with explicit data structure
            socket.emit('send-message', {
                sender: message.sender,
                receiver: message.receiver,
                group: message.group,
                message: message.message,
                image: message.image,
                imageContentType: message.imageContentType,
                createdAt: message.createdAt,
                replyTo: message.replyTo
            }, (response) => {
                console.log('Frontend - Received server response:', response);
                if (response && response.error) {
                    console.error('Frontend - Server error:', response.error);
                    // Remove the optimistic message if there was an error
                    get().setMessages(get().messages.filter(msg => msg._id !== tempId));
                }
            });

        } catch (error) {
            console.error('Frontend - Error sending message:', error);
        }
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

    fetchMessages: async (userId1, userId2, limit = 15, beforeId = null) => {
        const { currentUser } = get();
        if (!currentUser || !currentUser._id) {
            console.error('fetchMessages: Aborted, currentUser or currentUser._id is null/undefined.', currentUser);
            return;
        }
        console.log(`fetchMessages: Fetching messages for users: ${userId1} and ${userId2} with limit ${limit} and beforeId ${beforeId}`);
        try {
            set(state => ({
                chatPagination: {
                    ...state.chatPagination,
                    [userId2]: { ...state.chatPagination[userId2], isLoading: true }
                }
            }));
            const url = `/chat/history/${userId1}/${userId2}`;
            const params = { limit: limit };
            if (beforeId) {
                params.beforeId = beforeId;
            }
            const response = await axios.get(url, { params });
            console.log('fetchMessages: Raw messages received:', response.data.messages.length);

            const messagesToProcess = response.data.messages;

            // Process images for the fetched messages
            const messagesWithProcessedImages = await Promise.all(messagesToProcess.map(async (msg) => {
                // Only process if image data exists and imageUrl is not already set (handle potential re-fetching)
                if (msg.image && !msg.imageUrl) {
                    console.log(`fetchMessages: Processing image for message: ${msg._id} (has image: ${!!msg.image}, has imageUrl: ${!!msg.imageUrl})`);
                    const imageData = processImageBuffer(msg.image, msg.imageContentType);
                    if (imageData) {
                        console.log('fetchMessages: Image processed for message:', msg._id, 'imageUrl:', imageData.url);
                        return {
                            ...msg, // Ensure all original message properties, including replyTo, are spread
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
                // If message already has imageUrl or no image data, return as is, preserving replyTo
                return msg;
            }));

            // If fetching older messages, prepend them to the existing messages
            if (beforeId) {
                set(state => ({
                    messages: [...messagesWithProcessedImages, ...state.messages],
                    chatPagination: {
                        ...state.chatPagination,
                        [userId2]: {
                            hasMore: response.data.hasMore,
                            oldestMessageId: messagesWithProcessedImages[0]?._id || null,
                            isLoading: false,
                            totalCount: response.data.totalCount
                        }
                    }
                }));
                console.log('fetchMessages: Prepended older messages. Total:', get().messages.length);
            } else {
                // Initial fetch or refetch without beforeId, replace existing messages
                set(state => ({
                    messages: messagesWithProcessedImages,
                    chatPagination: {
                        ...state.chatPagination,
                        [userId2]: {
                            hasMore: response.data.hasMore,
                            oldestMessageId: messagesWithProcessedImages[0]?._id || null,
                            isLoading: false,
                            totalCount: response.data.totalCount
                        }
                    }
                }));
                console.log('fetchMessages: Messages set with processed images. Total:', messagesWithProcessedImages.length);
            }

        } catch (error) {
            console.error('fetchMessages: Error fetching messages:', error.message, error.response?.data);
            set(state => ({
                chatPagination: {
                    ...state.chatPagination,
                    [userId2]: { ...state.chatPagination[userId2], isLoading: false }
                }
            }));
        }
    },

    fetchGroupMessages: async (groupId, limit = 15, beforeId = null) => {
        console.log(`fetchGroupMessages: Fetching group messages for group: ${groupId} with limit ${limit} and beforeId ${beforeId}`);
        try {
            set(state => ({
                chatPagination: {
                    ...state.chatPagination,
                    [groupId]: { ...state.chatPagination[groupId], isLoading: true }
                }
            }));
            const url = `/chat/group/${groupId}/messages`;
            const params = { limit: limit };
            if (beforeId) {
                params.beforeId = beforeId;
            }
            const response = await axios.get(url, { params });
            console.log('fetchGroupMessages: Raw group messages received:', response.data.messages.length);

            const messagesToProcess = response.data.messages;

            // Process images for the fetched messages
            const messagesWithProcessedImages = await Promise.all(messagesToProcess.map(async (msg) => {
                // Only process if image data exists and imageUrl is not already set
                if (msg.image && !msg.imageUrl) {
                    console.log(`fetchGroupMessages: Processing image for message: ${msg._id} (has image: ${!!msg.image}, has imageUrl: ${!!msg.imageUrl})`);
                    const imageData = processImageBuffer(msg.image, msg.imageContentType);
                    if (imageData) {
                        console.log('fetchGroupMessages: Image processed for message:', msg._id, 'imageUrl:', imageData.url);
                        return {
                            ...msg, // Ensure all original message properties, including replyTo, are spread
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
                // If message already has imageUrl or no image data, return as is, preserving replyTo
                return msg;
            }));

            // If fetching older messages, prepend them to the existing messages
            if (beforeId) {
                set(state => ({
                    messages: [...messagesWithProcessedImages, ...state.messages],
                    chatPagination: {
                        ...state.chatPagination,
                        [groupId]: {
                            hasMore: response.data.hasMore,
                            oldestMessageId: messagesWithProcessedImages[0]?._id || null,
                            isLoading: false,
                            totalCount: response.data.totalCount
                        }
                    }
                }));
                console.log('fetchGroupMessages: Prepended older messages. Total:', get().messages.length);
            } else {
                // Initial fetch or refetch without beforeId, replace existing messages
                set(state => ({
                    messages: messagesWithProcessedImages,
                    chatPagination: {
                        ...state.chatPagination,
                        [groupId]: {
                            hasMore: response.data.hasMore,
                            oldestMessageId: messagesWithProcessedImages[0]?._id || null,
                            isLoading: false,
                            totalCount: response.data.totalCount
                        }
                    }
                }));
                console.log('fetchGroupMessages: Messages set with processed images. Total:', messagesWithProcessedImages.length);
            }

        } catch (error) {
            console.error('fetchGroupMessages: Error fetching group messages:', error.message, error.response?.data);
            set(state => ({
                chatPagination: {
                    ...state.chatPagination,
                    [groupId]: { ...state.chatPagination[groupId], isLoading: false }
                }
            }));
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

    setSelectedChat: (chat, isMonitoring = false) => {
        console.log('setSelectedChat: Called with chat:', chat, 'isMonitoring:', isMonitoring);
        // Revoke all existing image URLs when changing chats
        get().activeImageUrls.forEach(url => {
            console.log('setSelectedChat: Revoking Blob URL:', url);
            URL.revokeObjectURL(url);
        });
        set({ activeImageUrls: new Set() }); // Clear the set

        set({ selectedChat: chat, isMonitoringAdminView: isMonitoring }); // Update isMonitoringAdminView
        set({ messages: [] });
        // Mark messages in the newly selected chat as read
        if (chat) {
            get().markMessagesAsRead(chat.id);
        }

        // No real-time fetches or joins if in monitoring view
        if (!isMonitoring) {
            // If socket was created in a previous session, ensure listeners are enabled for this non-monitoring view.
            get().initializeSocket(true);

            if (chat?.type === 'group') {
                get().fetchGroupMessages(chat.id);
            } else if (chat?.type === 'user') {
                get().fetchMessages(get().currentUser?._id, chat.id);
            }
        } else {
            // If in monitoring view, ensure socket listeners are explicitly off.
            get().cleanupSocket();
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
        try {
            console.log('cleanupSocket: Cleaning up socket listeners and disconnecting.');
            if (socket) {
                socket.off('receive-message');
                socket.off('update-online-users');
                socket.off('typing');
                socket.off('user-online');
                socket.off('user-offline');
                socket.disconnect(); // Disconnect the socket
                socket = null; // Clear the socket instance
            }
            isSocketInitialized = false; // Reset initialization flag
            // Revoke all remaining active image URLs on socket cleanup/app unmount
            get().activeImageUrls.forEach(url => URL.revokeObjectURL(url));
            set({ activeImageUrls: new Set() });
        } catch (error) {
            console.error('Error cleaning up socket:', error);
        }
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