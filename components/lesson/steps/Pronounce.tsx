'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, Square, Play, Loader2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { PronounceStep, StepComponentProps } from '@/lib/lesson-runner/types';
import {
  AudioRecorder,
  requestMicrophonePermission,
  createAudioURL,
  revokeAudioURL,
  checkMicrophoneAvailability,
  type MicAvailability,
} from '@/lib/audio/recording';

/**
 * Pronounce Step Component
 *
 * Allows users to:
 * 1. Listen to reference audio
 * 2. Record their pronunciation (if permission granted)
 * 3. Play back their recording
 * 4. Fall back to "Silent Practice" if recording fails
 * 5. Never dead-ends - always allows Continue
 *
 * Features:
 * - Mic availability detection
 * - Permission error recovery
 * - Silent practice fallback mode
 * - Clear success feedback
 */
export function Pronounce({
  step,
  onAnswer,
  feedback,
  disabled = false,
}: StepComponentProps<PronounceStep>) {
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [micAvailability, setMicAvailability] = useState<MicAvailability | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingURL, setRecordingURL] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [silentPracticeMode, setSilentPracticeMode] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const referenceAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordingAudioRef = useRef<HTMLAudioElement | null>(null);

  const allowRecording = step.allowRecording !== false;
  const allowSkip = step.allowSkip !== false;

  // Check microphone availability and permission on mount
  useEffect(() => {
    if (allowRecording) {
      // First check if mic is available at all
      const availability = checkMicrophoneAvailability();
      setMicAvailability(availability);

      // If available, check permission
      if (availability.available) {
        requestMicrophonePermission().then(setHasPermission);
      } else {
        // Mic not available - automatically enable silent practice
        setSilentPracticeMode(true);
      }
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

    // If no audio URL, use TTS fallback
    if (!step.audioUrl) {
      try {
        const utterance = new SpeechSynthesisUtterance(step.text);
        utterance.lang = step.locale === 'mk' ? 'sr-RS' : 'en-US';
        utterance.rate = 0.85;
        utterance.onend = () => setIsPlayingReference(false);
        utterance.onerror = () => setIsPlayingReference(false);
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('TTS fallback failed:', error);
        setIsPlayingReference(false);
      }
      return;
    }

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
      setHasCompleted(true);

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
    setHasCompleted(true);
    onAnswer({ type: 'PRONOUNCE', skipped: true });
  };

  const handleSilentPractice = () => {
    setHasCompleted(true);
    onAnswer({ type: 'PRONOUNCE', skipped: false }); // Silent practice counts as completed
  };

  const handleTryAgainPermission = async () => {
    setErrorMessage(null);
    const granted = await requestMicrophonePermission();
    setHasPermission(granted);
    if (!granted) {
      setErrorMessage('Microphone permission was denied. You can try silent practice instead.');
    }
  };

  const getBrowserHelpURL = () => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    if (userAgent.includes('Chrome')) {
      return 'https://support.google.com/chrome/answer/2693767';
    } else if (userAgent.includes('Firefox')) {
      return 'https://support.mozilla.org/en-US/kb/how-manage-your-camera-and-microphone-permissions';
    } else if (userAgent.includes('Safari')) {
      return 'https://support.apple.com/guide/safari/websites-ibrwe2159f50/mac';
    }
    return 'https://support.google.com/chrome/answer/2693767'; // Default to Chrome
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
                <span>{step.audioUrl ? 'Listen to pronunciation' : 'Listen (synthesized)'}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Indicator */}
      {hasCompleted && feedback && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-600 dark:text-green-400">
            {feedback.message || 'Great job practicing!'}
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {recordingBlob ? 'Your pronunciation was recorded.' : 'You completed silent practice.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Microphone Availability Error */}
      {allowRecording && micAvailability && !micAvailability.available && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Recording not available</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{micAvailability.message}</p>
            {micAvailability.reason === 'insecure-context' && (
              <p className="text-sm">
                This page needs to be loaded over HTTPS to use the microphone.
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getBrowserHelpURL(), '_blank')}
              className="gap-2 mt-2"
            >
              <span>Browser help</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Recording Section */}
      {allowRecording && micAvailability?.available && !hasCompleted && (
        <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm space-y-4">
          <h4 className="text-sm font-semibold text-foreground">
            {silentPracticeMode ? 'Silent Practice' : 'Record yourself'}
          </h4>

          {/* Permission Denied Error with Try Again */}
          {hasPermission === false && !silentPracticeMode && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Microphone access denied</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>
                  {errorMessage || 'We need microphone permission to record your pronunciation.'}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTryAgainPermission}
                    className="w-full sm:w-auto"
                  >
                    Try again
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getBrowserHelpURL(), '_blank')}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <span>Browser settings help</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Other Errors */}
          {errorMessage && hasPermission !== false && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Silent Practice Mode */}
          {silentPracticeMode ? (
            <div className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Practice saying the phrase out loud, then click below when you&apos;re ready to continue.
                </AlertDescription>
              </Alert>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleSilentPractice}
                disabled={disabled || !!feedback}
                className="w-full"
              >
                <CheckCircle className="h-5 w-5" aria-hidden="true" />
                <span>I said it</span>
              </Button>
            </div>
          ) : (
            /* Recording Controls */
            <div className="flex flex-col gap-3">
              {/* Record Button */}
              {!recordingBlob && (
                <Button
                  variant={isRecording ? 'destructive' : 'secondary'}
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={disabled || !!feedback || hasPermission === false}
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

              {/* Fallback to Silent Practice */}
              {hasPermission === false && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSilentPracticeMode(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Try silent practice instead
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Skip Option */}
      {allowSkip && !feedback && !recordingBlob && !hasCompleted && !silentPracticeMode && (
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
