import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { Audio, type AVPlaybackStatus } from 'expo-av';

type AudioStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'error';

type UseAudioPromptOptions = {
  audioId?: string;
  cardId?: string;
  audioUrl?: string | null;
};

const CACHE_DIR_NAME = 'practice-audio-cache';

export function useAudioPrompt({ audioId, cardId, audioUrl }: UseAudioPromptOptions) {
  const [status, setStatus] = useState<AudioStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const cacheDir = useMemo(() => {
    const base = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';
    return `${base}${CACHE_DIR_NAME}`;
  }, []);
  const cacheKey = audioId ?? cardId;
  const hasAudio = Boolean(cacheKey && audioUrl);

  const unloadCurrentSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {
        // ignore
      }
      soundRef.current = null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function prepare() {
      if (!hasAudio || !cacheKey || !audioUrl) {
        setStatus('idle');
        return;
      }
      setStatus('loading');
      setErrorMessage(null);
      try {
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true }).catch(() => undefined);
        const targetPath = `${cacheDir}/${cacheKey}.mp3`;
        let fileUri = targetPath;
        const existing = await FileSystem.getInfoAsync(targetPath);
        if (!existing.exists) {
          const download = await FileSystem.downloadAsync(audioUrl, targetPath);
          fileUri = download.uri;
        }
        await unloadCurrentSound();
        const { sound } = await Audio.Sound.createAsync(
          { uri: fileUri },
          { shouldPlay: false, isLooping: false }
        );
        if (!isMounted) {
          await sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
        setStatus('ready');
      } catch (error) {
        console.error('[useAudioPrompt] Failed to load audio', error);
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Unable to load audio');
        }
      }
    }

    void prepare();

    return () => {
      isMounted = false;
      void unloadCurrentSound();
    };
  }, [audioUrl, cacheDir, cacheKey, hasAudio, unloadCurrentSound]);

  const play = useCallback(async () => {
    if (!soundRef.current || status === 'loading') return;
    try {
      await soundRef.current.setRateAsync(1, true);
      setStatus('playing');
      await soundRef.current.replayAsync();
      setStatus('ready');
    } catch (error) {
      console.error('[useAudioPrompt] play failed', error);
      setStatus('error');
      setErrorMessage('Playback failed');
    }
  }, [status]);

  const replaySlow = useCallback(async () => {
    if (!soundRef.current || status === 'loading') return;
    try {
      setStatus('playing');
      await soundRef.current.setRateAsync(0.8, true);
      await soundRef.current.replayAsync();
      await soundRef.current.setRateAsync(1, true);
      setStatus('ready');
    } catch (error) {
      console.error('[useAudioPrompt] slow playback failed', error);
      setStatus('error');
      setErrorMessage('Playback failed');
    }
  }, [status]);

  const pause = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      const soundStatus = (await soundRef.current.getStatusAsync()) as AVPlaybackStatus;
      if ('isLoaded' in soundStatus && soundStatus.isLoaded && soundStatus.isPlaying) {
        await soundRef.current.pauseAsync();
      }
      setStatus('ready');
    } catch (error) {
      console.error('[useAudioPrompt] pause failed', error);
    }
  }, []);

  const stop = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      const soundStatus = (await soundRef.current.getStatusAsync()) as AVPlaybackStatus;
      if ('isLoaded' in soundStatus && soundStatus.isLoaded && soundStatus.isPlaying) {
        await soundRef.current.stopAsync();
      }
      setStatus('ready');
    } catch (error) {
      console.error('[useAudioPrompt] stop failed', error);
    }
  }, []);

  return {
    hasAudio,
    isSupported: hasAudio,
    status,
    isLoading: status === 'loading',
    isPlaying: status === 'playing',
    error: errorMessage,
    play,
    replaySlow,
    playSlow: replaySlow,
    pause,
    stop,
  };
}
