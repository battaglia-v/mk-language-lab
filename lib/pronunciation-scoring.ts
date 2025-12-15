/**
 * Pronunciation Scoring Engine
 * 
 * Provides client-side audio comparison and similarity scoring for
 * pronunciation practice. Uses Web Audio API for waveform analysis.
 * 
 * @see docs/ux-audit/05-pronunciation-practice-ux.md
 * @see docs/ux-audit/09-implementation-plan.md MKLAB-502
 */

/**
 * Scoring result returned by the pronunciation analyzer
 */
export interface PronunciationScore {
  /** Overall similarity percentage (0-100) */
  similarity: number;
  /** Confidence level of the scoring (0-100) */
  confidence: number;
  /** Whether the pronunciation is considered passing (≥70%) */
  passed: boolean;
  /** Whether the pronunciation is excellent (≥90%) */
  excellent: boolean;
  /** Detailed analysis of specific aspects */
  analysis: {
    /** Duration similarity (0-100) - how close the timing is */
    durationScore: number;
    /** Energy/volume pattern similarity (0-100) */
    energyScore: number;
    /** Rhythm/tempo similarity (0-100) */
    rhythmScore: number;
  };
  /** Feedback message key for the user */
  feedbackKey: PronunciationFeedbackKey;
  /** Suggested XP to award based on performance */
  xpReward: number;
}

/**
 * Feedback keys used for localized messages
 */
export type PronunciationFeedbackKey = 
  | 'excellent'
  | 'good'
  | 'almostThere'
  | 'trySlower'
  | 'tryLouder'
  | 'tooShort'
  | 'tooLong'
  | 'needsWork';

/**
 * Audio analysis data extracted from audio samples
 */
interface AudioAnalysisData {
  /** Duration in seconds */
  duration: number;
  /** RMS (root mean square) energy values */
  energyProfile: number[];
  /** Peak amplitude */
  peakAmplitude: number;
  /** Zero crossing rate (indicates noisiness/tonality) */
  zeroCrossingRate: number;
  /** Spectral centroid (brightness of sound) */
  spectralCentroid: number;
  /** Temporal envelope (volume over time) */
  envelope: number[];
}

/**
 * Options for the scoring engine
 */
export interface ScoringOptions {
  /** Minimum acceptable duration ratio (user/reference) */
  minDurationRatio?: number;
  /** Maximum acceptable duration ratio */
  maxDurationRatio?: number;
  /** Passing threshold (0-100) */
  passingThreshold?: number;
  /** Excellent threshold (0-100) */
  excellentThreshold?: number;
  /** Number of segments to divide audio for analysis */
  analysisSegments?: number;
}

const DEFAULT_OPTIONS: Required<ScoringOptions> = {
  minDurationRatio: 0.5,
  maxDurationRatio: 2.0,
  passingThreshold: 70,
  excellentThreshold: 90,
  analysisSegments: 10,
};

/**
 * Creates an AudioContext for analysis
 */
function getAudioContext(): AudioContext {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API not supported');
  }
  return new AudioContextClass();
}

/**
 * Fetches and decodes audio from a URL or Blob URL
 */
async function fetchAudioBuffer(
  audioContext: AudioContext,
  source: string | Blob
): Promise<AudioBuffer> {
  let arrayBuffer: ArrayBuffer;

  if (typeof source === 'string') {
    // Handle URL (including blob URLs)
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }
    arrayBuffer = await response.arrayBuffer();
  } else {
    // Handle Blob directly
    arrayBuffer = await source.arrayBuffer();
  }

  return audioContext.decodeAudioData(arrayBuffer);
}

/**
 * Extracts audio analysis data from an AudioBuffer
 */
function analyzeAudioBuffer(
  buffer: AudioBuffer,
  segments: number
): AudioAnalysisData {
  const channelData = buffer.getChannelData(0); // Use first channel
  const sampleRate = buffer.sampleRate;
  const duration = buffer.duration;
  const samplesPerSegment = Math.floor(channelData.length / segments);

  // Calculate energy profile (RMS for each segment)
  const energyProfile: number[] = [];
  let peakAmplitude = 0;
  let zeroCrossings = 0;

  for (let i = 0; i < segments; i++) {
    const start = i * samplesPerSegment;
    const end = Math.min(start + samplesPerSegment, channelData.length);
    let sumSquares = 0;

    for (let j = start; j < end; j++) {
      const sample = channelData[j];
      sumSquares += sample * sample;
      peakAmplitude = Math.max(peakAmplitude, Math.abs(sample));

      // Count zero crossings
      if (j > start && channelData[j - 1] * sample < 0) {
        zeroCrossings++;
      }
    }

    const rms = Math.sqrt(sumSquares / (end - start));
    energyProfile.push(rms);
  }

  // Calculate zero crossing rate (crossings per second)
  const zeroCrossingRate = zeroCrossings / duration;

  // Calculate spectral centroid (simplified approximation)
  // This gives a rough measure of the "brightness" of the sound
  let weightedSum = 0;
  let totalEnergy = 0;
  for (let i = 0; i < channelData.length; i++) {
    const magnitude = Math.abs(channelData[i]);
    const frequency = (i / channelData.length) * (sampleRate / 2);
    weightedSum += frequency * magnitude;
    totalEnergy += magnitude;
  }
  const spectralCentroid = totalEnergy > 0 ? weightedSum / totalEnergy : 0;

  // Normalize envelope
  const maxEnergy = Math.max(...energyProfile, 0.001);
  const envelope = energyProfile.map(e => e / maxEnergy);

  return {
    duration,
    energyProfile,
    peakAmplitude,
    zeroCrossingRate,
    spectralCentroid,
    envelope,
  };
}

