import React, { useState, useRef, useEffect } from 'react';
import { X, Play, AlertCircle } from 'lucide-react';

const VideoPlayer = ({ url, fileName, isMyMessage }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorDetails, setErrorDetails] = useState(null);
    const videoRef = useRef(null);
    const loadTimeoutRef = useRef(null);

    // Reset error state when URL changes
    useEffect(() => {
        setVideoError(false);
        setIsLoading(true);
        setErrorDetails(null);

        // Clear any existing timeout
        if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
        }

        // Validate URL before attempting to load
        if (url) {
            console.log('VideoPlayer - URL validation:', {
                url: url,
                urlType: url.startsWith('blob:') ? 'blob' : 'other',
                urlLength: url.length,
                fileName: fileName
            });

            // For blob URLs, just check if they're properly formatted
            // Don't use fetch validation as it can cause issues with blob URLs
            if (url.startsWith('blob:')) {
                // Basic blob URL format validation
                const blobUrlPattern = /^blob:https?:\/\/[^/]+\/[a-f0-9-]+$/;
                if (!blobUrlPattern.test(url)) {
                    console.error('VideoPlayer - Invalid blob URL format:', url);
                    setErrorDetails('Invalid video URL format');
                    setVideoError(true);
                }
            } else if (!url.startsWith('http') && !url.startsWith('data:')) {
                console.error('VideoPlayer - Unsupported URL type:', url);
                setErrorDetails('Unsupported video URL type');
                setVideoError(true);
            }

            // Set a timeout to detect if video loading takes too long
            loadTimeoutRef.current = setTimeout(() => {
                if (isLoading) {
                    console.warn('VideoPlayer - Video loading timeout:', { url, fileName });
                    setErrorDetails('Video loading timeout');
                    setVideoError(true);
                    setIsLoading(false);
                }
            }, 10000); // 10 second timeout
        }

        return () => {
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
            }
        };
    }, [url, fileName]);

    const handlePlay = () => {
        if (url && !videoError) {
            console.log('VideoPlayer - Attempting to play video:', { url, fileName });
            setIsPlaying(true);
        } else {
            console.warn('VideoPlayer - Cannot play video:', {
                hasUrl: !!url,
                hasError: videoError,
                errorDetails
            });
        }
    };

    const handleClose = () => {
        setIsPlaying(false);
    };

    const handleVideoError = (e) => {
        const error = e.nativeEvent || e;
        const errorCode = error.target?.error?.code;
        const errorMessage = error.target?.error?.message || 'Unknown video error';

        console.error('VideoPlayer - Detailed error info:', {
            errorCode,
            errorMessage,
            url: url,
            fileName: fileName,
            isBlobUrl: url?.startsWith('blob:'),
            videoElement: error.target,
            event: e
        });

        // Clear the loading timeout
        if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
        }

        setErrorDetails(`Error ${errorCode}: ${errorMessage}`);
        setVideoError(true);
        setIsLoading(false);
    };

    const handleVideoLoad = () => {
        console.log('VideoPlayer - Video loaded successfully:', { url, fileName });

        // Clear the loading timeout
        if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
        }

        setIsLoading(false);
        setVideoError(false);
        setErrorDetails(null);
    };

    const handleVideoLoadStart = () => {
        console.log('VideoPlayer - Video load started:', { url, fileName });
        setIsLoading(true);
    };

    // This is the thumbnail view shown in the chat or info panel
    const renderThumbnail = () => (
        <div
            className={`relative w-full h-48 rounded-lg overflow-hidden cursor-pointer group ${isMyMessage ? 'bg-blue-100' : 'bg-gray-100'}`}
            onClick={handlePlay}
        >
            <div className="w-full h-full bg-black flex items-center justify-center">
                {!videoError ? (
                    <video
                        src={url}
                        ref={videoRef}
                        muted
                        preload="metadata"
                        className="w-full h-full object-cover"
                        onLoadedMetadata={() => {
                            if (videoRef.current) {
                                videoRef.current.currentTime = 0.1;
                            }
                            handleVideoLoad();
                        }}
                        onError={handleVideoError}
                        onLoadStart={handleVideoLoadStart}
                        onAbort={(e) => console.warn('VideoPlayer - Video load aborted:', e)}
                        onStalled={(e) => console.warn('VideoPlayer - Video stalled:', e)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                        {errorDetails && (
                            <div className="absolute bottom-2 left-2 right-2 text-xs text-red-400 bg-black bg-opacity-50 p-1 rounded">
                                {errorDetails}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {!videoError && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                    <Play size={48} className="text-white" />
                </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <p className="text-white text-sm truncate">{fileName}</p>
            </div>
        </div>
    );

    // This is the full-screen modal view
    const renderModalPlayer = () => (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-2 right-2 z-10">
                    <button
                        onClick={handleClose}
                        className="text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}> {/* 16:9 aspect ratio */}
                    {!videoError ? (
                        <video
                            src={url}
                            className="absolute top-0 left-0 w-full h-full"
                            controls
                            autoPlay
                            playsInline
                            preload="auto"
                            onError={handleVideoError}
                            onLoadedData={handleVideoLoad}
                            onLoadStart={handleVideoLoadStart}
                            onAbort={(e) => console.warn('VideoPlayer - Modal video load aborted:', e)}
                            onStalled={(e) => console.warn('VideoPlayer - Modal video stalled:', e)}
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800">
                            <div className="text-center text-white">
                                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                                <p className="text-lg font-semibold mb-2">Video Error</p>
                                <p className="text-sm opacity-80 mb-2">Unable to load video</p>
                                {errorDetails && (
                                    <p className="text-xs opacity-60 mb-4 max-w-md break-words">
                                        {errorDetails}
                                    </p>
                                )}
                                <button
                                    onClick={handleClose}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-black text-white">
                    <p className="font-semibold">{fileName}</p>
                </div>
            </div>
        </div>
    );

    if (!url) {
        return (
            <div className={`relative w-full h-48 rounded-lg overflow-hidden flex items-center justify-center ${isMyMessage ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="ml-2 text-red-500 text-sm">Video URL is missing.</p>
            </div>
        );
    }

    return isPlaying ? renderModalPlayer() : renderThumbnail();
};

export default VideoPlayer; 