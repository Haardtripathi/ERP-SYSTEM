import React, { useState, useRef, useEffect } from 'react';
import useChatStore from '../../store/chatStore';
import { Send, Users, Loader2, Image as ImageIcon, XCircle, X, ChevronUp, ChevronDown, Reply } from 'lucide-react';
import { cn } from "@/lib/utils";

const ChatWindow = ({ isReadOnly = false, disableRealtime = false, users = [] }) => {
    const [message, setMessage] = useState('');
    const [selectedImageFiles, setSelectedImageFiles] = useState([]);
    const [selectedImagePreviews, setSelectedImagePreviews] = useState([]);
    const [enlargedImage, setEnlargedImage] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const isInitialLoadRef = useRef(true);
    const isAtBottomRef = useRef(true);
    const [showNewMessageButton, setShowNewMessageButton] = useState(false);

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
        users: storeUsers
    } = useChatStore();

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

    // Update image preview effect
    useEffect(() => {
        if (selectedImageFiles.length === 0) {
            setSelectedImagePreviews([]);
            return;
        }

        const newPreviews = [];
        const processFile = async (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result);
                };
                reader.readAsDataURL(file);
            });
        };

        const processFiles = async () => {
            const previews = await Promise.all(selectedImageFiles.map(processFile));
            setSelectedImagePreviews(previews);
        };

        processFiles();
    }, [selectedImageFiles]);

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

        // Get the correct chat ID based on chat type and monitoring status
        let chatId;
        if (selectedChat.type === 'user') {
            // In monitoring view, we need to use both user IDs
            if (isReadOnly) {
                // For monitoring view, we need to get the other user's ID from the messages
                const firstMessage = messages[0];
                if (firstMessage) {
                    chatId = firstMessage.sender === selectedChat.id ? firstMessage.receiver : firstMessage.sender;
                }
            } else {
                chatId = selectedChat.id;
            }
        } else {
            chatId = selectedChat.id;
        }

        const pagination = chatPagination[chatId];

        if (pagination?.hasMore && !pagination?.isLoading) {
            if (selectedChat.type === 'user') {
                if (isReadOnly) {
                    // For monitoring view, use both user IDs
                    const firstMessage = messages[0];
                    if (firstMessage) {
                        const user1Id = firstMessage.sender;
                        const user2Id = firstMessage.receiver;
                        fetchMessages(user1Id, user2Id, 15, pagination.oldestMessageId);
                    }
                } else {
                    fetchMessages(currentUser._id, selectedChat.id, 15, pagination.oldestMessageId);
                }
            } else if (selectedChat.type === 'group') {
                fetchGroupMessages(selectedChat.id, 15, pagination.oldestMessageId);
            }
        }

        // After messages are loaded (which triggers a re-render),
        // scroll to the message that was previously at the top.
        // This will bring the newly loaded messages into view above it.
        setTimeout(() => {
            if (container && oldestDisplayedMessageId) {
                const previouslyOldestMessageElement = container.querySelector(`[data-message-id="${oldestDisplayedMessageId}"]`);
                if (previouslyOldestMessageElement) {
                    previouslyOldestMessageElement.scrollIntoView({
                        behavior: 'auto',
                        block: 'start' // Scroll so the start of the element is at the top of the container
                    });
                }
            }
        }, 50); // Small timeout to allow DOM to render new messages
    };

    const handleReply = (message) => {
        setReplyingTo(message);
        inputRef.current?.focus();
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim() && selectedImageFiles.length === 0) return;

        sendMessage(
            message.trim(),
            selectedChat.type === 'user' ? selectedChat.id : null,
            selectedChat.type === 'group' ? selectedChat.id : null,
            selectedImageFiles,
            replyingTo?._id
        );
        setMessage('');
        setSelectedImageFiles([]);
        setSelectedImagePreviews([]);
        setReplyingTo(null);
        inputRef.current?.focus();
    };

    const handleImageSelect = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            setSelectedImageFiles(prev => [...prev, ...files]);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
        event.target.value = null;
    };

    const handleRemoveImage = (index) => {
        setSelectedImageFiles(prev => prev.filter((_, i) => i !== index));
        setSelectedImagePreviews(prev => prev.filter((_, i) => i !== index));
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const handleImageClick = (imageUrl) => {
        setEnlargedImage(imageUrl);
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
            const chatId = selectedChat.type === 'user' ? selectedChat.id : selectedChat.id;
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

                    // Load older messages
                    if (selectedChat.type === 'user') {
                        await fetchMessages(currentUser._id, selectedChat.id, 15, pagination.oldestMessageId);
                    } else if (selectedChat.type === 'group') {
                        await fetchGroupMessages(selectedChat.id, 15, pagination.oldestMessageId);
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
            <div className="p-4 border-b bg-white shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800">{selectedChat.name || 'Select a Chat'}</h2>
                {isTyping && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>Typing...</span>
                    </div>
                )}
            </div>

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

                        {messages.map((msg) => {
                            const hasText = msg.message && msg.message.trim().length > 0;
                            const hasImages = msg.imageUrls && msg.imageUrls.length > 0;
                            const isMyMessage = msg.sender === currentUser._id;

                            if (!hasText && !hasImages) return null;

                            return (
                                <div
                                    key={msg._id}
                                    className={cn(
                                        "flex message-item w-full items-center",
                                        // In monitoring view, use the first user's ID as reference for alignment
                                        isReadOnly
                                            ? msg.sender === selectedChat.user1Id
                                                ? "justify-start"
                                                : "justify-end"
                                            : isMyMessage
                                                ? "justify-end"
                                                : "justify-start"
                                    )}
                                    data-message-id={msg._id}
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
                                                    {msg.replyTo.images && msg.replyTo.images.length > 0 && (
                                                        <div className="flex gap-1 mt-1">
                                                            {msg.replyTo.images.map((img, index) => (
                                                                <div key={index} className="relative w-8 h-8">
                                                                    <img
                                                                        src={msg.replyTo.imageUrls?.[index]}
                                                                        alt={`Reply image ${index + 1}`}
                                                                        className="w-full h-full object-cover rounded"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {hasImages && (
                                            <div className="grid grid-cols-2 gap-2 mb-2 last:mb-0">
                                                {msg.imageUrls.map((imageUrl, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Shared image ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => handleImageClick(imageUrl)}
                                                            onError={(e) => {
                                                                console.error('ChatWindow: Image loading error:', {
                                                                    src: e.target.src,
                                                                    messageId: msg._id,
                                                                    imageIndex: index,
                                                                    hasImageBlob: !!msg.imageBlobs?.[index],
                                                                    imageUrl: imageUrl,
                                                                    retryCount: msg.imageRetryCount?.[index] || 0
                                                                });

                                                                if (msg.imageBlobs?.[index] && (!msg.imageRetryCount?.[index] || msg.imageRetryCount[index] < 2)) {
                                                                    try {
                                                                        if (imageUrl && imageUrl.startsWith('blob:')) {
                                                                            URL.revokeObjectURL(imageUrl);
                                                                        }

                                                                        const newUrl = URL.createObjectURL(msg.imageBlobs[index]);
                                                                        e.target.src = newUrl;

                                                                        const updatedMessages = messages.map(m =>
                                                                            m._id === msg._id ? {
                                                                                ...m,
                                                                                imageUrls: m.imageUrls.map((url, i) => i === index ? newUrl : url),
                                                                                imageRetryCount: {
                                                                                    ...m.imageRetryCount,
                                                                                    [index]: (m.imageRetryCount?.[index] || 0) + 1
                                                                                }
                                                                            } : m
                                                                        );
                                                                        useChatStore.getState().setMessages(updatedMessages);
                                                                    } catch (error) {
                                                                        console.error('ChatWindow: Error recreating Blob URL:', error);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {hasText && (
                                            <div className="break-all whitespace-pre-wrap overflow-hidden">
                                                <p className="text-sm mb-1 last:mb-0 break-words">{msg.message}</p>
                                            </div>
                                        )}

                                        <span className={cn(
                                            "text-xs mt-1 block",
                                            isMyMessage ? "text-blue-100" : "text-gray-500"
                                        )}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {enlargedImage && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img
                            src={enlargedImage}
                            alt="Enlarged image"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                        <button
                            onClick={() => setEnlargedImage(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

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
                                    <p className="text-gray-500 truncate">{replyingTo.message || (replyingTo.imageUrls?.length > 0 ? 'Image' : '')}</p>
                                    {replyingTo.imageUrls && replyingTo.imageUrls.length > 0 && (
                                        <div className="flex gap-1 mt-1">
                                            {replyingTo.imageUrls.map((url, index) => (
                                                <div key={index} className="relative w-8 h-8">
                                                    <img
                                                        src={url}
                                                        alt={`Reply image ${index + 1}`}
                                                        className="w-full h-full object-cover rounded"
                                                    />
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

                    {/* Image Previews */}
                    {selectedImagePreviews.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                            {selectedImagePreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
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
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute right-1.5 bottom-1.5 p-1.5 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100 transition-colors"
                                disabled={pagination.isLoading && messages.length === 0}
                                title="Attach images"
                            >
                                <ImageIcon className="w-4 h-4" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                                disabled={pagination.isLoading && messages.length === 0}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={(!message.trim() && selectedImageFiles.length === 0) || (pagination.isLoading && messages.length === 0)}
                            className={cn(
                                "p-2.5 rounded-full transition-colors",
                                (!message.trim() && selectedImageFiles.length === 0) || (pagination.isLoading && messages.length === 0)
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
    );
};

export default ChatWindow; 