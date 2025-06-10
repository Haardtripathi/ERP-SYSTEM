import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import useChatStore from '../../store/chatStore';
import { Panel, PanelResizeHandle } from 'react-resizable-panels';

const UserInfoPanel = ({ selectedChat, onClose, currentUser }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [media, setMedia] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingUser, setLoadingUser] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const { getUserInfo, getChatMedia } = useChatStore();

    // Helper function to convert buffer to base64
    const bufferToBase64 = (buffer) => {
        if (!buffer) return '';
        if (typeof buffer === 'string') return buffer;
        if (buffer.data && Array.isArray(buffer.data)) {
            // Process the array in chunks to avoid stack overflow
            const chunkSize = 1024;
            let result = '';
            for (let i = 0; i < buffer.data.length; i += chunkSize) {
                const chunk = buffer.data.slice(i, i + chunkSize);
                result += String.fromCharCode.apply(null, chunk);
            }
            return btoa(result);
        }
        return '';
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!selectedChat) return;

            try {
                setLoadingUser(true);
                setError(null);
                console.log('Fetching user info for:', selectedChat.id);
                const data = await getUserInfo(selectedChat.id);
                console.log('User info response:', data);
                setUserInfo(data);
            } catch (error) {
                console.error('Error fetching user info:', error);
                setError('Failed to load user information');
            } finally {
                setLoadingUser(false);
            }
        };

        const fetchMedia = async () => {
            if (!selectedChat || !currentUser) return;

            try {
                setLoading(true);
                setError(null);
                console.log('Fetching media with params:', {
                    userId1: currentUser._id,
                    userId2: selectedChat.id,
                    page: currentPage,
                    limit: 12
                });
                const data = await getChatMedia(currentUser._id, selectedChat.id, currentPage, 12);
                console.log('Media response:', data);

                if (data && data.media) {
                    const processedMedia = data.media.map(item => ({
                        ...item,
                        base64Data: bufferToBase64(item.data)
                    }));

                    // For first page, replace media. For subsequent pages, prepend to maintain newest-first order.
                    setMedia(prevMedia =>
                        currentPage === 1 ? processedMedia : [...processedMedia, ...prevMedia]
                    );

                    if (data.pagination) {
                        setTotalPages(data.pagination.totalPages || 1);
                        const receivedHasMore = data.pagination.hasMore || false;
                        setHasMore(receivedHasMore);
                        console.log('Frontend received hasMore:', receivedHasMore);
                    } else {
                        console.warn('Unexpected media response format: pagination data missing or malformed', data);
                        setTotalPages(1);
                        setHasMore(false);
                        console.log('Frontend set hasMore to false due to missing pagination.');
                    }
                } else {
                    console.warn('Unexpected media response format: media data missing', data);
                    setMedia([]);
                    setTotalPages(1);
                    setHasMore(false);
                    console.log('Frontend set hasMore to false due to missing media.');
                }
            } catch (error) {
                console.error('Error fetching media:', error);
                setError('Failed to load media');
                setMedia([]);
                setTotalPages(1);
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
        fetchMedia();
    }, [selectedChat, currentUser, currentPage, getUserInfo, getChatMedia]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            setCurrentPage(prev => prev + 1);
        }
    };

    if (!selectedChat) return null;

    return (
        <>
            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors" />
            <Panel
                defaultSize={25}
                minSize={20}
                maxSize={40}
                className="h-full bg-white border-l flex flex-col"
            >
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Contact Info</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b">
                    {loadingUser ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-4">{error}</div>
                    ) : userInfo ? (
                        <>
                            <div className="flex flex-col items-center mb-4">
                                {userInfo.photo ? (
                                    <img
                                        src={`data:${userInfo.photo.contentType};base64,${bufferToBase64(userInfo.photo.data)}`}
                                        alt={userInfo.agent_name}
                                        className="w-24 h-24 rounded-full object-cover mb-2"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                                        <span className="text-2xl text-gray-500">
                                            {userInfo.agent_name?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-lg font-semibold">{userInfo.agent_name || 'Unknown User'}</h3>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-sm">{userInfo.email || 'Not available'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-sm">{userInfo.phone_number || 'Not available'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="text-sm">{userInfo.address || 'Not available'}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-gray-500 text-center py-4">No user information available</div>
                    )}
                </div>

                {/* Media Gallery */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold flex items-center">
                            <ImageIcon className="w-5 h-5 mr-2" />
                            Media, Links, and Docs
                        </h3>
                    </div>

                    {loading && media.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-4">{error}</div>
                    ) : media.length === 0 ? (
                        <div className="text-gray-500 text-center py-4">No media shared yet</div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="grid grid-cols-3 gap-2">
                                    {media.map((item) => (
                                        <div
                                            key={item.id}
                                            className="aspect-square relative cursor-pointer group"
                                            onClick={() => handleImageClick(item)}
                                        >
                                            <img
                                                src={`data:${item.contentType};base64,${item.base64Data}`}
                                                alt="Shared media"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                <span className="text-white text-xs">{new Date(item.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Load More Button */}
                            {hasMore && (
                                <div className="p-4 border-t">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        className={cn(
                                            "w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                                            loading
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-blue-500 text-white hover:bg-blue-600"
                                        )}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Loading...
                                            </div>
                                        ) : (
                                            "Load More"
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Panel>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img
                            src={`data:${selectedImage.contentType};base64,${selectedImage.base64Data}`}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                        <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-2 rounded-lg text-sm">
                            <p>Sent by {selectedImage.sender}</p>
                            <p>{new Date(selectedImage.timestamp).toLocaleString()}</p>
                        </div>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserInfoPanel; 