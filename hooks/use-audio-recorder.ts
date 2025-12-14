'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingState = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error';

export interface AudioRecorderResult {
  /** Current recording state */
  state: RecordingState;
  /** Recorded audio blob (available after recording stops) */
  audioBlob: Blob | null;
  /** URL for playing the recorded audio */
  audioUrl: string | null;
  /** Recording duration in seconds */
  duration: number;
  /** Error message if state is 'error' */
  error: string | null;
  /** Whether the browser supports audio recording */
  isSupported: boolean;
  /** Start recording */
  startRecording: () => Promise<void>;
  /** Stop recording */
  stopRecording: () => void;
  /** Reset to idle state and clear recording */
  reset: () => void;
}

interface UseAudioRecorderOptions {
  /** Maximum recording duration in seconds (default: 5) */
  maxDuration?: number;
  /** Audio MIME type (default: 'audio/webm') */
  mimeType?: string;
  /** Callback when recording starts */
  onStart?: () => void;
  /** Callback when recording stops with the blob */
  onStop?: (blob: Blob, duration: number) => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

/**
 * Hook for recording audio using MediaRecorder API
 * 
 * Features:
 * - Browser support detection
 * - Automatic stop after max duration
 * - Cleanup on unmount
 * - Error handling for permissions
 */
export function useAudioRecorder(options: UseAudioRecorderOptions = {}): AudioRecorderResult {
  const {
    maxDuration = 5,
    mimeType = 'audio/webm',
    onStart,
    onStop,
    onError,
  } = options;

  const [state, setState] = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    'mediaDevices' in navigator && 
    'getUserMedia' in navigator.mediaDevices &&
    'MediaRecorder' in window;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore errors during cleanup
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Revoke object URL when audio changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      const errorMsg = 'Audio recording is not supported in this browser';
      setError(errorMsg);
      setState('error');
      onError?.(errorMsg);
      return;
    }

    try {
      setState('requesting');
      setError(null);
      chunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Determine supported MIME type
      let actualMimeType = mimeType;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback options
        const fallbacks = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav'];
        actualMimeType = fallbacks.find(type => MediaRecorder.isTypeSupported(type)) || '';
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: actualMimeType || undefined,
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedDuration = (Date.now() - startTimeRef.current) / 1000;
        setDuration(recordedDuration);

        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: actualMimeType || 'audio/webm' });
          setAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setState('stopped');
          onStop?.(blob, recordedDuration);
        }

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.onerror = () => {
        const errorMsg = 'Recording failed';
        setError(errorMsg);
        setState('error');
        onError?.(errorMsg);
        cleanup();
      };

      // Start recording
      startTimeRef.current = Date.now();
      mediaRecorder.start(100); // Collect data every 100ms
      setState('recording');
      onStart?.();

      // Auto-stop after max duration
      timerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, maxDuration * 1000);

    } catch (err) {
      let errorMsg = 'Failed to access microphone';
      
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            errorMsg = 'Microphone permission denied. Please allow access in your browser settings.';
            break;
          case 'NotFoundError':
          case 'DevicesNotFoundError':
            errorMsg = 'No microphone found. Please connect a microphone and try again.';
            break;
          case 'NotReadableError':
          case 'TrackStartError':
            errorMsg = 'Microphone is in use by another application.';
            break;
          default:
            errorMsg = `Microphone error: ${err.message}`;
        }
      }

      setError(errorMsg);
      setState('error');
      onError?.(errorMsg);
      cleanup();
    }
  }, [isSupported, mimeType, maxDuration, onStart, onStop, onError, cleanup]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setError(null);
    setState('idle');
    chunksRef.current = [];
  }, [cleanup, audioUrl]);

  return {
    state,
    audioBlob,
    audioUrl,
    duration,
    error,
    isSupported,
    startRecording,
    stopRecording,
    reset,
  };
}
