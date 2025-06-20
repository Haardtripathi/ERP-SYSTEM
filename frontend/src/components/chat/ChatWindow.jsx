import React, { useState, useRef, useEffect } from 'react';
import useChatStore from '../../store/chatStore';
import { Send, Users, Loader2, Image as ImageIcon, XCircle, X, ChevronUp, ChevronDown, Reply, Info, Paperclip } from 'lucide-react';
import { cn } from "@/lib/utils";
import UserInfoPanel from './UserInfoPanel';
import GroupInfoPanel from './GroupInfoPanel';
import { PanelGroup, Panel } from 'react-resizable-panels';
import AudioPlayer from './AudioPlayer';
import AudioRecorder from './AudioRecorder';
import VideoPlayer from './VideoPlayer';

// Helper function to determine file type
const getFileType = (file) => {
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'pdf';
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return 'spreadsheet';
    if (type.includes('document') || type.includes('word') || type.includes('text')) return 'document';
    if (type.startsWith('audio/')) return 'audio';
    if (type.startsWith('video/')) return 'video';
    return 'other';
};

const ChatWindow = ({ isReadOnly = false, disableRealtime = false, users = [] }) => {
    const [message, setMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedFilePreviews, setSelectedFilePreviews] = useState([]);
    const [enlargedFile, setEnlargedFile] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const isInitialLoadRef = useRef(true);
    const isAtBottomRef = useRef(true);
    const [showNewMessageButton, setShowNewMessageButton] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState(null);

    const {
        messages,
        selectedChat,
        currentUser,
        sendMessage,
        isTyping,
        revokeImageUrl,
        setMessages,
        fetchMessages,
        fetchGroupMessages,
        chatPagination,
        users: storeUsers,
        unreadMessages,
        markMessagesAsSeen
    } = useChatStore();
    console.log("PAG", chatPagination)
    // Use either prop users or store users
    const allUsers = users.length > 0 ? users : storeUsers;

    // Message Skeleton Component
    const MessageSkeleton = ({ isMyMessage }) => (
        <div className={cn(
            "flex animate-pulse",
            isMyMessage ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[70%] rounded-xl p-3",
                isMyMessage
                    ? "bg-blue-200"
                    : "bg-gray-200"
            )}>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
        </div>
    );

    // Image Message Skeleton Component
    const ImageMessageSkeleton = ({ isMyMessage }) => (
        <div className={cn(
            "flex animate-pulse",
            isMyMessage ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[70%] rounded-xl p-3",
                isMyMessage
                    ? "bg-blue-200"
                    : "bg-gray-200"
            )}>
                <div className="w-[200px] h-[150px] bg-gray-300 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            </div>
        </div>
    );

    // Loading Overlay Component
    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Loading messages...</p>
            </div>
        </div>
    );

    useEffect(() => {
        if (selectedChat && inputRef.current) {
            // Focus input when chat is selected
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);

            if (selectedChat.type === 'user') {
                fetchMessages(currentUser._id, selectedChat.id, 15, null);
            } else if (selectedChat.type === 'group') {
                fetchGroupMessages(selectedChat.id, 15, null);
            }

            // Scroll to the bottom on initial load of a new chat
            if (isInitialLoadRef.current) {
                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    }
                }, 150);
                isInitialLoadRef.current = false; // Reset after initial scroll
            }
        }
        return () => {
            useChatStore.getState().cleanupBlobUrls();
            isInitialLoadRef.current = true; // Reset for next chat selection
        };
    }, [selectedChat, currentUser?._id]);

    // New useEffect to handle conditional socket listeners based on isReadOnly and disableRealtime
    useEffect(() => {
        if (disableRealtime) {
            // If real-time is explicitly disabled (e.g., admin monitoring view)
            useChatStore.getState().initializeSocket(false); // Do NOT attach listeners
            useChatStore.getState().cleanupSocket(); // Explicitly clean up any existing socket/listeners
        } else if (isReadOnly) {
            // If read-only, but not explicitly disabled real-time (e.g., future read-only views that might have some real-time)
            useChatStore.getState().initializeSocket(false);
            useChatStore.getState().cleanupSocket();
        } else {
            // If not read-only and real-time is not disabled, ensure standard socket initialization happens with listeners
            useChatStore.getState().initializeSocket(true); // Attach listeners
        }
        return () => {
            // Cleanup is handled by the main selectedChat useEffect, or by cleanupBlobUrls
            // For socket listeners, the `socket.off` in initializeSocket handles duplicates on re-init.
        };
    }, [isReadOnly, disableRealtime]); // Depend on both props

    const scrollToBottom = () => {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        });
    };

    // Update file preview effect
    useEffect(() => {
        if (selectedFiles.length === 0) {
            setSelectedFilePreviews([]);
            return;
        }

        const newPreviews = [];
        const processFile = async (file) => {
            return new Promise((resolve) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            url: reader.result,
                            type: 'image',
                            fileName: file.name,
                            fileSize: file.size
                        });
                    };
                    reader.readAsDataURL(file);
                } else {
                    resolve({
                        url: null,
                        type: getFileType(file),
                        fileName: file.name,
                        fileSize: file.size
                    });
                }
            });
        };

        const processFiles = async () => {
            const previews = await Promise.all(selectedFiles.map(processFile));
            setSelectedFilePreviews(previews);
        };

        processFiles();
    }, [selectedFiles]);

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            // User is at the bottom if the scroll position plus client height is approximately equal to scroll height
            isAtBottomRef.current = Math.abs(scrollHeight - scrollTop - clientHeight) < 1; // Allow for slight pixel variations
        }
    };

    // Add scroll event listener
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            // Initial check
            handleScroll();
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, []); // Empty dependency array means this runs once on mount

    // New useEffect to handle new messages and show/hide the button
    useEffect(() => {
        if (selectedChat && messages.length > 0) {
            // Only show the button if not at the bottom and new messages have arrived (after initial load)
            if (!isAtBottomRef.current && !isInitialLoadRef.current) {
                setShowNewMessageButton(true);
            } else {
                // If at bottom, or it's initial load, scroll to bottom and hide button
                scrollToBottom();
                setShowNewMessageButton(false);
            }
        }
    }, [messages, selectedChat]);

    const handleLoadOlderMessages = () => {
        const container = messagesContainerRef.current;
        if (!container) return;

        // Store the ID of the oldest message currently displayed BEFORE new messages are fetched
        const messageElements = container.querySelectorAll('.message-item');
        const oldestDisplayedMessageElement = messageElements.length > 0 ? messageElements[0] : null;
        const oldestDisplayedMessageId = oldestDisplayedMessageElement ? oldestDisplayedMessageElement.dataset.messageId : null;

        // Get the correct chat ID based on chat type
        const chatId = selectedChat.id;
        const pagination = chatPagination[chatId];

        if (pagination?.hasMore && !pagination?.isLoading) {
            // Store current scroll position and height
            const scrollPosition = container.scrollTop;
            const scrollHeight = container.scrollHeight;

            // Generate a new fetch ID
            const newFetchId = Date.now();
            useChatStore.getState().currentFetchId = newFetchId;

            if (selectedChat.type === 'user') {
                if (isReadOnly) {
                    const firstMessage = messages[0];
                    if (firstMessage) {
                        const user1Id = firstMessage.sender;
                        const user2Id = firstMessage.receiver;
                        fetchMessages(user1Id, user2Id, 15, pagination.oldestMessageId, newFetchId);
                    }
                } else {
                    fetchMessages(currentUser._id, selectedChat.id, 15, pagination.oldestMessageId, newFetchId);
                }
            } else if (selectedChat.type === 'group') {
                fetchGroupMessages(selectedChat.id, 15, pagination.oldestMessageId, newFetchId);
            }

            // After messages are loaded, restore scroll position
            setTimeout(() => {
                if (container) {
                    const newScrollHeight = container.scrollHeight;
                    const scrollDiff = newScrollHeight - scrollHeight;
                    container.scrollTop = scrollPosition + scrollDiff;

                    // If we have the oldest displayed message ID, try to scroll to it
                    if (oldestDisplayedMessageId) {
                        const messageElement = container.querySelector(`[data-message-id="${oldestDisplayedMessageId}"]`);
                        if (messageElement) {
                            messageElement.scrollIntoView({ behavior: 'auto', block: 'start' });
                        }
                    }
                }
            }, 100);
        }
    };

    // Add new useEffect to handle initial group message loading
    useEffect(() => {
        if (selectedChat && selectedChat.type === 'group') {
            // Generate a new fetch ID for initial load
            const newFetchId = Date.now();
            useChatStore.getState().currentFetchId = newFetchId;
            fetchGroupMessages(selectedChat.id, 15, null, newFetchId);
        }
    }, [selectedChat?.id, selectedChat?.type]);

    // Add new useEffect to handle scroll position restoration after loading older messages
    useEffect(() => {
        if (messages.length > 0 && !isInitialLoadRef.current) {
            const container = messagesContainerRef.current;
            if (container) {
                const { scrollHeight, clientHeight, scrollTop } = container;
                const isAtBottom = scrollHeight - clientHeight - scrollTop < 10;

                if (isAtBottom) {
                    scrollToBottom();
                }
            }
        }
    }, [messages]);

    const handleReply = (message) => {
        setReplyingTo(message);
        inputRef.current?.focus();
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
        event.target.value = null;
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setSelectedFilePreviews(prev => prev.filter((_, i) => i !== index));
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const handleFileClick = (file) => {
        if (file.fileType === 'image') {
            setEnlargedFile(file);
        } else {
            // For non-image files, trigger download directly
            if (file.url) {
                const link = document.createElement('a');
                link.href = file.url;
                link.download = file.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                console.error('File URL is missing for download:', file);
            }
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim() && selectedFiles.length === 0 && !recordedAudio) return;

        // If there's a recorded audio, send it along with the message
        if (recordedAudio) {
            const audioFile = new File([recordedAudio.blob], 'voice-message.webm', {
                type: 'audio/webm;codecs=opus'
            });
            Object.defineProperty(audioFile, 'duration', {
                value: recordedAudio.duration,
                writable: false
            });
            sendMessage(
                message.trim() || '🎤 Voice Message', // Add default text for voice messages
                selectedChat.type === 'user' ? selectedChat.id : null,
                selectedChat.type === 'group' ? selectedChat.id : null,
                [audioFile],
                replyingTo?._id
            );
            setRecordedAudio(null);
        } else {
            sendMessage(
                message.trim(),
                selectedChat.type === 'user' ? selectedChat.id : null,
                selectedChat.type === 'group' ? selectedChat.id : null,
                selectedFiles,
                replyingTo?._id
            );
        }
        setMessage('');
        setSelectedFiles([]);
        setSelectedFilePreviews([]);
        setReplyingTo(null);
        inputRef.current?.focus();
    };

    // Add scrollToMessage function
    const scrollToMessage = async (messageId) => {
        const messageElement = messagesContainerRef.current?.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a highlight effect
            messageElement.classList.add('bg-yellow-100');
            setTimeout(() => {
                messageElement.classList.remove('bg-yellow-100');
            }, 2000);
        } else {
            // Message not found in current view, try to load older messages
            const chatId = selectedChat.id; // Simplified - we can use selectedChat.id directly since it's the same for both user and group
            const pagination = chatPagination[chatId];

            // Keep track of attempts to prevent infinite loops
            let attempts = 0;
            const maxAttempts = 5; // Maximum number of attempts to load older messages

            const tryLoadAndScroll = async () => {
                if (attempts >= maxAttempts) {
                    console.log('Max attempts reached to find referenced message');
                    return;
                }

                attempts++;

                // Check if we have more messages to load
                if (pagination?.hasMore && !pagination?.isLoading) {
                    // Store current scroll position
                    const currentScroll = messagesContainerRef.current?.scrollTop;

                    // Generate a new fetch ID
                    const newFetchId = Date.now();
                    useChatStore.getState().currentFetchId = newFetchId;

                    // Load older messages
                    if (selectedChat.type === 'user') {
                        await fetchMessages(currentUser._id, selectedChat.id, 15, pagination.oldestMessageId, newFetchId);
                    } else if (selectedChat.type === 'group') {
                        await fetchGroupMessages(selectedChat.id, 15, pagination.oldestMessageId, newFetchId);
                    }

                    // Wait for messages to be processed and rendered
                    setTimeout(() => {
                        const newMessageElement = messagesContainerRef.current?.querySelector(`[data-message-id="${messageId}"]`);
                        if (newMessageElement) {
                            newMessageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            newMessageElement.classList.add('bg-yellow-100');
                            setTimeout(() => {
                                newMessageElement.classList.remove('bg-yellow-100');
                            }, 2000);
                        } else {
                            // Message still not found, try loading more
                            tryLoadAndScroll();
                        }
                    }, 100); // Small delay to allow DOM to update
                }
            };

            // Start the loading process
            tryLoadAndScroll();
        }
    };

    const handleRecordingComplete = async (audioBlob, audioUrl) => {
        // Create a temporary audio element to get the duration
        const tempAudio = new Audio(audioUrl);

        // Wait for metadata to load to get the duration
        await new Promise((resolve) => {
            tempAudio.addEventListener('loadedmetadata', () => {
                resolve();
            });
            tempAudio.load();
        });


        setRecordedAudio({
            blob: audioBlob,
            url: audioUrl,
            fileName: 'Voice Message',
            fileSize: audioBlob.size,
            fileType: 'audio/webm',
            duration: tempAudio.duration
        });
    };

    const handleSendRecordedAudio = async () => {
        if (!recordedAudio) return;

        try {
            // Create a File object from the blob with the correct MIME type and duration
            const audioFile = new File([recordedAudio.blob], 'voice-message.webm', {
                type: 'audio/webm;codecs=opus'
            });

            // Add duration to the file metadata
            Object.defineProperty(audioFile, 'duration', {
                value: recordedAudio.duration,
                writable: false
            });

            // Send the message with the audio file and any text message
            sendMessage(
                message.trim(), // Include the text message
                selectedChat.type === 'user' ? selectedChat.id : null,
                selectedChat.type === 'group' ? selectedChat.id : null,
                [audioFile]
            );
            setRecordedAudio(null);
            setMessage(''); // Clear the message input
        } catch (error) {
            console.error('Error sending audio message:', error);
        }
    };

    const handleCancelRecordedAudio = () => {
        setRecordedAudio(null);
    };

    const renderMessageContent = (message) => {
        if (message.type === 'text') {
            return <p className="text-gray-800">{message.content}</p>;
        } else if (message.attachments && message.attachments.length > 0) {
            return (
                <div className="grid grid-cols-1 gap-1 mb-1 last:mb-0">
                    {message.attachments.map((attachment, index) => {
                        const attachmentUrl = message.attachmentUrls?.[index];
                        if (!attachmentUrl) return null;

                        // Check if the file is an audio file
                        const isAudio = attachment.contentType?.startsWith('audio/') ||
                            attachment.fileName?.toLowerCase().endsWith('.mp3') ||
                            attachment.fileName?.toLowerCase().endsWith('.wav') ||
                            attachment.fileName?.toLowerCase().endsWith('.ogg') ||
                            attachment.fileName?.toLowerCase().endsWith('.webm');

                        // Check if the file is a video file
                        const isVideo = attachment.contentType?.startsWith('video/') ||
                            attachment.fileName?.toLowerCase().endsWith('.mp4') ||
                            attachment.fileName?.toLowerCase().endsWith('.webm') ||
                            attachment.fileName?.toLowerCase().endsWith('.mov');

                        if (isAudio) {
                            return (
                                <div key={index} className="w-full">
                                    <AudioPlayer
                                        url={attachmentUrl}
                                        fileName={attachment.fileName}
                                        isMyMessage={message.sender === currentUser._id}
                                    />
                                </div>
                            );
                        }

                        if (isVideo) {
                            return (
                                <div key={index} className="w-full">
                                    <VideoPlayer
                                        url={attachmentUrl}
                                        fileName={attachment.fileName}
                                        isMyMessage={message.sender === currentUser._id}
                                    />
                                </div>
                            );
                        }

                        if (attachment.contentType?.startsWith('image/')) {
                            return (
                                <img
                                    key={index}
                                    src={attachmentUrl}
                                    alt={`Shared file ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => handleFileClick({
                                        url: attachmentUrl,
                                        fileType: 'image',
                                        fileName: attachment.fileName,
                                        fileSize: attachment.fileSize,
                                        contentType: attachment.contentType
                                    })}
                                />
                            );
                        }

                        return (
                            <div
                                key={index}
                                className="w-full min-h-24 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex flex-col items-center justify-center p-1 text-center"
                                onClick={() => handleFileClick({
                                    url: attachmentUrl,
                                    fileType: attachment.fileType,
                                    fileName: attachment.fileName,
                                    fileSize: attachment.fileSize,
                                    contentType: attachment.contentType
                                })}
                            >
                                <span className="text-lg mb-1">
                                    {attachment.fileType === 'pdf' && '📄'}
                                    {attachment.fileType === 'document' && '📝'}
                                    {attachment.fileType === 'spreadsheet' && '📊'}
                                    {attachment.fileType === 'video' && '🎥'}
                                    {attachment.fileType === 'other' && '📎'}
                                </span>
                                <p className="text-sm font-medium text-gray-800 truncate w-full px-2">
                                    {attachment.fileName}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(attachment.fileSize / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    // Add new function to group messages by date
    const groupMessagesByDate = (messages) => {
        const groups = [];
        let currentDate = null;

        messages.forEach((message) => {
            const messageDate = new Date(message.createdAt);
            const dateStr = messageDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (dateStr !== currentDate) {
                currentDate = dateStr;
                groups.push({
                    type: 'date',
                    date: messageDate,
                    dateStr: dateStr
                });
            }
            groups.push({
                type: 'message',
                message: message
            });
        });

        return groups;
    };

    // Add new useEffect to handle message seen status updates
    useEffect(() => {
        if (!selectedChat || !currentUser) return;

        const handleMessageSeen = (data) => {
            const { messageId, seenBy } = data;
            // Force a re-render by updating the messages state
            setMessages(state => ({
                messages: state.messages.map(msg =>
                    msg._id === messageId
                        ? { ...msg, seenBy: [...new Set(seenBy)] }
                        : msg
                )
            }));
        };

        const store = useChatStore.getState();
        if (store.socket) {
            store.socket.on('message-seen', handleMessageSeen);
        }

        return () => {
            if (store.socket) {
                store.socket.off('message-seen', handleMessageSeen);
            }
        };
    }, [selectedChat?.id, currentUser?._id]);

    // Update the message rendering to use a memoized value for seen status
    const getMessageSeenStatus = (message) => {
        if (!message.seenBy) return '✓';
        // For 1-1 chat, show double tick if the other user's ID is in seenBy
        if (selectedChat.type === 'user') {
            const otherUserId = message.sender === currentUser._id ? message.receiver : message.sender;
            return message.seenBy.includes(otherUserId) ? '✓✓' : '✓';
        }
        // For group, you may want to show a different logic (e.g., all members seen)
        return message.seenBy.length > 1 ? '✓✓' : '✓';
    };

    if (!selectedChat) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4" />
                    <p>Select a chat to start messaging</p>
                </div>
            </div>
        );
    }

    const currentChatId = selectedChat.type === 'user' ? selectedChat.id : selectedChat.id;
    const pagination = chatPagination[currentChatId] || { hasMore: true, oldestMessageId: null, isLoading: false };

    // Generate skeleton messages for initial loading
    const renderSkeletons = () => {
        const skeletons = [];
        for (let i = 0; i < 5; i++) {
            // Alternate between text and image skeletons
            if (i % 2 === 0) {
                skeletons.push(<MessageSkeleton key={`text-${i}`} isMyMessage={i % 3 === 0} />);
            } else {
                skeletons.push(<ImageMessageSkeleton key={`image-${i}`} isMyMessage={i % 3 === 0} />);
            }
        }
        return skeletons;
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            <div className="p-4 border-b bg-white shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold text-gray-800">{selectedChat.name || 'Select a Chat'}</h2>
                    {unreadMessages[selectedChat?.id] > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {unreadMessages[selectedChat.id]} new
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {isTyping && (
                        <div className="flex items-center text-sm text-gray-500">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span>Typing...</span>
                        </div>
                    )}
                    {selectedChat && !isReadOnly && (
                        <button
                            onClick={() => setShowInfoPanel(!showInfoPanel)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title={selectedChat.type === 'group' ? "Group Info" : "Contact Info"}
                        >
                            <Info className="w-5 h-5 text-gray-600" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal" className="h-full">
                    <Panel defaultSize={75} minSize={60}>
                        <div className="flex-1 flex flex-col h-full">
                            <div
                                ref={messagesContainerRef}
                                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col"
                                onScroll={handleScroll}
                            >
                                {/* Show loading overlay during initial load */}
                                {pagination.isLoading && messages.length === 0 && <LoadingOverlay />}

                                {/* Show skeletons during initial load */}
                                {pagination.isLoading && messages.length === 0 ? (
                                    <div className="space-y-4">
                                        {renderSkeletons()}
                                    </div>
                                ) : (
                                    <>
                                        {/* Load Older Messages Button - Now above first message */}
                                        {pagination.hasMore && (
                                            <div className="flex justify-center mb-4">
                                                <button
                                                    onClick={handleLoadOlderMessages}
                                                    disabled={pagination.isLoading}
                                                    className={cn(
                                                        "flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm",
                                                        pagination.isLoading
                                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                            : "bg-blue-500 text-white hover:bg-blue-600"
                                                    )}
                                                >
                                                    {pagination.isLoading ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                            Loading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronUp className="w-4 h-4 mr-2" />
                                                            Load Older Messages
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {/* New Message Button */}
                                        {showNewMessageButton && (
                                            <div className="sticky bottom-4 w-full flex justify-center pb-2 z-10">
                                                <button
                                                    onClick={() => {
                                                        scrollToBottom();
                                                        setShowNewMessageButton(false);
                                                    }}
                                                    className="flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg bg-green-500 text-white hover:bg-green-600"
                                                >
                                                    <span className="mr-2">New Message</span>
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        {messages.length > 0 && (
                                            <>
                                                {groupMessagesByDate(messages).map((item, index) => {
                                                    if (item.type === 'date') {
                                                        return (
                                                            <div key={`date-${index}`} className="flex justify-center my-4">
                                                                <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                                                    {item.dateStr}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    const msg = item.message;
                                                    const hasText = msg.message && msg.message.trim().length > 0;
                                                    const hasAttachments = msg.attachments && msg.attachments.length > 0;
                                                    const isMyMessage = msg.sender === currentUser._id;

                                                    if (!hasText && !hasAttachments) return null;

                                                    return (
                                                        <div
                                                            key={msg._id}
                                                            data-message-id={msg._id}
                                                            className={cn(
                                                                "flex message-item w-full items-center",
                                                                isReadOnly
                                                                    ? msg.sender === selectedChat.user1Id
                                                                        ? "justify-start"
                                                                        : "justify-end"
                                                                    : isMyMessage
                                                                        ? "justify-end"
                                                                        : "justify-start"
                                                            )}
                                                        >
                                                            {/* Reply button */}
                                                            <div className={cn(
                                                                "flex-shrink-0",
                                                                isReadOnly
                                                                    ? msg.sender === selectedChat.user1Id
                                                                        ? "order-last ml-2"
                                                                        : "order-first mr-2"
                                                                    : isMyMessage
                                                                        ? "order-first mr-2"
                                                                        : "order-last ml-2"
                                                            )}>
                                                                <button
                                                                    onClick={() => handleReply(msg)}
                                                                    className="p-1 rounded-full transition-colors text-gray-500 hover:bg-gray-100"
                                                                    title="Reply"
                                                                >
                                                                    <Reply className={cn(
                                                                        "w-4 h-4",
                                                                        isReadOnly
                                                                            ? msg.sender === selectedChat.user1Id
                                                                                ? ""
                                                                                : "rotate-180"
                                                                            : isMyMessage
                                                                                ? "rotate-180"
                                                                                : ""
                                                                    )} />
                                                                </button>
                                                            </div>

                                                            {/* Message Bubble */}
                                                            <div
                                                                className={cn(
                                                                    "max-w-[70%] min-w-0 rounded-xl p-3 shadow-sm relative",
                                                                    isReadOnly
                                                                        ? msg.sender === selectedChat.user1Id
                                                                            ? "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                                                                            : "bg-blue-500 text-white rounded-br-none"
                                                                        : isMyMessage
                                                                            ? "bg-blue-500 text-white rounded-br-none"
                                                                            : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                                                                )}
                                                            >
                                                                {/* Show sender name for both group chats and monitoring view */}
                                                                {(selectedChat?.type === 'group' || isReadOnly) && (
                                                                    <p className={cn(
                                                                        "text-xs font-semibold mb-1",
                                                                        isReadOnly
                                                                            ? msg.sender === selectedChat.user1Id
                                                                                ? "text-gray-600"
                                                                                : "text-blue-100"
                                                                            : "opacity-90"
                                                                    )}>
                                                                        {allUsers.find(u => u._id === msg.sender)?.agent_name || 'Unknown User'}
                                                                    </p>
                                                                )}

                                                                {msg.replyTo && (
                                                                    <div
                                                                        className={cn(
                                                                            "mb-2 p-2 rounded-lg text-xs cursor-pointer hover:bg-opacity-80 transition-colors",
                                                                            isMyMessage ? "bg-blue-600" : "bg-gray-100"
                                                                        )}
                                                                        onClick={() => scrollToMessage(msg.replyTo._id)}
                                                                    >
                                                                        <p className="font-medium mb-1">
                                                                            Replying to {msg.replyTo.sender === currentUser._id ? 'yourself' : (allUsers.find(u => u._id === msg.replyTo.sender)?.agent_name || 'Unknown')}
                                                                        </p>
                                                                        <div className="opacity-90">
                                                                            {msg.replyTo.message && (
                                                                                <p className="truncate">{msg.replyTo.message}</p>
                                                                            )}
                                                                            {msg.replyTo.attachments && msg.replyTo.attachments.length > 0 && (
                                                                                <div className="flex gap-1 mt-1">
                                                                                    {msg.replyTo.attachments.map((att, index) => (
                                                                                        <div key={index} className="relative w-8 h-8">
                                                                                            {att.fileType === 'image' ? (
                                                                                                <img
                                                                                                    src={msg.replyTo.attachmentUrls?.[index]}
                                                                                                    alt={`Reply attachment ${index + 1}`}
                                                                                                    className="w-full h-full object-cover rounded"
                                                                                                />
                                                                                            ) : (
                                                                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                                                                                                    <span className="text-xs">{att.fileType}</span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {hasText && (
                                                                    <div className="break-all whitespace-pre-wrap overflow-hidden">
                                                                        <p className="text-sm mb-1 last:mb-0 break-words">{msg.message}</p>
                                                                    </div>
                                                                )}

                                                                {hasAttachments && renderMessageContent(msg)}

                                                                <div className="flex items-center justify-end mt-1 space-x-1">
                                                                    <span className={cn(
                                                                        "text-xs",
                                                                        isMyMessage ? "text-blue-100" : "text-gray-500"
                                                                    )}>
                                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                    {isMyMessage && (
                                                                        <span className="text-xs text-blue-100">
                                                                            {getMessageSeenStatus(msg)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input area */}
                            {!isReadOnly && (
                                <div className={cn(
                                    "p-3 border-t bg-white",
                                    pagination.isLoading && messages.length === 0 && "opacity-50 pointer-events-none"
                                )}>
                                    {replyingTo && (
                                        <div className="mb-2 p-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center space-x-2">
                                                <Reply className="w-4 h-4 text-gray-500" />
                                                <div className="text-xs">
                                                    <p className="font-medium text-gray-700">
                                                        Replying to {replyingTo.sender === currentUser._id
                                                            ? 'yourself'
                                                            : (allUsers.find(u => u._id === replyingTo.sender)?.agent_name || 'Unknown')}
                                                    </p>
                                                    <p className="text-gray-500 truncate">{replyingTo.message || (replyingTo.attachments?.length > 0 ? 'File' : '')}</p>
                                                    {replyingTo.attachments && replyingTo.attachments.length > 0 && (
                                                        <div className="flex gap-1 mt-1">
                                                            {replyingTo.attachments.map((att, index) => (
                                                                <div key={index} className="relative w-8 h-8">
                                                                    {att.fileType === 'image' ? (
                                                                        <img
                                                                            src={replyingTo.attachmentUrls?.[index]}
                                                                            alt={`Reply attachment ${index + 1}`}
                                                                            className="w-full h-full object-cover rounded"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                                                                            <span className="text-xs">{att.fileType}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleCancelReply}
                                                className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {/* File Previews */}
                                    {selectedFilePreviews.length > 0 && (
                                        <div className="mb-2 flex flex-wrap gap-2">
                                            {selectedFilePreviews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    {preview.type === 'image' ? (
                                                        <img
                                                            src={preview.url}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-20 h-20 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex flex-col items-center justify-center p-2">
                                                            <span className="text-lg mb-1">
                                                                {preview.type === 'pdf' && '📄'}
                                                                {preview.type === 'document' && '📝'}
                                                                {preview.type === 'spreadsheet' && '📊'}
                                                                {preview.type === 'audio' && '🎵'}
                                                                {preview.type === 'video' && '🎥'}
                                                                {preview.type === 'other' && '📎'}
                                                            </span>
                                                            <p className="text-xs text-center truncate w-full">
                                                                {preview.fileName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {(preview.fileSize / 1024).toFixed(1)} KB
                                                            </p>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemoveFile(index)}
                                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Recorded Audio Preview */}
                                    {recordedAudio && (
                                        <div className="mb-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-xl">🎵</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">Voice Message</p>
                                                        <p className="text-xs text-gray-500">
                                                            {(recordedAudio.fileSize / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleCancelRecordedAudio}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Cancel voice message"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <audio
                                                controls
                                                className="w-full"
                                                src={recordedAudio.url}
                                            >
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div>
                                    )}

                                    <form onSubmit={handleSend} className="flex items-end gap-2">
                                        <div className="flex-1 relative">
                                            <textarea
                                                ref={inputRef}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSend(e);
                                                    }
                                                }}
                                                placeholder="Type a message..."
                                                className="w-full p-2.5 pr-10 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 min-h-[40px] max-h-[100px] text-sm"
                                                rows={1}
                                                disabled={pagination.isLoading && messages.length === 0}
                                                style={{
                                                    height: 'auto',
                                                    overflow: 'hidden'
                                                }}
                                                onInput={(e) => {
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                                                }}
                                            />
                                            <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1">
                                                <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-1.5 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100 transition-colors"
                                                    disabled={pagination.isLoading && messages.length === 0}
                                                    title="Attach files"
                                                >
                                                    <Paperclip className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="*/*"
                                                multiple
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                disabled={pagination.isLoading && messages.length === 0}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={(!message.trim() && selectedFiles.length === 0 && !recordedAudio) || (pagination.isLoading && messages.length === 0)}
                                            className={cn(
                                                "p-2.5 rounded-full transition-colors",
                                                (!message.trim() && selectedFiles.length === 0 && !recordedAudio) || (pagination.isLoading && messages.length === 0)
                                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                    : "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow"
                                            )}
                                            title="Send message"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </Panel>

                    {/* Info Panel */}
                    {showInfoPanel && (
                        selectedChat.type === 'group' ? (
                            <GroupInfoPanel
                                selectedChat={selectedChat}
                                onClose={() => setShowInfoPanel(false)}
                            />
                        ) : (
                            <UserInfoPanel
                                selectedChat={selectedChat}
                                onClose={() => setShowInfoPanel(false)}
                                currentUser={currentUser}
                            />
                        )
                    )}
                </PanelGroup>
            </div>

            {enlargedFile && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-4xl max-h-[90vh]">
                        {enlargedFile.fileType === 'image' ? (
                            <img
                                src={enlargedFile.url}
                                alt="Enlarged file"
                                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            />
                        ) : (
                            <div className="bg-white p-4 rounded-lg">
                                <p className="text-lg font-medium mb-2">{enlargedFile.fileName}</p>
                                <p className="text-sm text-gray-500 mb-4">
                                    {(enlargedFile.fileSize / 1024).toFixed(1)} KB
                                </p>
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = enlargedFile.url;
                                        link.download = enlargedFile.fileName;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                >
                                    Download
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => setEnlargedFile(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWindow; 