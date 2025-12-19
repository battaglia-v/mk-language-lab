'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, Square, Play, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PronounceStep, StepComponentProps } from '@/lib/lesson-runner/types';
import {
  AudioRecorder,
  requestMicrophonePermission,
  createAudioURL,
  revokeAudioURL,
} from '@/lib/audio/recording';

/**
 * Pronounce Step Component
 *
 * Allows users to:
 * 1. Listen to reference audio
 * 2. Record their pronunciation (if permission granted)
 * 3. Play back their recording
 * 4. Self-assess or skip
 *
 * IMPORTANT: Never dead-ends - always allows Continue/Skip
 */
export function Pronounce({
  step,
  onAnswer,
  feedback,
  disabled = false,
}: StepComponentProps<PronounceStep>) {
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingURL, setRecordingURL] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const referenceAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordingAudioRef = useRef<HTMLAudioElement | null>(null);

  const allowRecording = step.allowRecording !== false;
  const allowSkip = step.allowSkip !== false;

  // Check microphone permission on mount
  useEffect(() => {
    if (allowRecording) {
      requestMicrophonePermission().then(setHasPermission);
    }
  }, [allowRecording]);

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      if (recordingURL) {
        revokeAudioURL(recordingURL);
      }
    };
  }, [recordingURL]);

  const playReferenceAudio = async () => {
    if (isPlayingReference) return;

    setIsPlayingReference(true);

    try {
      if (!referenceAudioRef.current) {
        referenceAudioRef.current = new Audio(step.audioUrl);
      }

      referenceAudioRef.current.onended = () => setIsPlayingReference(false);
      referenceAudioRef.current.onerror = () => {
        setIsPlayingReference(false);
        setErrorMessage('Failed to play audio');
      };

      await referenceAudioRef.current.play();
    } catch (error) {
      console.error('Error playing reference audio:', error);
      setIsPlayingReference(false);
      setErrorMessage('Failed to play audio');
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);

    // Request permission if not yet granted
    if (hasPermission === null || hasPermission === false) {
      const granted = await requestMicrophonePermission();
      setHasPermission(granted);
      if (!granted) {
        setErrorMessage('Microphone permission is required to record');
        return;
      }
    }

    try {
      recorderRef.current = new AudioRecorder();
      await recorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setErrorMessage('Failed to start recording. Please check your microphone.');
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current) return;

    try {
      const blob = await recorderRef.current.stop();
      setRecordingBlob(blob);

      // Create URL for playback
      if (recordingURL) {
        revokeAudioURL(recordingURL);
      }
      const url = createAudioURL(blob);
      setRecordingURL(url);

      setIsRecording(false);

      // Auto-submit the recording as the answer
      onAnswer({ type: 'PRONOUNCE', recordingBlob: blob, skipped: false });
    } catch (error) {
      console.error('Error stopping recording:', error);
      setErrorMessage('Failed to save recording');
      setIsRecording(false);
    }
  };

  const playRecording = async () => {
    if (!recordingURL || isPlayingRecording) return;

    setIsPlayingRecording(true);

    try {
      if (!recordingAudioRef.current) {
        recordingAudioRef.current = new Audio(recordingURL);
      }

      recordingAudioRef.current.onended = () => setIsPlayingRecording(false);
      recordingAudioRef.current.onerror = () => {
        setIsPlayingRecording(false);
        setErrorMessage('Failed to play recording');
      };

      await recordingAudioRef.current.play();
    } catch (error) {
      console.error('Error playing recording:', error);
      setIsPlayingRecording(false);
    }
  };

  const handleSkip = () => {
    onAnswer({ type: 'PRONOUNCE', skipped: true });
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {step.instructions || 'Practice your pronunciation'}
            </h3>
            <p className="mt-2 text-base leading-relaxed text-foreground/90 sm:text-lg">
              {step.text}
            </p>
            {step.phonetic && (
              <p className="mt-2 text-sm text-muted-foreground font-mono">
                [{step.phonetic}]
              </p>
            )}
          </div>

          {/* Reference Audio Button */}
          <Button
            variant="default"
            size="lg"
            onClick={playReferenceAudio}
            disabled={isPlayingReference || disabled}
            className="w-full"
          >
            {isPlayingReference ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                <span>Playing...</span>
              </>
            ) : (
              <>
                <Volume2 className="h-5 w-5" aria-hidden="true" />
                <span>Listen to pronunciation</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Recording Section */}
      {allowRecording && (
        <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm space-y-4">
          <h4 className="text-sm font-semibold text-foreground">
            Record yourself
          </h4>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {hasPermission === false && !errorMessage && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Microphone access is needed to record. {allowSkip && 'You can skip this step if you prefer.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            {/* Record Button */}
            {!recordingBlob && (
              <Button
                variant={isRecording ? 'destructive' : 'secondary'}
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled || !!feedback}
                className="w-full"
              >
                {isRecording ? (
                  <>
                    <Square className="h-5 w-5" aria-hidden="true" />
                    <span>Stop recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" aria-hidden="true" />
                    <span>Start recording</span>
                  </>
                )}
              </Button>
            )}

            {/* Playback Button */}
            {recordingBlob && (
              <Button
                variant="outline"
                size="lg"
                onClick={playRecording}
                disabled={isPlayingRecording || disabled}
                className="w-full"
              >
                {isPlayingRecording ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span>Playing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" aria-hidden="true" />
                    <span>Play your recording</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Skip Option (always available if enabled) */}
      {allowSkip && !feedback && !recordingBlob && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={disabled}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip pronunciation practice
          </Button>
        </div>
      )}
    </div>
  );
}
