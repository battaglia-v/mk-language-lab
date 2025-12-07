/**
 * Reusable animation variants for Framer Motion
 * Optimized for 60fps using transform and opacity only
 */

import { Variants } from "framer-motion";

// ========================================
// BUTTON & INTERACTION ANIMATIONS
// ========================================

export const buttonTap: Variants = {
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
};

export const buttonHover: Variants = {
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

export const buttonPress: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.95 },
};

// ========================================
// FADE ANIMATIONS
// ========================================

export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// ========================================
// SLIDE ANIMATIONS
// ========================================

export const slideInLeft: Variants = {
  initial: {
    x: -100,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    x: 100,
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: "easeIn",
    },
  },
};

export const slideInRight: Variants = {
  initial: {
    x: 100,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: "easeIn",
    },
  },
};

// ========================================
// SCALE ANIMATIONS
// ========================================

export const scaleIn: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.34, 1.56, 0.64, 1], // Bounce effect
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const scaleUp: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
  exit: {
    scale: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// ========================================
// SUCCESS CELEBRATION ANIMATIONS
// ========================================

export const celebrationPop: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.6, 1],
      ease: "easeOut",
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const xpPopUp: Variants = {
  initial: {
    y: 0,
    opacity: 1,
    scale: 1,
  },
  animate: {
    y: -50,
    opacity: 0,
    scale: 1.2,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export const confettiPiece: Variants = {
  initial: {
    y: -20,
    opacity: 0,
    rotate: 0,
  },
  animate: (i: number) => ({
    y: 600,
    opacity: [0, 1, 1, 0],
    rotate: i * 360,
    x: Math.random() * 200 - 100,
    transition: {
      duration: 2 + Math.random(),
      ease: "easeIn",
      times: [0, 0.1, 0.8, 1],
    },
  }),
};

// ========================================
// PROGRESS & STREAK ANIMATIONS
// ========================================

export const streakFlame: Variants = {
  idle: {
    scale: [1, 1.1, 1],
    y: [0, -2, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  celebrate: {
    scale: [1, 1.3, 1.1],
    rotate: [0, -5, 5, 0],
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const progressFill: Variants = {
  initial: {
    scaleX: 0,
  },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

export const ringProgress: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: (progress: number) => ({
    pathLength: progress / 100,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 0.8,
        ease: "easeOut",
      },
      opacity: {
        duration: 0.3,
      },
    },
  }),
};

// ========================================
// CARD & LIST ANIMATIONS
// ========================================

export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      duration: 0.1,
    },
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

// ========================================
// MODAL & OVERLAY ANIMATIONS
// ========================================

export const modalBackdrop: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const bottomSheet: Variants = {
  initial: {
    y: "100%",
  },
  animate: {
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.32, 0.72, 0, 1],
    },
  },
  exit: {
    y: "100%",
    transition: {
      duration: 0.25,
      ease: [0.32, 0.72, 0, 1],
    },
  },
};

// ========================================
// SKELETON & LOADING ANIMATIONS
// ========================================

export const pulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// ========================================
// NUMBER COUNTER ANIMATION
// ========================================

/**
 * Animate a number counting up
 * Usage: Use with custom hook or useMotionValue
 */
export const counterConfig = {
  duration: 0.8,
  ease: "easeOut",
};

// ========================================
// REDUCED MOTION SUPPORT
// ========================================

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Get safe variants that respect reduced motion preference
 */
export const getSafeVariants = (variants: Variants): Variants => {
  if (!prefersReducedMotion()) return variants;

  // Disable all animations if user prefers reduced motion
  return Object.keys(variants).reduce((acc, key) => {
    acc[key] = { transition: { duration: 0.01 } };
    return acc;
  }, {} as Variants);
};
