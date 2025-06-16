import React, { useState, useEffect, useRef } from 'react';
import { X, Play } from 'lucide-react';

const VideoPlayer = ({ url, fileName, isMyMessage }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    // Debug logging for state changes
    useEffect(() => {
        console.log('VideoPlayer state:', {
            url,
            videoSrc,
            isLoading,
            error,
            isVideoReady,
            isPlaying,
            hasVideoRef: !!videoRef.current,
            retryCount
        });
    }, [url, videoSrc, isLoading, error, isVideoReady, isPlaying, retryCount]);

    const createVideoBlob = async (videoUrl) => {
        try {
            console.log('Creating video blob from URL:', videoUrl);
            const response = await fetch(videoUrl);
            if (!response.ok) throw new Error('Failed to fetch video');
            const blob = await response.blob();
            const newUrl = URL.createObjectURL(blob);
            console.log('Created new blob URL:', newUrl);
            return newUrl;
        } catch (error) {
            console.error('Error creating video blob:', error);
            throw error;
        }
    };

    useEffect(() => {
        let isMounted = true;
        let blobUrl = null;

        const loadVideo = async () => {
            if (!url) return;

            console.log('Starting video load process for URL:', url);
            setIsLoading(true);
            setError(null);
            setIsVideoReady(false);

            try {
                // If the URL is already a blob URL, use it directly
                if (url.startsWith('blob:')) {
                    console.log('Using existing blob URL');
                    if (isMounted) {
                        setVideoSrc(url);
                        blobUrl = url;
                    }
                } else {
                    // Create a new blob URL
                    console.log('Creating new blob URL from URL');
                    const newBlobUrl = await createVideoBlob(url);
                    if (isMounted) {
                        setVideoSrc(newBlobUrl);
                        blobUrl = newBlobUrl;
                    }
                }

                // Create thumbnail
                const video = document.createElement('video');
                video.src = blobUrl;
                video.currentTime = 0.1;

                video.onloadeddata = () => {
                    if (!isMounted) return;
                    console.log('Thumbnail video loaded successfully');
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const thumbnailUrl = canvas.toDataURL('image/jpeg');
                    setThumbnailUrl(thumbnailUrl);
                    setIsLoading(false);
                };

                video.onerror = (e) => {
                    if (!isMounted) return;
                    console.error('Error loading video for thumbnail:', e);
                    setIsLoading(false);
                };
            } catch (error) {
                console.error('Error in loadVideo:', error);
                if (isMounted) {
                    setError(error.message);
                    setIsLoading(false);
                    
                    // Retry logic
                    if (retryCount < MAX_RETRIES) {
                        console.log(`Retrying video load (${retryCount + 1}/${MAX_RETRIES})`);
                        setRetryCount(prev => prev + 1);
                    }
                }
            }
        };

        loadVideo();

        return () => {
            isMounted = false;
            if (blobUrl) {
                console.log('Cleaning up blob URL:', blobUrl);
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [url, retryCount]);

    const handlePlay = async () => {
        console.log('Attempting to play video:', {
            hasVideoRef: !!videoRef.current,
            videoSrc,
            isVideoReady
        });

        if (!videoSrc) {
            console.error('No video source available');
            setError('No video source available');
            return;
        }

        try {
            // Ensure we have a valid blob URL
            if (!videoSrc.startsWith('blob:')) {
                const newBlobUrl = await createVideoBlob(videoSrc);
                setVideoSrc(newBlobUrl);
            }
            setIsPlaying(true);
        } catch (error) {
            console.error('Error preparing video for playback:', error);
            setError('Failed to prepare video for playback');
        }
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

    if (isLoading) {
        return (
            <div className={`relative w-full h-48 rounded-lg overflow-hidden ${isMyMessage ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`relative w-full h-48 rounded-lg overflow-hidden ${isMyMessage ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-red-500">{error}</p>
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
                            key={videoSrc}
                            src={videoSrc}
                            className="absolute top-0 left-0 w-full h-full"
                            controls
                            playsInline
                            preload="auto"
                            onError={handleVideoError}
                            onLoadedData={() => {
                                console.log('Video loaded successfully');
                                setIsVideoReady(true);
                            }}
                            onCanPlay={() => {
                                console.log('Video can play');
                                setIsVideoReady(true);
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
        </div>
    );
};

export default VideoPlayer; 