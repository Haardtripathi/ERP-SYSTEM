import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import useChatStore from '../../store/chatStore';
import { Panel, PanelResizeHandle } from 'react-resizable-panels';
import VideoPlayer from './VideoPlayer';

const UserInfoPanel = ({ selectedChat, onClose, currentUser }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [media, setMedia] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingUser, setLoadingUser] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const { getUserInfo, getChatMedia } = useChatStore();

    // Helper function to determine file type (similar to ChatWindow.jsx)
    const getFileType = (file) => {
        const type = file.contentType?.toLowerCase();
        if (type?.startsWith('image/')) return 'image';
        if (type === 'application/pdf') return 'pdf';
        if (type?.includes('spreadsheet') || type?.includes('excel') || type?.includes('csv')) return 'spreadsheet';
        if (type?.includes('document') || type?.includes('word') || type?.includes('text')) return 'document';
        if (type?.startsWith('audio/')) return 'audio';
        if (type?.startsWith('video/')) return 'video';
        return 'other';
    };

    // Helper function to create Blob URL from buffer data
    const createMediaBlobUrl = (buffer, contentType) => {

        if (!buffer || !contentType) return null;
        try {
            // Handle different buffer formats
            let uint8Array;
            if (buffer.data) {
                // If buffer has a data property, use that
                if (Array.isArray(buffer.data)) {
                    uint8Array = new Uint8Array(buffer.data);
                } else if (buffer.data instanceof ArrayBuffer) {
                    uint8Array = new Uint8Array(buffer.data);
                } else if (typeof buffer.data === 'string') {
                    // Handle base64 string data
                    const binaryString = atob(buffer.data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    uint8Array = bytes;
                } else {
                    uint8Array = new Uint8Array(buffer.data);
                }
            } else if (Array.isArray(buffer)) {
                uint8Array = new Uint8Array(buffer);
            } else if (buffer instanceof ArrayBuffer) {
                uint8Array = new Uint8Array(buffer);
            } else if (buffer instanceof Uint8Array) {
                uint8Array = buffer;
            } else if (typeof buffer === 'string') {
                // Handle base64 string data
                const binaryString = atob(buffer);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                uint8Array = bytes;
            } else {
                console.error('Unsupported buffer format in createMediaBlobUrl:', buffer);
                return null;
            }

            if (!uint8Array || uint8Array.length === 0) {
                console.error('Failed to create valid Uint8Array from buffer');
                return null;
            }


            const blob = new Blob([uint8Array], { type: contentType });
            const url = URL.createObjectURL(blob);

            return url;
        } catch (error) {
            console.error('Error creating Blob URL for media:', error);
            return null;
        }
    };

    // Cleanup Blob URLs when component unmounts or selectedMedia changes
    useEffect(() => {
        return () => {
            // Clean up URLs from selectedMedia if it was an image/downloadable file
            if (selectedMedia && selectedMedia.url) {
                URL.revokeObjectURL(selectedMedia.url);
            }
            // Also clean up all Blob URLs generated for the gallery items
            media.forEach(item => {
                if (item.url) URL.revokeObjectURL(item.url);
            });
        };
    }, [selectedMedia, media]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!selectedChat) return;

            try {
                setLoadingUser(true);
                setError(null);

                const data = await getUserInfo(selectedChat.id);

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


                if (data && data.media) {
                    const processedMedia = data.media.map(item => {
                        console.log('Processing media item before URL creation:', {
                            fileName: item.fileName,
                            contentType: item.contentType,
                            hasData: !!item.data,
                            dataType: item.data ? typeof item.data : 'no data',
                            // Log the actual item.data for inspection
                            dataContent: item.data // BE CAREFUL WITH LARGE DATA, ONLY FOR DEBUGGING
                        });

                        // For images, ensure we're handling the data correctly
                        if (item.contentType?.startsWith('image/')) {
                            const url = createMediaBlobUrl(item.data, item.contentType);

                            if (!url) {
                                console.error('Blob URL creation failed for image:', item.fileName);
                            }
                            return {
                                ...item,
                                url: url,
                                fileType: 'image'
                            };
                        }

                        // For other file types
                        const url = createMediaBlobUrl(item.data, item.contentType);

                        return {
                            ...item,
                            url: url,
                            fileType: getFileType(item)
                        };
                    });

                    // For first page, replace media. For subsequent pages, prepend to maintain newest-first order.
                    setMedia(prevMedia =>
                        currentPage === 1 ? processedMedia : [...prevMedia, ...processedMedia]
                    );

                    if (data.pagination) {
                        setTotalPages(data.pagination.totalPages || 1);
                        const receivedHasMore = data.pagination.hasMore || false;
                        setHasMore(receivedHasMore);

                    } else {
                        console.warn('Unexpected media response format: pagination data missing or malformed', data);
                        setTotalPages(1);
                        setHasMore(false);

                    }
                } else {
                    console.warn('Unexpected media response format: media data missing', data);
                    setMedia([]);
                    setTotalPages(1);
                    setHasMore(false);

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

    const handleMediaClick = (mediaItem) => {
        if (mediaItem.fileType === 'image') {
            setSelectedMedia(mediaItem);
        } else if (mediaItem.fileType === 'video') {
            setSelectedMedia(mediaItem);
        } else {
            // For non-image/video files, trigger download directly
            if (mediaItem.url) {
                const link = document.createElement('a');
                link.href = mediaItem.url;
                link.download = mediaItem.fileName || 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                console.error('Cannot download media item: missing URL', mediaItem);
            }
        }
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
                                        src={createMediaBlobUrl(userInfo.photo.data, userInfo.photo.contentType)}
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
                                            className="relative aspect-square cursor-pointer"
                                            onClick={() => handleMediaClick(item)}
                                        >
                                            {item.fileType === 'image' ? (
                                                <img
                                                    src={item.url}
                                                    alt={item.fileName || 'Media'}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : item.fileType === 'video' ? (
                                                <VideoPlayer
                                                    url={item.url}
                                                    fileName={item.fileName}
                                                    isMyMessage={false}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-2 text-center">
                                                    <span className="text-3xl mb-1">
                                                        {item.fileType === 'pdf' && '📄'}
                                                        {item.fileType === 'document' && '📝'}
                                                        {item.fileType === 'spreadsheet' && '📊'}
                                                        {item.fileType === 'audio' && '🎵'}
                                                        {item.fileType === 'video' && '🎥'}
                                                        {item.fileType === 'other' && '📎'}
                                                    </span>
                                                    <p className="text-xs font-medium text-gray-800 truncate w-full px-1">
                                                        {item.fileName || 'File'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {(item.fileSize / 1024).toFixed(1)} KB
                                                    </p>
                                                    <div className="mt-2 text-blue-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download-cloud"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M12 12v9M8 17l4 4 4-4" /></svg>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center text-white text-sm">
                                                <p className="font-semibold mb-1">{item.fileName}</p>
                                                <p className="text-xs">{new Date(item.timestamp).toLocaleDateString()}</p>
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

            {/* Image/Media Preview Modal */}
            {selectedMedia && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-4xl max-h-[90vh]">
                        {selectedMedia.fileType === 'image' ? (
                            <img
                                src={selectedMedia.url}
                                alt={selectedMedia.fileName || "Preview"}
                                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                                onError={(e) => {
                                    console.error('Failed to load image preview:', selectedMedia.fileName);
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : selectedMedia.fileType === 'video' ? (
                            <VideoPlayer
                                url={selectedMedia.url}
                                fileName={selectedMedia.fileName}
                                isMyMessage={false}
                            />
                        ) : (
                            <div className="bg-white p-4 rounded-lg text-center">
                                <span className="text-5xl mb-4 block">
                                    {selectedMedia.fileType === 'pdf' && '📄'}
                                    {selectedMedia.fileType === 'document' && '📝'}
                                    {selectedMedia.fileType === 'spreadsheet' && '📊'}
                                    {selectedMedia.fileType === 'audio' && '🎵'}
                                    {selectedMedia.fileType === 'video' && '🎥'}
                                    {selectedMedia.fileType === 'other' && '📎'}
                                    {!['pdf', 'document', 'spreadsheet', 'audio', 'video', 'other'].includes(selectedMedia.fileType) && '📁'}
                                </span>
                                <p className="text-lg font-medium mb-2">{selectedMedia.fileName || 'File'}</p>
                                <p className="text-sm text-gray-500 mb-4">
                                    {(selectedMedia.fileSize / 1024).toFixed(1)} KB
                                </p>
                                <button
                                    onClick={() => {
                                        if (selectedMedia.url) {
                                            const link = document.createElement('a');
                                            link.href = selectedMedia.url;
                                            link.download = selectedMedia.fileName || 'download';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }
                                        setSelectedMedia(null);
                                    }}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors inline-flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download-cloud mr-2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M12 12v9M8 17l4 4 4-4" /></svg>
                                    Download
                                </button>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-2 rounded-lg text-sm flex justify-between items-center">
                            {selectedMedia.fileName && <p className="truncate">{selectedMedia.fileName}</p>}
                            {selectedMedia.timestamp && <p>{new Date(selectedMedia.timestamp).toLocaleDateString()}</p>}
                        </div>
                        <button
                            onClick={() => {
                                if (selectedMedia.url) {
                                    URL.revokeObjectURL(selectedMedia.url);
                                }
                                setSelectedMedia(null);
                            }}
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