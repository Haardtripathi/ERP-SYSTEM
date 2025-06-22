import { create } from 'zustand';
import axios from '../axiosInstance';
import io from 'socket.io-client';

// Debug flag - set to true to enable verbose logging
const DEBUG_MODE = false;

// Move socket instance outside of store to prevent multiple connections
let socket = null;
let isSocketInitialized = false;

// Add this near the top of the file, after imports
const MAX_FILE_SIZE = 1000 * 1024 * 1024; // 100MB in bytes

// Helper function to ensure socket is initialized
// This function is now removed. Its logic is integrated into initializeSocket.

// Function to extract Uint8Array from buffer object
const getUint8ArrayFromBuffer = (buffer) => {
    if (!buffer || !buffer.data || !Array.isArray(buffer.data)) {
        console.error('getUint8ArrayFromBuffer: Invalid buffer data format:', buffer);
        return new Uint8Array();
    }
    const uint8Array = new Uint8Array(buffer.data);

    return uint8Array;
};

// Function to create Blob URL from Uint8Array
const createBlobUrl = (uint8Array, contentType) => {

    const blob = new Blob([uint8Array], { type: contentType });

    const url = URL.createObjectURL(blob);

    return { url, blob };
};

const processAttachmentBuffer = (buffer, contentType) => {
    // Only log in development mode or when debugging is explicitly enabled




    let uint8ArrayData = null;

    if (buffer && buffer.data && Array.isArray(buffer.data)) {

        uint8ArrayData = buffer.data;
    } else if (buffer instanceof ArrayBuffer) {

        uint8ArrayData = new Uint8Array(buffer);
    } else if (typeof buffer === 'string' && buffer.startsWith('data:')) {

        try {
            const base64Data = buffer.split('base64,')[1];
            uint8ArrayData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        } catch (error) {
            console.error('processAttachmentBuffer: Error decoding base64 string:', error);
            return null;
        }
    }

    if (!uint8ArrayData) {
        console.error('processAttachmentBuffer: Unrecognized or invalid buffer format', buffer);
        return null;
    }

    try {
        const uint8Array = new Uint8Array(uint8ArrayData);

        const { url, blob } = createBlobUrl(uint8Array, contentType);

        // Store the blob URL in the activeImageUrls set for both images and videos
        if (contentType.startsWith('image/') || contentType.startsWith('video/')) {
            const store = useChatStore.getState();
            store.activeImageUrls.add(url);

        }

        return { url, blob };
    } catch (error) {
        console.error('processAttachmentBuffer: Error processing attachment:', error);
        return null;
    }
};

// Helper function to determine file type
const getFileType = (file) => {
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'pdf';
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return 'spreadsheet';
    if (type.includes('document') || type.includes('word') || type.includes('text')) return 'document';
    if (type.startsWith('video/')) return 'video';
    return 'other';
};

