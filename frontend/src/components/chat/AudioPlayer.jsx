import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

const AudioPlayer = ({ url, fileName, isMyMessage }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const retryCountRef = useRef(0);

    // Generate random waveform heights for visualization
    const waveformHeights = Array.from({ length: 20 }, () => 
        Math.floor(Math.random() * 30) + 10
    );

    useEffect(() => {
        console.log('AudioPlayer mounted with URL:', url);
        const audio = audioRef.current;
        if (!audio) return;

        // Reset retry count when URL changes
        retryCountRef.current = 0;

        const handleLoadedMetadata = () => {
            console.log('Audio metadata loaded:', {
                duration: audio.duration,
                readyState: audio.readyState,
                error: audio.error,
                networkState: audio.networkState,
                src: audio.currentSrc
            });
            
            // Try to get duration from the audio element
            let audioDuration = audio.duration;
            
            // If duration is not available from the audio element, try to get it from the URL
            if (!isFinite(audioDuration) || isNaN(audioDuration)) {
                // For recorded audio, we need to wait for the audio to be fully loaded
                audio.addEventListener('canplaythrough', () => {
                    if (isFinite(audio.duration) && !isNaN(audio.duration)) {
                        setDuration(audio.duration);
                    }
                }, { once: true });
            } else {
                setDuration(audioDuration);
            }
            
            setIsLoading(false);
            setError(null);
        };

        const handleTimeUpdate = () => {
            if (isFinite(audio.currentTime) && !isNaN(audio.currentTime)) {
                setCurrentTime(audio.currentTime);
            }
        };

        const handleDurationChange = () => {
            console.log('Duration changed:', audio.duration);
            if (isFinite(audio.duration) && !isNaN(audio.duration)) {
                setDuration(audio.duration);
            }
        };

        const handleEnded = () => {
            console.log('Audio playback ended');
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handleError = (e) => {
            console.error('Error loading audio:', {
                error: audio.error,
                networkState: audio.networkState,
                readyState: audio.readyState,
                src: audio.currentSrc
            });
            
            // Check if it's a blob URL
            const isBlobUrl = url.startsWith('blob:');
            
            if (isBlobUrl && retryCountRef.current < 1) {
                // For blob URLs, try once without CORS
                retryCountRef.current += 1;
                audio.crossOrigin = null;
                audio.load();
            } else {
                // If we've already retried or it's not a blob URL, show the error
                setError('Unable to load audio');
                setIsLoading(false);
            }
        };

        const handleCanPlay = () => {
            console.log('Audio can play:', {
                readyState: audio.readyState,
                networkState: audio.networkState,
                duration: audio.duration
            });
            // Try to get duration again when audio can play
            if (isFinite(audio.duration) && !isNaN(audio.duration)) {
                setDuration(audio.duration);
            }
            setIsLoading(false);
        };

        const handlePlay = () => {
            console.log('Audio started playing');
        };

        const handlePause = () => {
            console.log('Audio paused');
        };

        const handleStalled = () => {
            console.log('Audio stalled');
            setIsLoading(true);
        };

        const handleWaiting = () => {
            console.log('Audio waiting for data');
            setIsLoading(true);
        };

        // Add all event listeners
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('stalled', handleStalled);
        audio.addEventListener('waiting', handleWaiting);

        // Set audio properties
        audio.preload = 'metadata';
        audio.controls = false; // Hide default controls
        
        // Only set crossOrigin for non-blob URLs
        if (!url.startsWith('blob:')) {
            audio.crossOrigin = 'anonymous';
        }

        // Load the audio
        audio.load();

        return () => {
            // Remove all event listeners
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('stalled', handleStalled);
            audio.removeEventListener('waiting', handleWaiting);
        };
    }, [url]);

    const togglePlay = async () => {
        if (!audioRef.current) return;

        try {
            if (isPlaying) {
                await audioRef.current.pause();
            } else {
                // Reset to beginning if we're at the end
                if (currentTime >= duration) {
                    audioRef.current.currentTime = 0;
                }
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Error playing audio:', error);
                        setError(error.message);
                    });
                }
            }
            setIsPlaying(!isPlaying);
        } catch (error) {
            console.error('Error toggling play:', error);
            setError(error.message);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleProgressClick = (e) => {
        if (!audioRef.current || !progressRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * audioRef.current.duration;
        
        // Ensure the new time is within bounds
        if (newTime >= 0 && newTime <= audioRef.current.duration) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    // Add mouse drag functionality
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        handleProgressClick(e);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            handleProgressClick(e);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const formatTime = (time) => {
        if (!isFinite(time) || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg relative ${isMyMessage ? 'bg-blue-500' : 'bg-gray-100'}`}>
            <audio 
                ref={audioRef} 
                src={url} 
                preload="metadata"
                onLoadedMetadata={(e) => {
                    const audio = e.target;
                    if (audio && isFinite(audio.duration) && !isNaN(audio.duration)) {
                        setDuration(audio.duration);
                        setIsLoading(false);
                    }
                }}
                onCanPlay={(e) => {
                    const audio = e.target;
                    if (audio && isFinite(audio.duration) && !isNaN(audio.duration) && duration === 0) {
                        setDuration(audio.duration);
                        setIsLoading(false);
                    }
                }}
                onError={(e) => console.error('Audio element error:', e)}
            />
            
            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                disabled={isLoading || !!error}
                className={`p-2 rounded-full ${isMyMessage ? 'text-white hover:bg-blue-600' : 'text-gray-700 hover:bg-gray-200'} ${(isLoading || error) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : error ? (
                    <span className="text-xs">⚠️</span>
                ) : isPlaying ? (
                    <Pause className="w-5 h-5" />
                ) : (
                    <Play className="w-5 h-5" />
                )}
            </button>

            {/* Waveform Visualization */}
            <div className="flex-1 flex items-center gap-1 h-8">
                {waveformHeights.map((height, index) => (
                    <div
                        key={index}
                        className={`w-1 rounded-full transition-all duration-200 ${
                            isMyMessage ? 'bg-white' : 'bg-blue-500'
                        }`}
                        style={{
                            height: `${height}px`,
                            opacity: isPlaying ? 0.8 : 0.4,
                            transform: isPlaying ? 'scaleY(1.1)' : 'scaleY(1)',
                            animation: isPlaying ? 'waveform 1s ease-in-out infinite' : 'none'
                        }}
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div 
                ref={progressRef}
                className={`absolute bottom-0 left-0 right-0 h-2 cursor-pointer group ${
                    isMyMessage ? 'bg-blue-600/20' : 'bg-gray-200'
                }`}
                onMouseDown={handleMouseDown}
            >
                <div 
                    className={`h-full transition-all duration-100 relative ${
                        isMyMessage ? 'bg-white' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                    {/* Progress handle */}
                    <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transform scale-0 group-hover:scale-100 transition-transform ${
                        isMyMessage ? 'bg-white' : 'bg-blue-500'
                    } shadow-md`} />
                </div>
            </div>

            {/* Time Display */}
            <span className={`text-xs font-medium ${isMyMessage ? 'text-white' : 'text-gray-600'}`}>
                {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume Control */}
            <button
                onClick={toggleMute}
                disabled={isLoading || !!error}
                className={`p-1.5 rounded-full ${isMyMessage ? 'text-white hover:bg-blue-600' : 'text-gray-700 hover:bg-gray-200'} ${(isLoading || error) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                ) : (
                    <Volume2 className="w-4 h-4" />
                )}
            </button>

            {error && (
                <div className="text-xs text-red-500 mt-1">
                    {error}
                </div>
            )}

            <style jsx>{`
                @keyframes waveform {
                    0% { transform: scaleY(1); }
                    50% { transform: scaleY(1.2); }
                    100% { transform: scaleY(1); }
                }

                /* Add hover effect for progress bar */
                .group:hover .h-full {
                    ${isMyMessage ? 'background-color: rgba(255, 255, 255, 0.9);' : 'background-color: rgb(59, 130, 246);'}
                }

                /* Add hover effect for the progress bar background */
                .group:hover {
                    ${isMyMessage ? 'background-color: rgba(37, 99, 235, 0.3);' : 'background-color: rgb(229, 231, 235);'}
                }
            `}</style>
        </div>
    );
};

export default AudioPlayer; 