/**
 * Compares two normalized profiles and returns a similarity score
 */
function compareProfiles(profile1: number[], profile2: number[]): number {
  if (profile1.length !== profile2.length) {
    // Interpolate to match lengths
    const targetLength = Math.min(profile1.length, profile2.length);
    profile1 = interpolateProfile(profile1, targetLength);
    profile2 = interpolateProfile(profile2, targetLength);
  }

  // Calculate correlation coefficient
  const mean1 = profile1.reduce((a, b) => a + b, 0) / profile1.length;
  const mean2 = profile2.reduce((a, b) => a + b, 0) / profile2.length;

  let numerator = 0;
  let sum1Sq = 0;
  let sum2Sq = 0;

  for (let i = 0; i < profile1.length; i++) {
    const diff1 = profile1[i] - mean1;
    const diff2 = profile2[i] - mean2;
    numerator += diff1 * diff2;
    sum1Sq += diff1 * diff1;
    sum2Sq += diff2 * diff2;
  }

  const denominator = Math.sqrt(sum1Sq * sum2Sq);
  if (denominator === 0) return 0;

  const correlation = numerator / denominator;
  // Convert correlation (-1 to 1) to similarity (0 to 100)
  return Math.max(0, Math.min(100, (correlation + 1) * 50));
}

/**
 * Interpolates a profile to a target length
 */
function interpolateProfile(profile: number[], targetLength: number): number[] {
  if (profile.length === targetLength) return profile;

  const result: number[] = [];
  const ratio = (profile.length - 1) / (targetLength - 1);

  for (let i = 0; i < targetLength; i++) {
    const srcIndex = i * ratio;
    const lower = Math.floor(srcIndex);
    const upper = Math.min(lower + 1, profile.length - 1);
    const fraction = srcIndex - lower;

    result.push(profile[lower] * (1 - fraction) + profile[upper] * fraction);
  }

  return result;
}

/**
 * Determines the appropriate feedback key based on analysis
 */
function determineFeedback(
  score: number,
  analysis: AudioAnalysisData,
  reference: AudioAnalysisData,
  options: Required<ScoringOptions>
): PronunciationFeedbackKey {
  const durationRatio = analysis.duration / reference.duration;

  if (score >= options.excellentThreshold) {
    return 'excellent';
  }

  if (score >= options.passingThreshold) {
    return 'good';
  }

  if (score >= 60) {
    return 'almostThere';
  }

  // Give specific feedback based on what went wrong
  if (durationRatio < options.minDurationRatio) {
    return 'tooShort';
  }

  if (durationRatio > options.maxDurationRatio) {
    return 'tooLong';
  }

  if (analysis.peakAmplitude < reference.peakAmplitude * 0.3) {
    return 'tryLouder';
  }

  if (durationRatio > 1.3) {
    return 'trySlower';
  }

  return 'needsWork';
}

/**
 * Calculates XP reward based on score
 * Based on the scoring rules in the UX spec:
 * - First try ≥90%: 15 XP
 * - First try ≥70%: 10 XP
 * - Second try success: 7 XP
 * - Third try success: 5 XP
 */
export function calculateXpReward(
  score: number,
  attemptNumber: number,
  options: Required<ScoringOptions> = DEFAULT_OPTIONS
): number {
  if (score < options.passingThreshold) {
    return 0;
  }

  if (attemptNumber === 1) {
    return score >= options.excellentThreshold ? 15 : 10;
  }

  if (attemptNumber === 2) {
    return 7;
  }

  return 5;
}

/**
 * Main scoring function - compares user recording to reference audio
 */
