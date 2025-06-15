import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';

const AudioRecorder = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const timerRef = useRef(null);
    const streamRef = useRef(null);
    const processingTimeoutRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Maximum recording duration in seconds (5 minutes)
    const MAX_RECORDING_DURATION = 300;
    // Warning threshold in seconds (4 minutes)
    const WARNING_THRESHOLD = 240;

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                setIsProcessing(true);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                
                // Set a timeout to handle the case where audio loading takes too long
                processingTimeoutRef.current = setTimeout(() => {
                    onRecordingComplete(audioBlob, audioUrl);
                    setIsProcessing(false);
                    setIsRecording(false);
                    setRecordingTime(0);
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }
                    stream.getTracks().forEach(track => track.stop());
                }, 2000); // 2 second timeout
            };

            recorder.start();
            setIsRecording(true);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    const newTime = prev + 1;
                    // Auto-stop recording if max duration is reached
                    if (newTime >= MAX_RECORDING_DURATION) {
                        stopRecording();
                    }
                    return newTime;
                });
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isNearLimit = recordingTime >= WARNING_THRESHOLD;
    const isAtLimit = recordingTime >= MAX_RECORDING_DURATION;

    return (
        <div className="flex items-center gap-2">
            {isProcessing ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-full">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm text-blue-600">Processing...</span>
                </div>
            ) : isRecording ? (
                <>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
                        isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className={`text-sm ${
                            isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                            {formatTime(recordingTime)}
                            {isNearLimit && !isAtLimit && (
                                <span className="ml-1">
                                    (Max: {formatTime(MAX_RECORDING_DURATION)})
                                </span>
                            )}
                        </span>
                    </div>
                    <button
                        onClick={stopRecording}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <Square className="w-5 h-5" />
                    </button>
                </>
            ) : (
                <button
                    onClick={startRecording}
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <Mic className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

export default AudioRecorder; 