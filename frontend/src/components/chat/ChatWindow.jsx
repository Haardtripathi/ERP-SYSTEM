import React, { useState, useRef, useEffect } from 'react';
import useChatStore from '../../store/chatStore';
import { Send, Users, Loader2, Image as ImageIcon, XCircle, X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

const ChatWindow = ({ isReadOnly = false, disableRealtime = false }) => {
    const [message, setMessage] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [selectedImagePreview, setSelectedImagePreview] = useState(null);
    const [enlargedImage, setEnlargedImage] = useState(null);
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
        chatPagination
    } = useChatStore();

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

    useEffect(() => {
        if (!selectedImageFile) {
            setSelectedImagePreview(null);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImagePreview(reader.result);
        };
        reader.readAsDataURL(selectedImageFile);
    }, [selectedImageFile]);

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

        const chatId = selectedChat.type === 'user' ? selectedChat.id : selectedChat.id;
        const pagination = chatPagination[chatId];

        if (pagination?.hasMore && !pagination?.isLoading) {
            if (selectedChat.type === 'user') {
                fetchMessages(currentUser._id, selectedChat.id, 15, pagination.oldestMessageId);
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

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim() && !selectedImageFile) return;

        sendMessage(
            message.trim(),
            selectedChat.type === 'user' ? selectedChat.id : null,
            selectedChat.type === 'group' ? selectedChat.id : null,
            selectedImageFile
        );
        setMessage('');
        setSelectedImageFile(null);
        setSelectedImagePreview(null);
        inputRef.current?.focus();
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            // Focus input after image is selected
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
        event.target.value = null;
    };

    const handleRemoveImage = () => {
        setSelectedImageFile(null);
        setSelectedImagePreview(null);
        // Focus input after removing image
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const handleImageClick = (imageUrl) => {
        setEnlargedImage(imageUrl);
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
                            const hasImage = msg.imageUrl;
                            const isMyMessage = msg.sender === currentUser._id;

                            if (!hasText && !hasImage) return null;

                            let senderName = 'Unknown Sender';
                            if (selectedChat?.type === 'user' && !isMyMessage) {
                                senderName = selectedChat.name;
                            } else if (selectedChat?.type === 'group') {
                                const senderUser = useChatStore.getState().users.find(user => user._id === msg.sender);
                                senderName = senderUser ? senderUser.agent_name : 'Unknown Group Member';
                            } else if (isMyMessage) {
                                senderName = 'You';
                            }

                            return (
                                <div
                                    key={msg._id}
                                    className={cn(
                                        "flex message-item w-full",
                                        isMyMessage ? "justify-end" : "justify-start"
                                    )}
                                    data-message-id={msg._id}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[70%] min-w-0 rounded-xl p-3 shadow-sm",
                                            isMyMessage
                                                ? "bg-blue-500 text-white rounded-br-none"
                                                : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                                        )}
                                    >
                                        {selectedChat?.type === 'group' && !isMyMessage && (
                                            <p className="text-xs font-semibold mb-1 opacity-90">{senderName}</p>
                                        )}

                                        {hasImage && (
                                            <div className="relative mb-2 last:mb-0">
                                                <img
                                                    src={msg.imageUrl}
                                                    alt="Shared image"
                                                    className="max-w-[200px] h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => handleImageClick(msg.imageUrl)}
                                                    onError={(e) => {
                                                        console.error('ChatWindow: Image loading error:', {
                                                            src: e.target.src,
                                                            messageId: msg._id,
                                                            hasImageBlob: !!msg.imageBlob,
                                                            imageUrl: msg.imageUrl,
                                                            retryCount: msg.imageRetryCount || 0
                                                        });

                                                        if (msg.imageBlob && (!msg.imageRetryCount || msg.imageRetryCount < 2)) {
                                                            try {
                                                                if (msg.imageUrl && msg.imageUrl.startsWith('blob:')) {
                                                                    URL.revokeObjectURL(msg.imageUrl);
                                                                }

                                                                const newUrl = URL.createObjectURL(msg.imageBlob);
                                                                e.target.src = newUrl;

                                                                const updatedMessages = messages.map(m =>
                                                                    m._id === msg._id ? {
                                                                        ...m,
                                                                        imageUrl: newUrl,
                                                                        imageRetryCount: (m.imageRetryCount || 0) + 1
                                                                    } : m
                                                                );
                                                                useChatStore.getState().setMessages(updatedMessages);
                                                            } catch (error) {
                                                                console.error('ChatWindow: Error recreating Blob URL:', error);
                                                            }
                                                        }
                                                    }}>
                                                </img>
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
                    {selectedImagePreview && (
                        <div className="mb-2 p-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between shadow-sm">
                            <div className="flex items-center space-x-2">
                                <img
                                    src={selectedImagePreview}
                                    alt="Preview"
                                    className="h-10 w-10 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setEnlargedImage(selectedImagePreview)}
                                />
                                <span className="text-xs text-gray-600">Image selected</span>
                            </div>
                            <button
                                onClick={handleRemoveImage}
                                className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
                                disabled={pagination.isLoading && messages.length === 0}
                            >
                                <X className="w-4 h-4" />
                            </button>
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
                                title="Attach image"
                            >
                                <ImageIcon className="w-4 h-4" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                                disabled={pagination.isLoading && messages.length === 0}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={(!message.trim() && !selectedImageFile) || (pagination.isLoading && messages.length === 0)}
                            className={cn(
                                "p-2.5 rounded-full transition-colors",
                                (!message.trim() && !selectedImageFile) || (pagination.isLoading && messages.length === 0)
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