export async function scorePronunciation(
  userAudio: string | Blob,
  referenceAudio: string | Blob,
  attemptNumber: number = 1,
  options: ScoringOptions = {}
): Promise<PronunciationScore> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  let audioContext: AudioContext | null = null;

  try {
    audioContext = getAudioContext();

    // Fetch and decode both audio files
    const [userBuffer, referenceBuffer] = await Promise.all([
      fetchAudioBuffer(audioContext, userAudio),
      fetchAudioBuffer(audioContext, referenceAudio),
    ]);

    // Analyze both audio samples
    const userAnalysis = analyzeAudioBuffer(userBuffer, opts.analysisSegments);
    const referenceAnalysis = analyzeAudioBuffer(referenceBuffer, opts.analysisSegments);

    // Calculate duration score
    const durationRatio = userAnalysis.duration / referenceAnalysis.duration;
    let durationScore: number;
    
    if (durationRatio < opts.minDurationRatio || durationRatio > opts.maxDurationRatio) {
      // Penalty for being way off on duration
      durationScore = Math.max(0, 100 - Math.abs(1 - durationRatio) * 100);
    } else {
      // Score based on how close to 1:1 ratio
      durationScore = 100 - Math.abs(1 - durationRatio) * 50;
    }

    // Calculate energy/envelope similarity
    const energyScore = compareProfiles(userAnalysis.envelope, referenceAnalysis.envelope);

    // Calculate rhythm score based on zero crossing rate similarity
    const zcrRatio = userAnalysis.zeroCrossingRate / (referenceAnalysis.zeroCrossingRate || 1);
    const rhythmScore = 100 - Math.min(100, Math.abs(1 - zcrRatio) * 100);

    // Calculate overall similarity (weighted average)
    const similarity = Math.round(
      durationScore * 0.25 +
      energyScore * 0.50 +
      rhythmScore * 0.25
    );

    // Confidence is based on audio quality (peak amplitude)
    const confidence = Math.min(100, Math.round(
      (userAnalysis.peakAmplitude / (referenceAnalysis.peakAmplitude || 0.001)) * 100
    ));

    // Determine pass/excellent status
    const passed = similarity >= opts.passingThreshold;
    const excellent = similarity >= opts.excellentThreshold;

    // Get appropriate feedback
    const feedbackKey = determineFeedback(similarity, userAnalysis, referenceAnalysis, opts);

    // Calculate XP reward
    const xpReward = calculateXpReward(similarity, attemptNumber, opts);

    return {
      similarity,
      confidence: Math.min(100, Math.max(0, confidence)),
      passed,
      excellent,
      analysis: {
        durationScore: Math.round(durationScore),
        energyScore: Math.round(energyScore),
        rhythmScore: Math.round(rhythmScore),
      },
      feedbackKey,
      xpReward,
    };
  } finally {
    // Clean up AudioContext
    if (audioContext && audioContext.state !== 'closed') {
      await audioContext.close();
    }
  }
}

/**
 * Fallback scoring when audio comparison is not possible
 * (e.g., no reference audio, or Web Audio API not available)
 * 
 * Returns a basic score based on audio characteristics
 */
export async function scorePronunciationFallback(
  userAudio: string | Blob,
  expectedDuration: number = 1.5,
  attemptNumber: number = 1
): Promise<PronunciationScore> {
  let audioContext: AudioContext | null = null;

  try {
    audioContext = getAudioContext();
    const userBuffer = await fetchAudioBuffer(audioContext, userAudio);
    const analysis = analyzeAudioBuffer(userBuffer, 10);

    // Basic scoring based on audio characteristics
    const durationRatio = analysis.duration / expectedDuration;
    
    // Score based on reasonable duration (0.5x to 2x expected)
    let durationScore = 100;
    if (durationRatio < 0.5 || durationRatio > 2) {
      durationScore = 50;
    } else if (durationRatio < 0.75 || durationRatio > 1.5) {
      durationScore = 75;
    }

    // Score based on peak amplitude (was there actual speech?)
    const volumeScore = analysis.peakAmplitude > 0.1 ? 100 : 
                        analysis.peakAmplitude > 0.05 ? 75 : 50;

    // Score based on zero crossing rate (speech typically 1000-5000 Hz)
    const zcrScore = analysis.zeroCrossingRate > 500 && analysis.zeroCrossingRate < 10000 ? 100 : 70;

    const similarity = Math.round((durationScore + volumeScore + zcrScore) / 3);

    const passed = similarity >= 70;
    const excellent = similarity >= 90;
    const xpReward = calculateXpReward(similarity, attemptNumber);

    return {
      similarity,
      confidence: 50, // Lower confidence for fallback scoring
      passed,
      excellent,
      analysis: {
        durationScore,
        energyScore: volumeScore,
        rhythmScore: zcrScore,
      },
      feedbackKey: excellent ? 'excellent' : passed ? 'good' : 'needsWork',
      xpReward,
    };
  } finally {
    if (audioContext && audioContext.state !== 'closed') {
      await audioContext.close();
    }
  }
}

/**
 * Check if pronunciation scoring is supported in the current browser
 */
export function isPronunciationScoringSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  const AudioContextClass = window.AudioContext || 
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  
  return !!AudioContextClass;
}
