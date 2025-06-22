import React, { useState, useEffect, useRef } from 'react';
import { X, Play, AlertCircle } from 'lucide-react';

const VideoPlayer = ({ url, fileName, isMyMessage }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);

    // Debug logging for state changes
    useEffect(() => {
        console.log('VideoPlayer state:', {
            url,
            videoUrl,
            isLoading,
            error,
            isPlaying,
            hasVideoRef: !!videoRef.current
        });
    }, [url, videoUrl, isLoading, error, isPlaying]);

    useEffect(() => {
        let isMounted = true;

        const loadVideo = async () => {
            if (!url) {
                console.error('No URL provided to VideoPlayer');
                setError('No video URL provided');
                setIsLoading(false);
                return;
            }

            console.log('Starting video load process for URL:', url);
            setIsLoading(true);
            setError(null);
            setVideoUrl(url);

            try {
                // Create thumbnail
                const video = document.createElement('video');
                video.crossOrigin = 'anonymous';
                video.src = url;
                video.currentTime = 0.1;
                video.muted = true; // Mute for thumbnail generation

                video.onloadeddata = () => {
                    if (!isMounted) return;
                    console.log('Thumbnail video loaded successfully');
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const thumbnailUrl = canvas.toDataURL('image/jpeg');
                        setThumbnailUrl(thumbnailUrl);
                    } catch (thumbnailError) {
                        console.warn('Failed to create thumbnail:', thumbnailError);
                    }
                    setIsLoading(false);
                };

                video.onerror = (e) => {
                    if (!isMounted) return;
                    console.error('Error loading video for thumbnail:', e);
                    setIsLoading(false);
                };

                // Set a timeout to prevent infinite loading
                setTimeout(() => {
                    if (isMounted && isLoading) {
                        console.log('Video thumbnail loading timeout, proceeding without thumbnail');
                        setIsLoading(false);
                    }
                }, 5000);

            } catch (error) {
                console.error('Error in loadVideo:', error);
                if (isMounted) {
                    setError(error.message);
                    setIsLoading(false);
                }
            }
        };

        loadVideo();

        return () => {
            isMounted = false;
        };
    }, [url]);

    const handlePlay = () => {
        console.log('Attempting to play video:', {
            hasVideoRef: !!videoRef.current,
            url: videoUrl
        });

        if (!videoUrl) {
            console.error('No video URL available');
            setError('No video URL available');
            return;
        }

        setIsPlaying(true);
    };

    const handleClose = () => {
        console.log('Closing video player');
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
        setIsPlaying(false);
    };

    const handleVideoError = (e) => {
        console.error('Video playback error:', e);
        const video = e.target;
        console.log('Video error details:', {
            error: video.error,
            networkState: video.networkState,
            readyState: video.readyState,
            src: video.src,
            duration: video.duration,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight
        });

        let errorMessage = 'Failed to play video';
        if (video.error) {
            switch (video.error.code) {
                case 1:
                    errorMessage = 'Video loading aborted';
                    break;
                case 2:
                    errorMessage = 'Network error while loading video';
                    break;
                case 3:
                    errorMessage = 'Video decoding error';
                    break;
                case 4:
                    errorMessage = 'Video not supported';
                    break;
            }
        }

        setError(errorMessage);
        handleClose();
    };

    // Add a simple test to check if the URL is a valid blob URL
    const isValidBlobUrl = (url) => {
        return url && url.startsWith('blob:');
    };

    if (isLoading) {
        return (
            <div className={`relative w-full h-48 rounded-lg overflow-hidden ${isMyMessage ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
                <div className="absolute bottom-2 left-2 text-xs text-gray-500">
                    Loading video...
                </div>
                {url && (
                    <div className="absolute top-2 left-2 text-xs text-gray-500">
                        URL: {isValidBlobUrl(url) ? 'Valid blob URL' : 'Invalid URL'}
                    </div>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div className={`relative w-full h-48 rounded-lg overflow-hidden ${isMyMessage ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-500 text-sm">{error}</p>
                        <p className="text-gray-500 text-xs mt-1">{fileName}</p>
                        {url && (
                            <p className="text-gray-400 text-xs mt-1">
                                URL: {url.substring(0, 50)}...
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (isPlaying) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden">
                    <div className="absolute top-2 right-2 z-10">
                        <button
                            onClick={handleClose}
                            className="text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="relative w-full" style={{ paddingTop: '56.25%' }}> {/* 16:9 aspect ratio */}
                        <video
                            ref={videoRef}
                            key={videoUrl}
                            src={videoUrl}
                            className="absolute top-0 left-0 w-full h-full"
                            controls
                            playsInline
                            preload="auto"
                            onError={handleVideoError}
                            onLoadedData={() => {
                                console.log('Video loaded successfully');
                            }}
                            onCanPlay={() => {
                                console.log('Video can play');
                            }}
                            onLoadStart={() => console.log('Video load started')}
                            onWaiting={() => console.log('Video waiting for data')}
                            onStalled={() => console.log('Video stalled')}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative w-full h-48 rounded-lg overflow-hidden cursor-pointer group ${isMyMessage ? 'bg-blue-100' : 'bg-gray-100'}`}
            onClick={handlePlay}
        >
            {thumbnailUrl ? (
                <img
                    src={thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Video</span>
                </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                <Play size={48} className="text-white" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <p className="text-white text-sm truncate">{fileName}</p>
            </div>
            {url && (
                <div className="absolute top-2 left-2 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                    {isValidBlobUrl(url) ? 'Blob URL' : 'Other URL'}
                </div>
            )}
        </div>
    );
};

export default VideoPlayer; 