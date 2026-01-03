'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const LOADING_TIPS = [
  'Добро утро = Good morning',
  'Macedonian has 31 letters',
  'Practice makes progress!',
  'Како си? = How are you?',
  'Streak = Consistency',
];

export default function Loading() {
  const [tipIndex, setTipIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    // Rotate tips every 3 seconds with fade
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
        setFadeIn(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      role="status"
      aria-label="Loading MK Language Lab"
    >
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/10 pointer-events-none" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated logo with glow */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse" />

          {/* Logo container with subtle bounce */}
          <div className="relative animate-bounce-subtle">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-2xl shadow-primary/30 ring-2 ring-primary/20">
              <Image
                src="/icon-192.png"
                alt="MK Language Lab"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* App name */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="text-primary">Македонски</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            MK Language Lab
          </p>
        </div>

        {/* Loading indicator - three dots */}
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'w-2.5 h-2.5 rounded-full bg-primary',
                'animate-loading-dot'
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>

        {/* Rotating tips */}
        <div className="h-6 mt-4">
          <p
            className={cn(
              'text-sm text-muted-foreground text-center transition-opacity duration-300',
              fadeIn ? 'opacity-100' : 'opacity-0'
            )}
          >
            {LOADING_TIPS[tipIndex]}
          </p>
        </div>
      </div>

      {/* Bottom attribution */}
      <div className="absolute bottom-8 text-xs text-muted-foreground/50">
        Loading your lessons...
      </div>
    </div>
  );
}
