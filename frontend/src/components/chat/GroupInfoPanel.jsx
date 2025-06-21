import React, { useState, useEffect } from 'react';
import { X, Users, Image, Video, File, Edit2, Trash2, Plus, Loader2 } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import axios from '../../axiosInstance';
import { cn } from "@/lib/utils";
import { Panel } from 'react-resizable-panels';
import VideoPlayer from './VideoPlayer';

const GroupInfoPanel = ({ selectedChat, onClose }) => {
    const { currentUser } = useChatStore();
    const { isAdmin } = useAuthStore();
    const [groupDetails, setGroupDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mediaLoading, setMediaLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('members'); // 'members' or 'media'
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [hasMore, setHasMore] = useState(true);

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
        if (selectedChat?.id) {
            fetchGroupDetails();
            fetchGroupMedia();
        }
    }, [selectedChat?.id]);

    const fetchGroupDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`/chat/group/${selectedChat.id}`);
            console.log('Group Details Response:', response.data);
            if (response.data) {
                setGroupDetails(response.data);
                console.log('Group Members:', response.data.members);
                setEditedName(response.data.name || '');
                setSelectedMembers(response.data.members?.map(m => m._id) || []);
            } else {
                setError('Failed to load group details');
            }
        } catch (error) {
            console.error('Error fetching group details:', error);
            setError('Failed to load group details');
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupMedia = async () => {
        try {
            setMediaLoading(true);
            const response = await axios.get(`/chat/group/${selectedChat.id}/media`, {
                params: { page: currentPage, limit: 12 }
            });

            if (response.data && response.data.media) {
                const processedMedia = response.data.media.map(item => {
                    if (item.contentType?.startsWith('image/')) {
                        const url = createMediaBlobUrl(item.data, item.contentType);
                        return {
                            ...item,
                            url: url,
                            fileType: 'image'
                        };
                    }

                    const url = createMediaBlobUrl(item.data, item.contentType);
                    return {
                        ...item,
                        url: url,
                        fileType: getFileType(item)
                    };
                });

                // For first page, replace media. For subsequent pages, append to maintain order
                setMedia(prevMedia =>
                    currentPage === 1 ? processedMedia : [...prevMedia, ...processedMedia]
                );

                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.totalPages || 1);
                    setHasMore(response.data.pagination.hasMore || false);
                } else {
                    setTotalPages(1);
                    setHasMore(false);
                }
            } else {
                setMedia([]);
                setTotalPages(1);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching group media:', error);
            setMedia([]);
            setTotalPages(1);
            setHasMore(false);
        } finally {
            setMediaLoading(false);
        }
    };

    // Add useEffect to fetch media when currentPage changes or tab changes
    useEffect(() => {
        if (selectedChat?.id && activeTab === 'media') {
            fetchGroupMedia();
        }
    }, [selectedChat?.id, currentPage, activeTab]);

    const fetchAvailableUsers = async () => {
        try {
            const response = await axios.get('/chat/users');
            if (response.data && Array.isArray(response.data)) {
                setAvailableUsers(response.data);
            } else {
                console.error('Invalid response format for users:', response.data);
                setAvailableUsers([]);
            }
        } catch (error) {
            console.error('Error fetching available users:', error);
            setAvailableUsers([]);
        }
    };

    const handleEditClick = async () => {
        if (isEditing) {
            try {
                await axios.put(`/chat/group/${selectedChat.id}`, {
                    name: editedName,
                    members: selectedMembers
                });
                await fetchGroupDetails();
                setIsEditing(false);
            } catch (error) {
                console.error('Error updating group:', error);
                setError('Failed to update group');
            }
        } else {
            await fetchAvailableUsers();
            setIsEditing(true);
        }
    };

    const handleMemberToggle = (userId) => {
        setSelectedMembers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const getFileIcon = (fileType) => {
        if (fileType?.startsWith('image/')) return <Image className="w-6 h-6" />;
        if (fileType?.startsWith('video/')) return <Video className="w-6 h-6" />;
        return <File className="w-6 h-6" />;
    };

    const bufferToBase64 = (buffer) => {
        if (!buffer) return '';
        if (typeof buffer === 'string') return buffer;
        if (buffer.data && Array.isArray(buffer.data)) {
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

    const createMediaBlobUrl = (buffer, contentType) => {
        if (!buffer || !contentType) return null;
        try {
            let uint8Array;
            if (buffer.data) {
                if (Array.isArray(buffer.data)) {
                    uint8Array = new Uint8Array(buffer.data);
                } else if (buffer.data instanceof ArrayBuffer) {
                    uint8Array = new Uint8Array(buffer.data);
                } else if (typeof buffer.data === 'string') {
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
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error creating Blob URL for media:', error);
            return null;
        }
    };

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

    const handleMediaClick = (mediaItem) => {
        if (mediaItem.fileType === 'image' || mediaItem.fileType === 'video') {
            setSelectedMedia(mediaItem);
        } else {
            if (mediaItem.url) {
                const link = document.createElement('a');
                link.href = mediaItem.url;
                link.download = mediaItem.fileName || 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !mediaLoading) {
            setCurrentPage(prev => prev + 1);
        }
    };

    // Add tab change handler
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'media') {
            setCurrentPage(1); // Reset to first page when switching to media tab
            setMedia([]); // Clear existing media
        }
    };

    if (loading) {
        return (
            <div className="w-80 border-l bg-white h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-80 border-l bg-white h-full flex flex-col items-center justify-center p-4">
                <div className="text-red-500 mb-2">{error}</div>
                <button
                    onClick={fetchGroupDetails}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!groupDetails) {
        return (
            <div className="w-80 border-l bg-white h-full flex items-center justify-center">
                <div className="text-gray-500">Group not found</div>
            </div>
        );
    }

    return (
        <Panel defaultSize={30} minSize={20} maxSize={40}>
            <div className="h-full flex flex-col bg-white border-l">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Group Info</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Group Name */}
                <div className="p-4 border-b">
                    {isEditing ? (
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Group name"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditClick}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-800">{groupDetails.name}</h3>
                            {isAdmin && (
                                <button
                                    onClick={handleEditClick}
                                    className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-600">Edit Group</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => handleTabChange('members')}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-colors",
                            activeTab === 'members'
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                        )}
                    >
                        Members
                    </button>
                    <button
                        onClick={() => handleTabChange('media')}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-colors",
                            activeTab === 'media'
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                        )}
                    >
                        Media
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'members' ? (
                        <div className="p-4">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-gray-700">Available Users</h4>
                                        <span className="text-xs text-gray-500">
                                            {selectedMembers.length} selected
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {Array.isArray(availableUsers) && availableUsers.map(user => (
                                            <div
                                                key={user._id}
                                                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                                onClick={() => handleMemberToggle(user._id)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative flex-shrink-0 rounded-full overflow-hidden w-10 h-10">
                                                        {user.photo ? (
                                                            <img
                                                                src={`data:${user.photo.contentType};base64,${bufferToBase64(user.photo.data)}`}
                                                                alt={user.agent_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-sm">
                                                                {user.agent_name?.charAt(0)?.toUpperCase() || '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 truncate">
                                                            {user.agent_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.includes(user._id)}
                                                    onChange={() => { }}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-gray-700">Group Members</h4>
                                        <span className="text-xs text-gray-500">
                                            {groupDetails.members?.length || 0} members
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {groupDetails.members?.map((member) => (
                                            <div key={member._id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                                                <div className="relative flex-shrink-0 rounded-full overflow-hidden w-10 h-10">
                                                    {member.photo ? (
                                                        <img
                                                            src={`data:${member.photo.contentType};base64,${bufferToBase64(member.photo.data)}`}
                                                            alt={member.agent_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-sm">
                                                            {member.agent_name?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <p className="font-medium text-gray-800 text-sm truncate">{member.agent_name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Show role for all members */}
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${member.role?.name === 'Admin'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {member.role?.name || 'Member'}
                                                    </span>
                                                    {/* Highlight admin with special badge */}
                                                    {/* {member._id === groupDetails.createdBy._id && (
                                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                                            Group Admin
                                                        </span>
                                                    )} */}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4">
                            {mediaLoading && media.length === 0 ? (
                                <div className="flex items-center justify-center h-32">
                                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                </div>
                            ) : error ? (
                                <div className="text-red-500 text-center py-4">{error}</div>
                            ) : media.length === 0 ? (
                                <div className="text-gray-500 text-center py-4">No media shared yet</div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-3 gap-2">
                                        {media.map((item) => (
                                            <div
                                                key={item.id}
                                                className="relative aspect-square cursor-pointer group"
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
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-2 text-center rounded-lg">
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

                                    {/* Load More Button */}
                                    {hasMore && (
                                        <div className="mt-4">
                                            <button
                                                onClick={handleLoadMore}
                                                disabled={mediaLoading}
                                                className={cn(
                                                    "w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                                                    mediaLoading
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                                )}
                                            >
                                                {mediaLoading ? (
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
                    )}
                </div>
            </div>

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
        </Panel>
    );
};

export default GroupInfoPanel; 