import React, { useState, useRef, useEffect } from 'react';
import useChatStore from '../../store/chatStore';
import { Send, Users, Loader2, Image as ImageIcon, XCircle } from 'lucide-react';

const ChatWindow = () => {
    const [message, setMessage] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState(null); // Store the actual file
    const [selectedImagePreview, setSelectedImagePreview] = useState(null); // Store the preview URL
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const {
        messages,
        selectedChat,
        currentUser,
        sendMessage,
        isTyping,
        revokeImageUrl,
        setMessages
    } = useChatStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Effect to create and clean up image preview URL for the input preview
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

        return () => {
            // No need to revoke object URL for data URL preview
        };
    }, [selectedImageFile]);

    // Focus input when chat is selected
    useEffect(() => {
        if (selectedChat) {
            inputRef.current?.focus();
        }
    }, [selectedChat]);

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
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            // Focus input after image selection
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
        event.target.value = null;
    };

    const handleRemoveImage = () => {
        setSelectedImageFile(null);
        setSelectedImagePreview(null);
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

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b bg-white shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800">{selectedChat.name || 'Select a Chat'}</h2>
                {isTyping && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>Typing...</span>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
                {messages.map((msg) => {
                    const hasText = msg.message && msg.message.trim().length > 0;
                    const hasImage = msg.imageUrl;
                    const isMyMessage = msg.sender === currentUser._id;

                    if (!hasText && !hasImage) return null;

                    // Determine sender name (handle cases where user or selectedChat might be null/undefined)
                    let senderName = 'Unknown Sender';
                    if (selectedChat?.type === 'user' && !isMyMessage) {
                        // For direct messages, the other user is the sender if it's not me
                        senderName = selectedChat.name;
                    } else if (selectedChat?.type === 'group') {
                        // For group messages, find the sender's name from the users list
                        const senderUser = useChatStore.getState().users.find(user => user._id === msg.sender);
                        senderName = senderUser ? senderUser.agent_name : 'Unknown Group Member';
                    } else if (isMyMessage) {
                        senderName = 'You';
                    }

                    return (
                        <div
                            key={msg._id}
                            className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-xl p-3 shadow-md ${isMyMessage
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none'
                                    }`}
                            >
                                {/* Display sender name in group chats */}
                                {selectedChat?.type === 'group' && !isMyMessage && (
                                    <p className="text-xs font-semibold mb-1 opacity-90">{senderName}</p>
                                )}

                                {hasImage && (
                                    <div className="relative mb-2 last:mb-0">
                                        <img
                                            src={msg.imageUrl}
                                            alt="Shared image"
                                            className="max-w-full h-auto rounded-lg"
                                            onError={(e) => {
                                                console.error('ChatWindow: Image loading error:', {
                                                    src: e.target.src,
                                                    messageId: msg._id,
                                                    hasImageBlob: !!msg.imageBlob,
                                                    imageUrl: msg.imageUrl,
                                                    retryCount: msg.imageRetryCount || 0
                                                });

                                                // Try to recreate the Blob URL if it's invalid and we haven't exceeded retry limit
                                                if (msg.imageBlob && (!msg.imageRetryCount || msg.imageRetryCount < 2)) {
                                                    try {
                                                        // Revoke the old URL first
                                                        if (msg.imageUrl && msg.imageUrl.startsWith('blob:')) {
                                                            URL.revokeObjectURL(msg.imageUrl);
                                                        }

                                                        const newUrl = URL.createObjectURL(msg.imageBlob);
                                                        console.log('ChatWindow: Recreated Blob URL:', newUrl);
                                                        e.target.src = newUrl;

                                                        // Update the message with the new URL and increment retry count
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
                                                } else {
                                                    console.error('ChatWindow: Max retries reached or no image blob available');
                                                }
                                            }}
                                            onLoad={(e) => {
                                                console.log('ChatWindow: Image loaded successfully:', {
                                                    src: e.target.src,
                                                    messageId: msg._id,
                                                    naturalWidth: e.target.naturalWidth,
                                                    naturalHeight: e.target.naturalHeight
                                                });
                                            }}
                                        />
                                    </div>
                                )}
                                {hasText && <p className="text-sm mb-1 last:mb-0 break-words">{msg.message}</p>}

                                <span className={`text-xs mt-1 block ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-4 border-t bg-gray-50 flex flex-col shadow-inner">
                {/* Image Preview */}
                {selectedImagePreview && (
                    <div className="mb-3 p-3 border border-gray-300 rounded-lg bg-white flex items-center justify-between shadow-sm">
                        <div className="flex items-center space-x-2">
                            <img src={selectedImagePreview} alt="Image preview" className="h-10 w-10 object-cover rounded" />
                            <span className="text-sm text-gray-700">{selectedImageFile?.name}</span>
                        </div>
                        <button type="button" onClick={handleRemoveImage} className="text-gray-500 hover:text-gray-700">
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="flex items-center space-x-3">
                    <label htmlFor="image-upload" className="p-3 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 cursor-pointer transition-colors flex-shrink-0">
                        <ImageIcon className="w-5 h-5" />
                        <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    </label>
                    <div className="flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>
                    <button
                        type="submit"
                        className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex-shrink-0"
                        disabled={!message.trim() && !selectedImageFile}
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow; 