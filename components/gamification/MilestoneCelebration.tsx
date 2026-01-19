'use client';

/**
 * MilestoneCelebration - Modal celebrating milestone achievements
 * 
 * Shows an animated celebration when user reaches a milestone.
 * Displays the milestone details, XP reward, and share options.
 * 
 * Parity: Must match Android MilestoneCelebration.tsx
 */

import { useEffect, useState } from 'react';
import { X, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Milestone } from '@/lib/gamification/milestones';
import { getRarityColor, getRarityBackground } from '@/lib/gamification/milestones';

interface MilestoneCelebrationProps {
  /** The achieved milestone */
  milestone: Milestone;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when share is clicked */
  onShare?: () => void;
  /** Whether to auto-dismiss after delay */
  autoDismiss?: boolean;
  /** Auto-dismiss delay in ms */
  dismissDelay?: number;
}

export function MilestoneCelebration({
  milestone,
  onClose,
  onShare,
  autoDismiss = false,
  dismissDelay = 5000,
}: MilestoneCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  const rarityColor = getRarityColor(milestone.rarity);
  const rarityBg = getRarityBackground(milestone.rarity);

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
    
    // Generate confetti particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);

    // Auto-dismiss
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, dismissDelay);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissDelay, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div 
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/60 backdrop-blur-sm',
        'transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleClose}
    >
      {/* Confetti particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: rarityColor,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-sm rounded-2xl border bg-card p-6 shadow-2xl',
          'transition-all duration-300',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
        style={{ borderColor: rarityColor }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="text-center space-y-4">
          {/* Icon with glow effect */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{ backgroundColor: rarityBg }}
            />
            <span className="relative text-5xl animate-bounce-slow">
              {milestone.icon}
            </span>
            <Sparkles 
              className="absolute -top-2 -right-2 h-6 w-6 animate-spin-slow"
              style={{ color: rarityColor }}
            />
          </div>

          {/* Title */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Milestone Achieved!
            </p>
            <h2 
              className="text-2xl font-bold"
              style={{ color: rarityColor }}
            >
              {milestone.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {milestone.titleMk}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground">
            {milestone.description}
          </p>

          {/* XP Reward */}
          <div 
            className="inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{ backgroundColor: rarityBg }}
          >
            <span className="text-lg">⚡</span>
            <span 
              className="font-bold"
              style={{ color: rarityColor }}
            >
              +{milestone.xpReward} XP
            </span>
          </div>

          {/* Rarity badge */}
          <div className="flex justify-center">
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
              style={{ 
                backgroundColor: rarityBg,
                color: rarityColor,
              }}
            >
              <Sparkles className="h-3 w-3" />
              {milestone.rarity}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleClose}
              className="flex-1"
              style={{ 
                backgroundColor: rarityColor,
                color: milestone.rarity === 'legendary' ? '#000' : '#fff',
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default MilestoneCelebration;
