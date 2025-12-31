/**
 * Audio Recording Utilities
 *
 * Handles microphone permission requests and audio recording
 * using the MediaRecorder API for pronunciation practice.
 */

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export interface RecordingOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
}

export interface MicAvailability {
  available: boolean;
  reason?: 'not-supported' | 'insecure-context' | 'no-devices' | 'unknown';
  message?: string;
}

/**
 * Check if microphone recording is available in the current environment
 */
export function checkMicrophoneAvailability(): MicAvailability {
  // Check if running in a browser environment
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return {
      available: false,
      reason: 'not-supported',
      message: 'Recording is not supported in this environment',
    };
  }

  // Check if mediaDevices API exists
  if (!navigator.mediaDevices) {
    // Likely an insecure context (http instead of https)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      return {
        available: false,
        reason: 'insecure-context',
        message: 'Microphone access requires a secure connection (HTTPS)',
      };
    }

    return {
      available: false,
      reason: 'not-supported',
      message: 'Your browser does not support audio recording',
    };
  }

  // Check if getUserMedia exists
  if (!navigator.mediaDevices.getUserMedia) {
    return {
      available: false,
      reason: 'not-supported',
      message: 'Your browser does not support audio recording',
    };
  }

  return { available: true };
}

/**
 * Request microphone permission from the user
 * Returns true if permission granted, false otherwise
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  // First check if recording is available at all
  const availability = checkMicrophoneAvailability();
  if (!availability.available) {
    console.error('Microphone not available:', availability.message);
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop all tracks immediately after getting permission
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
}

/**
 * Check if microphone permission has been granted
 */
export async function checkMicrophonePermission(): Promise<boolean> {
  try {
    if (!navigator.permissions) return false;

    const result = await navigator.permissions.query({
      name: 'microphone' as PermissionName,
    });
    return result.state === 'granted';
  } catch {
    // Fallback: try to request permission
    return requestMicrophonePermission();
  }
}

/**
 * AudioRecorder Class
 *
 * Manages audio recording lifecycle with MediaRecorder API
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  /**
   * Start recording audio from microphone
   */
  async start(options: RecordingOptions = {}): Promise<void> {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      throw new Error('Already recording');
    }

    try {
      // Get microphone stream
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Determine best supported mime type
      const mimeType =
        options.mimeType ||
        this.getSupportedMimeType();

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: options.audioBitsPerSecond || 128000,
      });

      // Reset chunks
      this.audioChunks = [];

      // Collect audio data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start();
    } catch (error) {
      this.cleanup();
      throw new Error(`Failed to start recording: ${error}`);
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      if (this.mediaRecorder.state === 'inactive') {
        reject(new Error('Recording already stopped'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Pause recording
   */
  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  /**
   * Resume recording
   */
  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  /**
   * Cancel recording without returning audio
   */
  cancel(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  /**
   * Get current recording state
   */
  getState(): RecordingState {
    if (!this.mediaRecorder) return 'idle';
    return this.mediaRecorder.state as RecordingState;
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  /**
   * Get best supported audio mime type
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }
}

/**
 * Create audio URL from blob for playback
 */
export function createAudioURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke audio URL to free memory
 */
export function revokeAudioURL(url: string): void {
  URL.revokeObjectURL(url);
}