// Helper function to process file data
const processFileData = async (file) => {
    try {
        console.log('Processing file:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        // Add file size check
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }

        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Create a blob URL for immediate preview
        const blob = new Blob([uint8Array], { type: file.type });
        const url = URL.createObjectURL(blob);

        // Add to activeImageUrls if it's an image or video
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            useChatStore.getState().activeImageUrls.add(url);
        }

        return {
            data: Array.from(uint8Array),
            contentType: file.type,
            fileName: file.name,
            fileSize: file.size,
            fileType: getFileType(file),
            url: url,
            blob: blob
        };
    } catch (error) {
        console.error('Error processing file:', error);
        throw error; // Propagate the error to handle it in the UI
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
    unreadChats: 0, // New state to track total number of unread chats
    chatPagination: {}, // Stores pagination info per chat: { chatId: { hasMore: true, oldestMessageId: null, isLoading: false } },
    isMonitoringAdminView: false, // New state to indicate if in admin monitoring mode
    currentFetchId: null,
    lastSeenMessages: {}, // Track last seen message IDs per chat
    processedSeenEvents: new Set(), // Track processed message-seen events to prevent duplicates

    // Actions
    setMessages: (newMessages) => {
        if (DEBUG_MODE) {

        }

        // Process attachments before updating messages
        const processedMessages = newMessages.map(msg => {
            if (msg.attachments && msg.attachments.length > 0) {
                const processedAttachments = msg.attachments.map(attachment => {
                    if (attachment.data) {
                        const processed = processAttachmentBuffer(attachment.data, attachment.contentType);
                        if (processed) {
                            return {
                                ...attachment,
                                url: processed.url,
                                blob: processed.blob
                            };
                        }
                    }
                    return attachment;
                });

                return {
                    ...msg,
                    attachments: processedAttachments,
                    attachmentUrls: processedAttachments.map(att => att.url).filter(Boolean),
                    attachmentBlobs: processedAttachments.map(att => att.blob).filter(Boolean)
                };
            }
            return msg;
        });

        set({ messages: processedMessages });
    },

    setCurrentUser: (user) => {
        try {
            const actualUser = user?.user || user;
            set({ currentUser: actualUser, isAdmin: actualUser?.role === 'admin' });
            if (actualUser && !get().isAdmin) { // Only initialize socket and join chat if NOT an admin
                get().initializeSocket(true); // Initialize with listeners
                get().joinChat(actualUser._id);
            } else if (actualUser && get().isAdmin) {

                get().cleanupSocket(); // Ensure no socket is active for admin on login
            }
        } catch (error) {
            console.error('Error setting current user:', error);
        }
    },

    // New functions for user info and media
    getUserInfo: async (userId) => {
        try {
            const response = await axios.get(`/chat/user-info/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    },

    getChatMedia: async (userId1, userId2, page = 1, limit = 12) => {
        try {

            const response = await axios.get(`/chat/chat-media/${userId1}/${userId2}`, {
                params: { page, limit },
                timeout: 30000 // Increase timeout to 30 seconds
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching chat media:', error);
            throw error;
        }
    },

    initializeSocket: (force = false) => {
        if (isSocketInitialized && !force) return;
        if (!socket) {
            socket = io('http://localhost:5001', {
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                transports: ['websocket', 'polling'],
                maxHttpBufferSize: MAX_FILE_SIZE, // Increased to 100MB
                timeout: 60000 // Increase timeout to 60 seconds
            });
        }
        try {
            // If socket is already initialized, clear existing listeners to prevent duplicates
            if (socket) {

                socket.off('receive-message');
                socket.off('update-online-users');
                socket.off('typing');
                socket.off('user-online');
                socket.off('user-offline');
                socket.off('message-seen');
                socket.disconnect();
                socket = null;
                isSocketInitialized = false;
            }

            // Only create and connect the socket if we intend to attach listeners
            if (force) {

                socket = io('http://localhost:5001', {
                    withCredentials: true,
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    transports: ['websocket', 'polling'],
                    maxHttpBufferSize: MAX_FILE_SIZE, // Increased to 100MB
                    timeout: 60000 // Increase timeout to 60 seconds
                });

                // Attach listeners if socket exists and is connected
                if (socket) {

                    const processedMessageIds = new Set();

                    socket.on('connect', () => {

                        // Re-join chat if we have a current user
                        if (get().currentUser?._id) {

                            get().joinChat(get().currentUser._id);
                            // Request current online users list
                            socket.emit('get-online-users');

                            // Re-join group if in a group chat
                            const selectedChat = get().selectedChat;
                            if (selectedChat?.type === 'group') {

                                get().joinGroup(selectedChat.id);
                            }
                        }
                    });

                    socket.on('disconnect', (reason) => {

                        set({ onlineUsers: [] });
                    });

                    socket.on('connect_error', (error) => {
                        console.error('Socket connection error:', error);
                        set({ onlineUsers: [] });
                    });

                    socket.on('receive-message', async (message) => {

                        if (!message || !message._id) {
                            console.error('Invalid message received:', message);
                            return;
                        }

                        // Check for duplicate messages
                        if (processedMessageIds.has(message._id)) {

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
                            // Check if the _id matches or if it's a temporary ID that matches by content/sender/receiver/group/time
                            return msg._id === message._id ||
                                (msg._id.startsWith('temp_') &&
                                    msg.sender === message.sender &&
                                    (msg.receiver === message.receiver || msg.group === message.group) &&
                                    Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000);
                        });

                        if (existingMessage) {
                            // Process attachments if present
                            let processedMessage = { ...message };
                            if (message.attachments && message.attachments.length > 0) {
                                const processedAttachments = await Promise.all(message.attachments.map(async (attachment) => {
                                    const attachmentData = processAttachmentBuffer(attachment.data, attachment.contentType);
                                    return attachmentData ? { ...attachment, url: attachmentData.url, blob: attachmentData.blob } : null;
                                }));

                                processedMessage = {
                                    ...message,
                                    attachmentUrls: processedAttachments.map(att => att?.url).filter(Boolean),
                                    attachmentBlobs: processedAttachments.map(att => att?.blob).filter(Boolean),
                                    attachments: processedAttachments.filter(Boolean)
                                };
                            }

                            // Ensure the _id is updated to the server's actual _id
                            processedMessage._id = message._id;

                            // Replace the temporary message with the server message, preserving client-side URLs if available
                            const updatedMessages = get().messages.map(msg =>
                                msg._id === existingMessage._id ? processedMessage : msg
                            );
                            get().setMessages(updatedMessages);

                            // Check if this is a new message for the current chat
                            const selectedChat = get().selectedChat;
                            const chatId = message.group || (message.sender === get().currentUser._id ? message.receiver : message.sender);

                            if (selectedChat &&
                                ((selectedChat.type === 'group' && selectedChat.id === message.group) ||
                                    (selectedChat.type === 'user' && selectedChat.id === chatId))) {
                                // If we're in the chat, mark it as seen
                                get().markMessagesAsSeen(chatId, selectedChat.type === 'group');
                            } else {
                                // If we're not in the chat, increment unread count
                                if (message.group) {
                                    // For group messages, use the new group-specific function

                                    get().updateGroupUnreadCount(message.group, true);
                                } else {
                                    // For private messages, use the existing logic
                                    get().setUnreadMessages(chatId, (get().unreadMessages[chatId] || 0) + 1);
                                }
                            }

                            return;
                        }

                        // Process the message (new message or non-optimistic update)
                        const chatId = message.group || (message.sender === get().currentUser._id ? message.receiver : message.sender);
                        const selectedChat = get().selectedChat;

                        // Only update messages if we're in the correct chat
                        if (selectedChat &&
                            ((selectedChat.type === 'group' && selectedChat.id === message.group) ||
                                (selectedChat.type === 'user' && selectedChat.id === chatId))) {

                            // Process attachments if present
                            let processedMessage = { ...message };
                            if (message.attachments && message.attachments.length > 0) {
                                const processedAttachments = await Promise.all(message.attachments.map(async (attachment) => {
                                    const attachmentData = processAttachmentBuffer(attachment.data, attachment.contentType);
                                    return attachmentData ? { ...attachment, url: attachmentData.url, blob: attachmentData.blob } : null;
                                }));

                                processedMessage = {
                                    ...message,
                                    attachmentUrls: processedAttachments.map(att => att?.url).filter(Boolean),
                                    attachmentBlobs: processedAttachments.map(att => att?.blob).filter(Boolean),
                                    attachments: processedAttachments.filter(Boolean)
                                };
                            }

                            get().setMessages([...get().messages, processedMessage]);
                            get().markMessagesAsSeen(chatId, selectedChat.type === 'group');
                        } else {
                            // Increment unread count for other chats
                            if (message.group) {
                                // For group messages, use the new group-specific function

                                // Only increment if the message is not from the current user
                                if (message.sender !== get().currentUser._id) {
                                    get().updateGroupUnreadCount(message.group, true);
                                }
                            } else {
                                // For private messages, use the existing logic
                                get().setUnreadMessages(chatId, (get().unreadMessages[chatId] || 0) + 1);
                            }
                        }
                    });

                    socket.on('update-online-users', (users) => {

                        set({ onlineUsers: users });
                    });

                    // Add new socket event for message seen status
                    socket.on('message-seen', (data) => {
                        const currentMessagesCount = get().messages.length;
                        get().updateMessageSeenStatus(data.messageId, data.seenBy);
                        // Only log if messages were actually updated (count changed)
                        const newMessagesCount = get().messages.length;
                        if (newMessagesCount !== currentMessagesCount) {

                        }
                    });

                    socket.on('user-online', (userId) => {

                        if (userId && typeof userId === 'string') {
                            set((state) => ({
                                onlineUsers: [...new Set([...state.onlineUsers, userId])]
                            }));
                        }
                    });

                    socket.on('user-offline', (userId) => {

                        if (userId && typeof userId === 'string') {
                            set((state) => ({
                                onlineUsers: state.onlineUsers.filter(id => id !== userId)
                            }));
                        }
                    });

                    socket.on('typing', (data) => {
                        if (get().selectedChat?.id === data.userId) {
                            set({ isTyping: data.isTyping });
                        }
                    });

                    // Add group-related socket events
                    socket.on('group-created', (group) => {

                        set((state) => {
                            // Check if group already exists to avoid duplicates
                            const existingGroup = state.groups.find(g => g._id === group._id);
                            if (!existingGroup) {
                                return { groups: [...state.groups, group] };
                            }
                            return state;
                        });
                    });

                    socket.on('group-updated', (data) => {

                        set((state) => ({
                            groups: state.groups.map(group =>
                                group._id === data.group._id ? data.group : group
                            )
                        }));
                    });

                    socket.on('group-removed', (data) => {

                        set((state) => ({
                            groups: state.groups.filter(group => group._id !== data.groupId)
                        }));
                    });

                    socket.on('group-added', (data) => {

                        set((state) => {
                            // Check if group already exists to avoid duplicates
                            const existingGroup = state.groups.find(g => g._id === data.group._id);
                            if (!existingGroup) {
                                return { groups: [...state.groups, data.group] };
                            }
                            return state;
                        });
                    });

                    // Add socket event for unread count updates
                    socket.on('unread-count-update', (data) => {

                        if (data.groupId) {
                            // Update specific group unread count
                            set(state => {
                                const newUnreadMessages = {
                                    ...state.unreadMessages,
                                    [data.groupId]: data.count
                                };
                                const unreadChats = Object.values(newUnreadMessages).filter(count => count > 0).length;



                                return {
                                    unreadMessages: newUnreadMessages,
                                    unreadChats
                                };
                            });
                        } else if (data.userId) {
                            // Update specific user unread count
                            set(state => {
                                const newUnreadMessages = {
                                    ...state.unreadMessages,
                                    [data.userId]: data.count
                                };
                                const unreadChats = Object.values(newUnreadMessages).filter(count => count > 0).length;



                                return {
                                    unreadMessages: newUnreadMessages,
                                    unreadChats
                                };
                            });
                        }
                    });

                    isSocketInitialized = true;

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

            if (socket && socket.connected && !get().isMonitoringAdminView) {
                socket.emit('join', userId);
                // Request online users list after joining
                socket.emit('get-online-users');
            } else {

            }
        } catch (error) {
            console.error('Error joining chat:', error);
        }
    },

    joinGroup: (groupId) => {
        try {

            // Only join if socket exists AND not in monitoring view AND socket is connected
            if (socket && !get().isMonitoringAdminView && socket.connected) {
                socket.emit('join-group', groupId);
            } else {

            }
        } catch (error) {
            console.error('Error joining group:', error);
        }
    },

    sendMessage: async (content, receiverId, groupId = null, files = [], replyToId = null) => {
        try {
            if (get().isMonitoringAdminView) {
                console.warn('sendMessage: Sending messages disabled in admin monitoring view.');
                return;
            }

            console.log('Frontend - sendMessage called with:', {
                content,
                receiverId,
                groupId,
                filesCount: files.length,
                replyToId
            });

            const { currentUser } = get();
            if (!currentUser || !currentUser._id) {
                console.error('sendMessage: Aborted, currentUser or currentUser._id is null/undefined.', currentUser);
                return;
            }
            if (!content && files.length === 0) {
                console.warn('sendMessage: Aborted, No content or files provided.');
                return;
            }

            // Ensure socket is initialized and connected
            if (!socket || !socket.connected) {

                get().initializeSocket(true);
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (!socket || !socket.connected) {
                    console.error('sendMessage: Socket still not connected after initialization.');
                    return;
                }
            }

            const processedFiles = [];
            const fileBlobs = [];

            for (const file of files) {
                console.log('Frontend - Processing file:', {
                    name: file.name,
                    type: file.type,
                    size: file.size
                });

                try {
                    const processedFile = await processFileData(file);
                    if (processedFile) {
                        processedFiles.push(processedFile);
                        fileBlobs.push(file);
                    }
                } catch (error) {
                    console.error('Frontend - Error processing file:', error);
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
                attachments: processedFiles,
                createdAt: new Date(),
                replyTo: replyToId ? get().messages.find(m => m._id === replyToId) : null
            };

            // Add optimistic update with client-side Blob URLs
            const optimisticMessage = {
                ...message,
                attachmentUrls: processedFiles.map(file => file.url),
                attachmentBlobs: fileBlobs,
                attachments: processedFiles.map(file => ({
                    fileName: file.fileName,
                    fileSize: file.fileSize,
                    fileType: file.fileType,
                    contentType: file.contentType,
                    url: file.url
                }))
            };

            // Add the optimistic message to the state
            set(state => ({
                messages: [...state.messages, optimisticMessage]
            }));

            // Emit the message
            socket.emit('send-message', {
                sender: message.sender,
                receiver: message.receiver,
                group: message.group,
                message: message.message,
                attachments: message.attachments,
                createdAt: message.createdAt,
                replyTo: message.replyTo
            }, (response) => {

                if (response && response.error) {
                    console.error('Frontend - Server error:', response.error);
                    // Remove the optimistic message if there was an error
                    set(state => ({
                        messages: state.messages.filter(msg => msg._id !== tempId)
                    }));
                }
            });

        } catch (error) {
            console.error('Frontend - Error sending message:', error);
        }
    },

    fetchUsers: async () => {

        try {
            const response = await axios.get('/chat/users');

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

        try {
            const response = await axios.get(`/chat/mygroups/${currentUser._id}`);

            set({ groups: response.data });
        } catch (error) {
            console.error('fetchGroups: Error fetching groups:', error.message, error.response?.data);
        }
    },

    fetchMessages: async (userId1, userId2, limit = 15, beforeId = null, fetchId = null) => {
        const { currentUser, selectedChat, currentFetchId } = get();
        if (!currentUser || !currentUser._id) {
            console.error('fetchMessages: Aborted, currentUser or currentUser._id is null/undefined.', currentUser);
            return;
        }

        // Only abort if there's a newer fetch in progress
        if (fetchId && currentFetchId && fetchId < currentFetchId) {

            return;
        }

        // Check if we're still fetching for the currently selected chat
        // For monitoring mode, we need to check both user1Id and user2Id
        if (selectedChat?.type === 'user') {
            const isMonitoring = selectedChat.user1Id && selectedChat.user2Id;
            if (isMonitoring) {
                // In monitoring mode, check if the current fetch matches the selected user pair
                if (selectedChat.user1Id !== userId1 || selectedChat.user2Id !== userId2) {

                    return;
                }
            } else {
                // Normal mode, check if selectedChat.id matches userId2
                if (selectedChat.id !== userId2) {

                    return;
                }
            }
        }


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

            // Check again if this fetch is still valid
            if (fetchId && currentFetchId && fetchId < currentFetchId) {

                return;
            }



            const messagesToProcess = response.data.messages;
            const messagesWithProcessedAttachments = await Promise.all(
                messagesToProcess.map(async (message) => {
                    if (message.attachments && message.attachments.length > 0) {
                        const processedAttachments = await Promise.all(
                            message.attachments.map(async (attachment) => {
                                const attachmentData = processAttachmentBuffer(attachment.data, attachment.contentType);
                                return attachmentData ? { ...attachment, url: attachmentData.url, blob: attachmentData.blob } : null;
                            })
                        );

                        return {
                            ...message,
                            attachmentUrls: processedAttachments.map(att => att?.url).filter(Boolean),
                            attachmentBlobs: processedAttachments.map(att => att?.blob).filter(Boolean),
                            attachments: processedAttachments.filter(Boolean)
                        };
                    }
                    return message;
                })
            );

            // If fetching older messages, prepend them to the existing messages
            if (beforeId) {
                set(state => ({
                    messages: [...messagesWithProcessedAttachments, ...state.messages],
                    chatPagination: {
                        ...state.chatPagination,
                        [userId2]: {
                            hasMore: response.data.hasMore,
                            oldestMessageId: messagesWithProcessedAttachments[0]?._id || null,
                            isLoading: false,
                            totalCount: response.data.totalCount
                        }
                    }
                }));
            } else {
                // Initial fetch or refetch without beforeId, replace existing messages
                set(state => ({
                    messages: messagesWithProcessedAttachments,
                    chatPagination: {
                        ...state.chatPagination,
                        [userId2]: {
                            hasMore: response.data.hasMore,
                            oldestMessageId: messagesWithProcessedAttachments[0]?._id || null,
                            isLoading: false,
                            totalCount: response.data.totalCount
                        }
                    }
                }));
            }

            // After fetching messages, mark them as seen if this is the selected chat
            if (selectedChat &&
                ((selectedChat.type === 'user' && selectedChat.id === userId2) ||
                    (selectedChat.type === 'group' && selectedChat.id === userId2))) {
                get().markMessagesAsSeen(userId2, selectedChat.type === 'group');
            }

            // Calculate unread count for a chat
            const unreadCount = get().calculateUnreadCount(userId2, currentUser._id);
            get().setUnreadMessages(userId2, unreadCount);
        } catch (error) {
            console.error('fetchMessages: Error fetching messages:', error.message, error.response?.data);
            // Only update loading state if this is still the current fetch
            if (!fetchId || !currentFetchId || fetchId >= currentFetchId) {
                set(state => ({
                    chatPagination: {
                        ...state.chatPagination,
                        [userId2]: { ...state.chatPagination[userId2], isLoading: false }
                    }
                }));
            }
        }
    },

    fetchGroupMessages: async (groupId, limit = 15, beforeId = null, fetchId = null) => {
        const { currentUser, selectedChat, currentFetchId } = get();

        // Check if this fetch is still valid
        if (fetchId !== currentFetchId) {

            return;
        }

        // Check if we're still fetching for the currently selected chat
        if (selectedChat?.type === 'group' && selectedChat.id !== groupId) {

            return;
        }


        try {
            set(state => ({
                chatPagination: {
                    ...state.chatPagination,
                    [groupId]: { ...state.chatPagination[groupId], isLoading: true }
                }
            }));

            // First fetch the group details to get member information
            const groupResponse = await axios.get(`/chat/group/${groupId}`);
            const groupData = groupResponse.data;

            // Update users state with group members if they're not already present
            set(state => {
                const existingUserIds = new Set(state.users.map(u => u._id));
                const newUsers = groupData.members.filter(member => !existingUserIds.has(member._id));
                return {
                    users: [...state.users, ...newUsers]
                };
            });

            const url = `/chat/group/${groupId}/messages`;
            const params = { limit: limit };
            if (beforeId) {
                params.beforeId = beforeId;
            }
            const response = await axios.get(url, { params });

            // Check again if this fetch is still valid
            if (fetchId !== get().currentFetchId) {

                return;
            }



            const messagesToProcess = response.data.messages;

            // Process attachments for the fetched messages
            const messagesWithProcessedAttachments = await Promise.all(messagesToProcess.map(async (msg) => {
                let processedMsg = { ...msg };

                if (processedMsg.attachments && processedMsg.attachments.length > 0) {
                    const processedCurrentAttachments = await Promise.all(processedMsg.attachments.map(async (att) => {
                        const attachmentData = processAttachmentBuffer(att.data, att.contentType);
                        return attachmentData ? { ...att, url: attachmentData.url, blob: attachmentData.blob } : null;
                    }));
                    processedMsg.attachmentUrls = processedCurrentAttachments.map(att => att?.url).filter(Boolean);
                    processedMsg.attachmentBlobs = processedCurrentAttachments.map(att => att?.blob).filter(Boolean);
                    processedMsg.attachments = processedCurrentAttachments.filter(Boolean);
                }

                // Process attachments in replyTo, if it exists and has attachments
                if (processedMsg.replyTo && processedMsg.replyTo.attachments && processedMsg.replyTo.attachments.length > 0) {

                    const processedReplyAttachments = await Promise.all(processedMsg.replyTo.attachments.map(async (att) => {
                        const attachmentData = processAttachmentBuffer(att.data, att.contentType);
                        return attachmentData ? { ...att, url: attachmentData.url, blob: attachmentData.blob } : null;
                    }));
                    processedMsg.replyTo = {
                        ...processedMsg.replyTo,
                        attachmentUrls: processedReplyAttachments.map(att => att?.url).filter(Boolean),
                        attachmentBlobs: processedReplyAttachments.map(att => att?.blob).filter(Boolean),
                        attachments: processedReplyAttachments.filter(Boolean)
                    };
                }

                return processedMsg;
            }));

            // Final check if this fetch is still valid
            if (fetchId !== get().currentFetchId) {

                return;
            }

            // If fetching older messages, prepend them to the existing messages
            if (beforeId) {
                set(state => ({
                    messages: [...messagesWithProcessedAttachments, ...state.messages],
                    chatPagination: {
                        ...state.chatPagination,
                        [groupId]: {
                            hasMore: response.data.hasMore,
                            oldestMessageId: messagesWithProcessedAttachments[0]?._id || null,
                            isLoading: false,
                            totalCount: response.data.totalCount
                        }
                    }
                }));
            } else {
                // Initial fetch or refetch without beforeId, replace existing messages
                set(state => ({
                    messages: messagesWithProcessedAttachments,
                    chatPagination: {
                        ...state.chatPagination,
                        [groupId]: {
                            hasMore: response.data.hasMore,
                            oldestMessageId: messagesWithProcessedAttachments[0]?._id || null,
                            isLoading: false,
                            totalCount: response.data.totalCount
                        }
                    }
                }));
            }

            // Calculate unread count for a chat
            const unreadCount = get().calculateUnreadCount(groupId, currentUser._id);
            get().setUnreadMessages(groupId, unreadCount);
        } catch (error) {
            console.error('fetchGroupMessages: Error fetching group messages:', error.message, error.response?.data);
            // Only update loading state if this is still the current fetch
            if (fetchId === get().currentFetchId) {
                set(state => ({
                    chatPagination: {
                        ...state.chatPagination,
                        [groupId]: { ...state.chatPagination[groupId], isLoading: false }
                    }
                }));
            }
        }
    },

    createGroup: async (name, members, isHidden = false) => {
        const { currentUser } = get();
        if (!currentUser || !currentUser._id) {
            console.error('createGroup: Aborted, currentUser or currentUser._id is null/undefined.', currentUser);
            return;
        }
        const validMembers = Array.isArray(members) ? members.filter(member => typeof member === 'string') : [];

        try {
            const response = await axios.post('/chat/group', {
                name,
                members: validMembers,
                visibleTo: isHidden ? [currentUser._id] : validMembers,
                createdBy: currentUser._id
            });

            // Don't add to local state here as it will be added via socket event
            return response.data;
        } catch (error) {
            console.error('createGroup: Error creating group:', error.message, error.response?.data);
            throw error;
        }
    },

    setSelectedChat: (chat, isMonitoring = false) => {


        // Cancel any ongoing fetches by setting a flag
        const currentFetchId = Date.now();
        set({ currentFetchId });

        // Revoke all existing image URLs when changing chats
        get().activeImageUrls.forEach(url => {

            URL.revokeObjectURL(url);
        });
        set({ activeImageUrls: new Set() }); // Clear the set

        // Reset loading state for all chats
        set(state => ({
            chatPagination: Object.keys(state.chatPagination).reduce((acc, key) => ({
                ...acc,
                [key]: { ...state.chatPagination[key], isLoading: false }
            }), {})
        }));

        // First clear messages and update selected chat
        set({ messages: [] });
        set({ selectedChat: chat, isMonitoringAdminView: isMonitoring });

        // Mark messages in the newly selected chat as read
        if (chat) {
            get().markMessagesAsRead(chat.id);
        }

        // No real-time fetches or joins if in monitoring view
        if (!isMonitoring) {
            // If socket was created in a previous session, ensure listeners are enabled for this non-monitoring view.
            get().initializeSocket(true);

            // Use setTimeout to ensure state updates are processed before fetching messages
            setTimeout(() => {
                if (chat?.type === 'group') {
                    // Join the group socket room
                    get().joinGroup(chat.id);
                    // Fetch group messages
                    get().fetchGroupMessages(chat.id, 15, null, currentFetchId);
                } else if (chat?.type === 'user') {
                    get().fetchMessages(get().currentUser?._id, chat.id, 15, null, currentFetchId);
                }
            }, 0);
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

        }
    },

    cleanupSocket: () => {
        try {

            if (socket) {
                socket.off('receive-message');
                socket.off('update-online-users');
                socket.off('typing');
                socket.off('user-online');
                socket.off('user-offline');
                socket.off('message-seen');
                socket.disconnect();
                socket = null;
            }
            isSocketInitialized = false;
            get().activeImageUrls.forEach(url => URL.revokeObjectURL(url));
            set({ activeImageUrls: new Set() });
        } catch (error) {
            console.error('Error cleaning up socket:', error);
        }
    },

    cleanupBlobUrls: () => {

        const store = get();

        // Only revoke URLs that are no longer in use
        const activeUrls = new Set();
        store.messages.forEach(msg => {
            if (msg.attachments) {
                msg.attachments.forEach(att => {
                    if (att.url && att.url.startsWith('blob:')) {
                        activeUrls.add(att.url);
                    }
                });
            }
        });

        // Revoke URLs that are no longer active
        store.activeImageUrls.forEach(url => {
            if (!activeUrls.has(url)) {

                URL.revokeObjectURL(url);
                store.activeImageUrls.delete(url);
            }
        });
    },

    setUnreadMessages: (chatId, count) => {
        set((state) => {
            const newUnreadMessages = { ...state.unreadMessages, [chatId]: count };
            // Calculate total number of chats with unread messages
            const unreadChats = Object.values(newUnreadMessages).filter(count => count > 0).length;
            return {
                unreadMessages: newUnreadMessages,
                unreadChats
            };
        });

    },

    markMessagesAsRead: (chatId) => {
        if (get().unreadMessages[chatId] > 0) {
            get().setUnreadMessages(chatId, 0);

        }
    },

    markMessagesAsSeen: async (chatId, isGroup) => {
        const currentUser = get().currentUser;

        try {
            if (!currentUser) return;

            // Add guard to prevent multiple calls in quick succession
            const now = Date.now();
            const lastSeenTime = get().lastSeenMessages[chatId] || 0;
            const timeSinceLastSeen = now - lastSeenTime;

            // Prevent calling markMessagesAsSeen more than once per second for the same chat
            if (timeSinceLastSeen < 1000) {

                return;
            }

            // Update last seen time
            set(state => ({
                lastSeenMessages: {
                    ...state.lastSeenMessages,
                    [chatId]: now
                }
            }));

            const response = await axios.post('/chat/mark-seen', {
                userId: currentUser._id,
                chatId,
                isGroup
            });

            // Update local state with the latest seenBy status
            if (response.data.messages) {
                set(state => ({
                    messages: state.messages.map(msg => {
                        const updatedMsg = response.data.messages.find(m => m._id === msg._id);
                        if (updatedMsg) {
                            return {
                                ...msg,
                                seenBy: updatedMsg.seenBy
                            };
                        }
                        return msg;
                    }),
                    unreadMessages: {
                        ...state.unreadMessages,
                        [chatId]: 0
                    }
                }));
            } else {
                // Fallback to just updating unread count if no messages returned
                set(state => ({
                    unreadMessages: {
                        ...state.unreadMessages,
                        [chatId]: 0
                    }
                }));
            }

            // Remove the redundant socket emit - the backend already handles this
            // The backend markMessagesAsSeen function emits the necessary socket events
        } catch (error) {
            console.error('Error marking messages as seen:', error);
        }
    },

    // Add new function to handle individual message seen status updates
    updateMessageSeenStatus: (messageId, seenBy) => {
        // Create a unique key for this event
        const eventKey = `${messageId}-${JSON.stringify(seenBy)}`;

        // Check if we've already processed this exact event
        if (get().processedSeenEvents.has(eventKey)) {

            return;
        }

        set(state => {
            // Check if the message exists in the current messages array
            const messageExists = state.messages.some(msg => msg._id === messageId);

            if (!messageExists) {
                // Only log in debug mode or when verbose logging is enabled

                return state; // Return unchanged state
            }

            const updatedMessages = state.messages.map(msg => {
                if (msg._id === messageId) {

                    return { ...msg, seenBy: seenBy }; // Use the complete seenBy array from server
                }
                return msg;
            });

            // Add this event to processed events
            const newProcessedEvents = new Set(state.processedSeenEvents);
            newProcessedEvents.add(eventKey);

            // Clean up old events (keep only last 100)
            if (newProcessedEvents.size > 100) {
                const eventsArray = Array.from(newProcessedEvents);
                const recentEvents = new Set(eventsArray.slice(-100));
                return {
                    messages: updatedMessages,
                    processedSeenEvents: recentEvents
                };
            }

            return {
                messages: updatedMessages,
                processedSeenEvents: newProcessedEvents
            };
        });
    },

    // Calculate unread count for a chat
    calculateUnreadCount: (chatId, userId) => {
        const { messages, selectedChat } = get();
        if (!selectedChat) return 0;

        if (selectedChat.type === 'user') {
            // For 1-1 chat, count all messages in this chat where userId is not in seenBy
            return messages.filter(
                msg =>
                    ((msg.sender === userId || msg.receiver === userId) &&
                        (msg.sender === chatId || msg.receiver === chatId)) &&
                    !msg.seenBy?.includes(userId)
            ).length;
        } else if (selectedChat.type === 'group') {
            // For group, count all messages in this group where:
            // 1. User is not the sender (don't count own messages)
            // 2. User is not in seenBy array
            return messages.filter(
                msg =>
                    msg.group === chatId &&
                    msg.sender !== userId &&
                    !msg.seenBy?.includes(userId)
            ).length;
        }
        return 0;
    },

    fetchUnreadCounts: async (userId) => {
        try {
            const response = await axios.get(`/chat/unread-counts/${userId}`);
            const { userUnread, groupUnread } = response.data;
            // Merge all unread counts
            const allUnread = { ...userUnread, ...groupUnread };
            // Count how many chats/groups have unread > 0
            const unreadChats = Object.values(allUnread).filter(count => count > 0).length;
            set({
                unreadMessages: allUnread,
                unreadChats
            });
        } catch (error) {
            console.error('Error fetching unread counts:', error);
        }
    },

    // Selector to get unread count for a specific chat/group
    getUnreadForChat: (chatId) => {
        return get().unreadMessages[chatId] || 0;
    },

    // New function to handle group unread message updates
    updateGroupUnreadCount: (groupId, increment = true) => {
        const currentUser = get().currentUser;
        if (!currentUser) {

            return;
        }



        set(state => {
            const currentCount = state.unreadMessages[groupId] || 0;
            const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);



            const newUnreadMessages = { ...state.unreadMessages, [groupId]: newCount };
            const unreadChats = Object.values(newUnreadMessages).filter(count => count > 0).length;



            return {
                unreadMessages: newUnreadMessages,
                unreadChats
            };
        });
    },

    // Function to refresh unread counts for all groups
    refreshGroupUnreadCounts: async () => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        try {
            const response = await axios.get(`/chat/unread-counts/${currentUser._id}`);
            const { groupUnread } = response.data;

            set(state => {
                const newUnreadMessages = { ...state.unreadMessages, ...groupUnread };
                const unreadChats = Object.values(newUnreadMessages).filter(count => count > 0).length;

                return {
                    unreadMessages: newUnreadMessages,
                    unreadChats
                };
            });
        } catch (error) {
            console.error('Error refreshing group unread counts:', error);
        }
    },

    // Function to fetch unread count for a specific group
    fetchGroupUnreadCount: async (groupId) => {
        const currentUser = get().currentUser;
        if (!currentUser || !groupId) return;

        try {
            const response = await axios.get(`/chat/group/${groupId}/unread/${currentUser._id}`);
            const { unreadCount } = response.data;

            set(state => ({
                unreadMessages: {
                    ...state.unreadMessages,
                    [groupId]: unreadCount
                }
            }));

            return unreadCount;
        } catch (error) {
            console.error('Error fetching group unread count:', error);
            return 0;
        }
    },

    // Function to force refresh all unread counts
    forceRefreshUnreadCounts: async () => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        try {

            const response = await axios.get(`/chat/unread-counts/${currentUser._id}`);
            const { userUnread, groupUnread } = response.data;

            // Merge all unread counts
            const allUnread = { ...userUnread, ...groupUnread };
            const unreadChats = Object.values(allUnread).filter(count => count > 0).length;



            set({
                unreadMessages: allUnread,
                unreadChats
            });
        } catch (error) {
            console.error('Error force refreshing unread counts:', error);
        }
    }
}));

export default useChatStore; 