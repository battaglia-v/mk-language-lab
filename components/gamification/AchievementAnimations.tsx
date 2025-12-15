'use client';

/**
 * Achievement Animation Components
 * 
 * Celebratory animations for achievements, level-ups, XP gains,
 * streak milestones, and other accomplishments.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Flame, Zap, Crown, Medal, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { triggerHaptic } from '@/lib/haptics';

// =============================================================================
// TYPES
// =============================================================================

export type AchievementType = 
  | 'badge'
  | 'level-up'
  | 'streak-milestone'
  | 'xp-bonus'
  | 'daily-goal'
  | 'perfect-score'
  | 'first-complete';

interface AchievementToastProps {
  type: AchievementType;
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: React.ReactNode;
  onClose?: () => void;
  autoCloseMs?: number;
  className?: string;
}

// =============================================================================
// CONFETTI PARTICLES
// =============================================================================

function ConfettiParticle({ 
  color, 
  delay,
  size = 8 
}: { 
  color: string; 
  delay: number;
  size?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) return null;

  const randomX = Math.random() * 200 - 100;
  const randomRotate = Math.random() * 720 - 360;
  
  return (
    <motion.div
      className="absolute rounded-sm"
      style={{ 
        backgroundColor: color,
        width: size,
        height: size,
      }}
      initial={{ 
        opacity: 1, 
        y: 0, 
        x: 0, 
        scale: 0,
        rotate: 0 
      }}
      animate={{ 
        opacity: [1, 1, 0],
        y: [0, -150, -200],
        x: [0, randomX],
        scale: [0, 1, 0.5],
        rotate: randomRotate,
      }}
      transition={{ 
        duration: 1.5,
        delay: delay,
        ease: 'easeOut',
      }}
    />
  );
}

function ConfettiBurst({ 
  colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1'],
  particleCount = 20,
}: { 
  colors?: string[];
  particleCount?: number;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: particleCount }).map((_, i) => (
        <ConfettiParticle 
          key={i}
          color={colors[i % colors.length]}
          delay={i * 0.05}
          size={6 + Math.random() * 6}
        />
      ))}
    </div>
  );
}

// =============================================================================
// GLOW PULSE
// =============================================================================

function GlowPulse({ color = 'var(--accent)' }: { color?: string }) {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) return null;

  return (
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ 
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)` 
      }}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.5, 0, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// =============================================================================
// ACHIEVEMENT ICONS
// =============================================================================

const achievementIcons: Record<AchievementType, React.ReactNode> = {
  'badge': <Trophy className="h-8 w-8" />,
  'level-up': <Crown className="h-8 w-8" />,
  'streak-milestone': <Flame className="h-8 w-8" />,
  'xp-bonus': <Zap className="h-8 w-8" />,
  'daily-goal': <Target className="h-8 w-8" />,
  'perfect-score': <Star className="h-8 w-8" />,
  'first-complete': <Medal className="h-8 w-8" />,
};

const achievementColors: Record<AchievementType, string> = {
  'badge': 'from-yellow-500/20 to-amber-500/20',
  'level-up': 'from-purple-500/20 to-pink-500/20',
  'streak-milestone': 'from-orange-500/20 to-red-500/20',
  'xp-bonus': 'from-blue-500/20 to-cyan-500/20',
  'daily-goal': 'from-green-500/20 to-emerald-500/20',
  'perfect-score': 'from-yellow-400/20 to-orange-400/20',
  'first-complete': 'from-indigo-500/20 to-purple-500/20',
};

// =============================================================================
// ACHIEVEMENT TOAST
// =============================================================================

export function AchievementToast({
  type,
  title,
  subtitle,
  value,
  icon,
  onClose,
  autoCloseMs = 4000,
  className,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Trigger haptic feedback
    triggerHaptic('success');

    // Auto-close after delay
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, autoCloseMs);

    return () => clearTimeout(timer);
  }, [autoCloseMs, onClose]);

  const displayIcon = icon || achievementIcons[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed top-20 left-1/2 z-[var(--z-toast)]',
            'min-w-[280px] max-w-[90vw]',
            className
          )}
          initial={{ opacity: 0, y: -50, x: '-50%', scale: 0.8 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: -20, x: '-50%', scale: 0.9 }}
          transition={{ 
            type: 'spring', 
            damping: 20, 
            stiffness: 300,
            duration: prefersReducedMotion ? 0.01 : undefined,
          }}
        >
          {/* Confetti behind the toast */}
          {!prefersReducedMotion && <ConfettiBurst particleCount={15} />}

          <div
            className={cn(
              'relative overflow-hidden rounded-2xl',
              'bg-gradient-to-r border border-white/20',
              'px-5 py-4 shadow-2xl backdrop-blur-xl',
              achievementColors[type]
            )}
          >
            {/* Glow effect */}
            <GlowPulse />

            <div className="relative flex items-center gap-4">
              {/* Icon with animation */}
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white"
                animate={prefersReducedMotion ? {} : {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                }}
              >
                {displayIcon}
              </motion.div>

              <div className="flex-1">
                <motion.h3
                  className="text-lg font-bold text-white"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {title}
                </motion.h3>
                {subtitle && (
                  <motion.p
                    className="text-sm text-white/80"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>

              {value && (
                <motion.div
                  className="text-2xl font-bold text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: 'spring',
                    delay: 0.3,
                    damping: 10,
                  }}
                >
                  {value}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// XP GAIN ANIMATION
// =============================================================================

interface XPGainProps {
  amount: number;
  position?: { x: number; y: number };
  onComplete?: () => void;
}

export function XPGainAnimation({ amount, position, onComplete }: XPGainProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (prefersReducedMotion) {
    return null;
  }

  const style = position 
    ? { left: position.x, top: position.y } 
    : { left: '50%', top: '50%' };

  return (
    <motion.div
      className="fixed z-50 pointer-events-none font-bold text-accent"
      style={style}
      initial={{ opacity: 1, y: 0, scale: 0.5 }}
      animate={{ 
        opacity: [1, 1, 0],
        y: -60,
        scale: [0.5, 1.2, 1],
      }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-1 text-xl">
        <Zap className="h-5 w-5 fill-current" />
        +{amount} XP
      </div>
    </motion.div>
  );
}

// =============================================================================
// STREAK FLAME CELEBRATION
// =============================================================================

interface StreakCelebrationProps {
  days: number;
  isMilestone?: boolean;
  onComplete?: () => void;
}

export function StreakCelebration({ days, isMilestone, onComplete }: StreakCelebrationProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isMilestone) {
      triggerHaptic('success');
    }
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [isMilestone, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-orange-500/20 to-transparent"
        animate={prefersReducedMotion ? {} : {
          opacity: [0, 0.5, 0],
        }}
        transition={{ duration: 2 }}
      />

      {/* Center flame */}
      <motion.div
        className="relative"
        animate={prefersReducedMotion ? {} : {
          scale: [0, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Flame className="h-24 w-24 text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.8)]" />
        
        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-3xl font-bold text-white drop-shadow-lg">
            {days} Day{days !== 1 ? 's' : ''}!
          </span>
        </motion.div>
      </motion.div>

      {/* Sparkles for milestones */}
      {isMilestone && !prefersReducedMotion && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 40}%`,
                top: `${50 + Math.sin(i * 60 * Math.PI / 180) * 40}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{ delay: 0.3 + i * 0.1, duration: 1 }}
            >
              <Sparkles className="h-8 w-8 text-yellow-400" />
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
}

// =============================================================================
// LEVEL UP CELEBRATION
// =============================================================================

interface LevelUpProps {
  newLevel: number;
  onComplete?: () => void;
}

export function LevelUpCelebration({ newLevel, onComplete }: LevelUpProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    triggerHaptic('success');
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Confetti */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ConfettiBurst particleCount={40} />
        </div>
      )}

      {/* Level badge */}
      <motion.div
        className="relative flex flex-col items-center"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: 'spring',
          damping: 15,
          stiffness: 200,
          duration: prefersReducedMotion ? 0.01 : undefined,
        }}
      >
        <div className="relative">
          <motion.div
            className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
            animate={prefersReducedMotion ? {} : {
              boxShadow: [
                '0 0 0 0 rgba(168, 85, 247, 0.4)',
                '0 0 0 30px rgba(168, 85, 247, 0)',
              ],
            }}
            transition={{ duration: 1, repeat: 2 }}
          >
            <Crown className="h-16 w-16 text-white" />
          </motion.div>
          
          <motion.div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-purple-600 px-4 py-1 rounded-full font-bold text-lg shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Level {newLevel}
          </motion.div>
        </div>

        <motion.p
          className="mt-8 text-2xl font-bold text-white drop-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Level Up!
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// HOOK: useAchievement
// =============================================================================

export function useAchievement() {
  const [activeAchievement, setActiveAchievement] = useState<AchievementToastProps | null>(null);

  const showAchievement = useCallback((props: Omit<AchievementToastProps, 'onClose'>) => {
    setActiveAchievement({
      ...props,
      onClose: () => setActiveAchievement(null),
    });
  }, []);

  const hideAchievement = useCallback(() => {
    setActiveAchievement(null);
  }, []);

  return {
    activeAchievement,
    showAchievement,
    hideAchievement,
    AchievementToastComponent: activeAchievement ? (
      <AchievementToast {...activeAchievement} />
    ) : null,
  };
}
