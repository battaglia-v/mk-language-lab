# Task 3: UI Revamp Proposal - Design Tokens & System

> **Last Updated:** 2025-12-14  
> **Owner:** Design System Team  
> **Review Cycle:** Quarterly

---

## 1. Design Token System

### 1.1 Spacing Scale (8px Base)

```css
:root {
  /* Core spacing tokens */
  --space-0: 0;
  --space-0-5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1-5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px - base unit */
  --space-2-5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-3-5: 0.875rem;  /* 14px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-7: 1.75rem;     /* 28px */
  --space-8: 2rem;        /* 32px */
  --space-9: 2.25rem;     /* 36px */
  --space-10: 2.5rem;     /* 40px */
  --space-11: 2.75rem;    /* 44px */
  --space-12: 3rem;       /* 48px */
  --space-14: 3.5rem;     /* 56px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
  
  /* Semantic spacing */
  --space-page-x: clamp(var(--space-4), 4vw, var(--space-10));
  --space-page-y: clamp(var(--space-6), 5vw, var(--space-12));
  --space-section: clamp(var(--space-8), 6vw, var(--space-16));
  --space-card: var(--space-5);
  --space-card-compact: var(--space-4);
  --space-inline: var(--space-2);
  --space-stack: var(--space-4);
}
```

### 1.2 Typography Scale

```css
:root {
  /* Font families */
  --font-sans: 'Inter', 'Geist', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
  --font-display: var(--font-sans);
  
  /* Font sizes - fluid scale */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);    /* 12-13px */
  --text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);   /* 14-15px */
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.0625rem);    /* 16-17px */
  --text-lg: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);        /* 18-20px */
  --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);       /* 20-24px */
  --text-2xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);        /* 24-32px */
  --text-3xl: clamp(1.875rem, 1.5rem + 1.75vw, 2.5rem);     /* 30-40px */
  --text-4xl: clamp(2.25rem, 1.75rem + 2.5vw, 3rem);        /* 36-48px */
  
  /* Line heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 1.75;
  --leading-reading: 1.8;  /* For long-form content */
  
  /* Letter spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  
  /* Font weights */
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}

/* Typography presets */
.text-display {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.text-h1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.text-h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

.text-h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

.text-h4 {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
}

.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);
}

.text-body-sm {
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);
}

.text-caption {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
}

.text-overline {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
}
```

### 1.3 Color System (WCAG AA Compliant)

```css
:root {
  /* Brand colors */
  --color-brand-gold: #f6d83b;
  --color-brand-gold-dark: #d4a800;    /* Darker for light theme */
  --color-brand-amber: #f4b400;
  --color-brand-emerald: #34d399;
  --color-brand-emerald-dark: #059669; /* Darker for light theme */
  
  /* Neutral palette (dark theme) */
  --color-gray-950: #06060b;
  --color-gray-900: #0b0b12;
  --color-gray-850: #111424;
  --color-gray-800: #151827;
  --color-gray-750: #1b1f33;
  --color-gray-700: #222536;
  --color-gray-600: #2e3246;
  --color-gray-500: #4b5063;
  --color-gray-400: #6b7280;
  --color-gray-300: #9ca3af;
  --color-gray-200: #d1d5db;
  --color-gray-100: #f3f4f6;
  --color-gray-50: #f9fafb;
  
  /* Semantic colors */
  --color-success: #3ecf8e;
  --color-success-bg: rgba(62, 207, 142, 0.12);
  --color-success-border: rgba(62, 207, 142, 0.3);
  
  --color-warning: #f4c84a;
  --color-warning-bg: rgba(244, 200, 74, 0.12);
  --color-warning-border: rgba(244, 200, 74, 0.3);
  
  --color-error: #ff7878;
  --color-error-bg: rgba(255, 120, 120, 0.12);
  --color-error-border: rgba(255, 120, 120, 0.3);
  
  --color-info: #60a5fa;
  --color-info-bg: rgba(96, 165, 250, 0.12);
  --color-info-border: rgba(96, 165, 250, 0.3);
}

/* Contrast-checked color pairs */
.color-pair {
  /* These pairs meet WCAG AA 4.5:1 contrast */
  --text-on-gold: #000000;           /* 12.6:1 */
  --text-on-emerald: #02150c;        /* 10.2:1 */
  --text-on-dark-bg: #f7f8fb;        /* 15.8:1 */
  --muted-on-dark-bg: rgba(247,248,251,0.88); /* 13.9:1 */
}
```

### 1.4 Button Styles

```css
:root {
  /* Button sizing */
  --btn-height-sm: 2.75rem;   /* 44px - WCAG minimum */
  --btn-height-md: 3rem;      /* 48px */
  --btn-height-lg: 3.5rem;    /* 56px */
  --btn-height-xl: 4rem;      /* 64px - hero CTA */
  
  --btn-padding-x-sm: var(--space-4);
  --btn-padding-x-md: var(--space-6);
  --btn-padding-x-lg: var(--space-8);
  
  --btn-radius: var(--space-3-5);  /* 14px */
  --btn-radius-pill: 9999px;
  
  --btn-font-size: var(--text-sm);
  --btn-font-weight: var(--font-semibold);
  
  /* Icon in button */
  --btn-icon-size: 1.25rem;   /* 20px */
  --btn-icon-gap: var(--space-2);
}

/* Button variants */
.btn-primary {
  background: var(--color-brand-gold);
  color: var(--text-on-gold);
  box-shadow: 0 4px 12px rgba(246, 216, 59, 0.25);
}

.btn-primary:hover {
  background: var(--color-brand-amber);
  box-shadow: 0 6px 20px rgba(246, 216, 59, 0.35);
}

.btn-secondary {
  background: var(--color-brand-emerald);
  color: var(--text-on-emerald);
}

.btn-outline {
  background: transparent;
  border: 1.5px solid var(--color-gray-600);
  color: var(--color-gray-100);
}

.btn-outline:hover {
  border-color: var(--color-brand-gold);
  color: var(--color-brand-gold);
  background: rgba(246, 216, 59, 0.08);
}

.btn-ghost {
  background: transparent;
  color: var(--color-gray-200);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-brand-gold);
}
```

### 1.5 Form Field Styles

```css
:root {
  --input-height: 3rem;        /* 48px */
  --input-height-sm: 2.75rem;  /* 44px */
  --input-height-lg: 3.5rem;   /* 56px */
  
  --input-padding-x: var(--space-4);
  --input-padding-y: var(--space-3);
  
  --input-radius: var(--space-3);  /* 12px */
  --input-border-width: 1.5px;
  
  --input-bg: var(--color-gray-850);
  --input-border: var(--color-gray-700);
  --input-border-focus: var(--color-brand-gold);
  --input-border-error: var(--color-error);
  
  --input-placeholder: var(--color-gray-500);
}

.input-field {
  height: var(--input-height);
  padding: var(--input-padding-y) var(--input-padding-x);
  background: var(--input-bg);
  border: var(--input-border-width) solid var(--input-border);
  border-radius: var(--input-radius);
  font-size: var(--text-base);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.input-field:focus {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px rgba(246, 216, 59, 0.2);
  outline: none;
}

.input-field:invalid,
.input-field[aria-invalid="true"] {
  border-color: var(--input-border-error);
}

.input-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-gray-200);
  margin-bottom: var(--space-2);
}

.input-hint {
  font-size: var(--text-xs);
  color: var(--color-gray-400);
  margin-top: var(--space-1-5);
}

.input-error {
  font-size: var(--text-xs);
  color: var(--color-error);
  margin-top: var(--space-1-5);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

### 1.6 Iconography Rules

```css
:root {
  /* Icon sizes */
  --icon-xs: 1rem;      /* 16px - inline icons */
  --icon-sm: 1.25rem;   /* 20px - default */
  --icon-md: 1.5rem;    /* 24px - emphasis */
  --icon-lg: 2rem;      /* 32px - cards */
  --icon-xl: 2.5rem;    /* 40px - hero */
  --icon-2xl: 3rem;     /* 48px - empty states */
  
  /* Icon stroke */
  --icon-stroke: 1.75;
  --icon-stroke-bold: 2.25;
  
  /* Icon colors */
  --icon-default: currentColor;
  --icon-muted: var(--color-gray-400);
  --icon-accent: var(--color-brand-gold);
  --icon-success: var(--color-success);
  --icon-error: var(--color-error);
}

/* Icon button container (44px touch target) */
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-height-sm);
  height: var(--btn-height-sm);
  border-radius: var(--space-2-5);
}
```

---

## 2. Alignment Rules

### 2.1 Container & Layout Rules

```css
/* Global container system */
.container {
  width: 100%;
  max-width: var(--container-max, 1280px);
  margin-inline: auto;
  padding-inline: var(--space-page-x);
}

.container-sm { --container-max: 640px; }
.container-md { --container-max: 768px; }
.container-lg { --container-max: 1024px; }
.container-xl { --container-max: 1280px; }
.container-2xl { --container-max: 1536px; }
.container-prose { --container-max: 720px; }  /* Reading width */

/* 12-column grid */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .grid-12 {
    gap: var(--space-6);
  }
}

/* Column spans */
.col-1 { grid-column: span 1; }
.col-2 { grid-column: span 2; }
.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; }
.col-8 { grid-column: span 8; }
.col-12 { grid-column: span 12; }

/* Responsive column overrides */
@media (max-width: 767px) {
  .col-md-12 { grid-column: span 12; }
}
```

### 2.2 Button Centering Rules

```css
/* All buttons must center in containers */
.btn-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

/* Horizontal button group */
.btn-group-horizontal {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

/* Full-width button container */
.btn-full-width {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.btn-full-width > button,
.btn-full-width > a {
  width: 100%;
  justify-content: center;
}

/* Card footer buttons */
.card-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: auto;
  padding-top: var(--space-4);
}

/* Centered CTA section */
.cta-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
}
```

### 2.3 Card Layout Rules

```css
/* Card base */
.card {
  display: flex;
  flex-direction: column;
  padding: var(--space-card);
  background: var(--color-gray-850);
  border: 1px solid var(--color-gray-700);
  border-radius: var(--space-5);
}

/* Card must have equal height in grids */
.card-grid > .card {
  height: 100%;
}

/* Card header */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

/* Card content grows to fill */
.card-content {
  flex: 1;
}

/* Card footer sticks to bottom */
.card-footer {
  margin-top: auto;
  padding-top: var(--space-4);
}
```

---

## 3. Accessibility Standards

### 3.1 Focus Visible System

```css
:root {
  --focus-ring-color: var(--color-brand-gold);
  --focus-ring-width: 3px;
  --focus-ring-offset: 2px;
  --focus-ring-style: solid;
}

/* Universal focus style */
:focus-visible {
  outline: var(--focus-ring-width) var(--focus-ring-style) var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast focus for dark backgrounds */
.focus-high-contrast:focus-visible {
  outline-color: white;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.5);
}
```

### 3.2 Minimum Touch Targets

```css
/* All interactive elements must meet 44px minimum */
button,
a,
input,
select,
[role="button"],
[role="link"],
[role="checkbox"],
[role="radio"],
[role="tab"] {
  min-height: 44px;
  min-width: 44px;
}

/* Icon buttons need explicit sizing */
.touch-target {
  position: relative;
}

.touch-target::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: max(100%, 44px);
  height: max(100%, 44px);
}
```

### 3.3 Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Safe animations (subtle transforms only) */
@media (prefers-reduced-motion: no-preference) {
  .animate-fade {
    animation: fade 200ms ease-out;
  }
  
  .animate-slide-up {
    animation: slide-up 300ms ease-out;
  }
}

@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { 
    opacity: 0;
    transform: translateY(8px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 4. Animation & Micro-interaction Specs

### 4.1 Timing Functions

```css
:root {
  /* Easing curves */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Durations */
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
}
```

### 4.2 Button Interactions

```css
/* Button press effect */
.btn {
  transition: 
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    background-color var(--duration-normal) var(--ease-out);
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(1px) scale(0.98);
}

/* Button with haptic feedback class */
.btn-haptic:active {
  /* Triggers haptic on mobile via JS */
}
```

### 4.3 Correct/Incorrect Feedback

```css
/* Correct answer animation */
@keyframes correct-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(62, 207, 142, 0.4);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(62, 207, 142, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(62, 207, 142, 0);
  }
}

.feedback-correct {
  animation: correct-pulse 600ms var(--ease-out);
  border-color: var(--color-success) !important;
  background-color: var(--color-success-bg) !important;
}

/* Incorrect answer shake */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.feedback-incorrect {
  animation: shake 400ms var(--ease-out);
  border-color: var(--color-error) !important;
  background-color: var(--color-error-bg) !important;
}
```

### 4.4 Progress & Reward Animations

```css
/* XP counter increment */
@keyframes xp-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.xp-increment {
  animation: xp-pop 300ms var(--ease-spring);
}

/* Streak fire animation */
@keyframes flame-flicker {
  0%, 100% { 
    transform: scale(1) rotate(-2deg);
    filter: brightness(1);
  }
  50% { 
    transform: scale(1.05) rotate(2deg);
    filter: brightness(1.1);
  }
}

.streak-icon {
  animation: flame-flicker 1.5s ease-in-out infinite;
}

/* Goal complete celebration */
@keyframes celebrate {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.goal-complete {
  animation: celebrate 500ms var(--ease-spring);
}
```

---

## 5. Component Specifications

### 5.1 Responsive Breakpoints

| Name | Min Width | Max Width | Usage |
|------|-----------|-----------|-------|
| `xs` | 0 | 479px | Mobile portrait |
| `sm` | 480px | 639px | Mobile landscape |
| `md` | 640px | 767px | Small tablet |
| `lg` | 768px | 1023px | Tablet |
| `xl` | 1024px | 1279px | Small desktop |
| `2xl` | 1280px | ∞ | Large desktop |

```css
/* Breakpoint custom properties */
:root {
  --breakpoint-sm: 480px;
  --breakpoint-md: 640px;
  --breakpoint-lg: 768px;
  --breakpoint-xl: 1024px;
  --breakpoint-2xl: 1280px;
}
```

### 5.2 Z-Index Scale

```css
:root {
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
  --z-toast: 100;
  --z-max: 9999;
}
```

---

## 6. Tailwind Configuration Export

```javascript
// tailwind.config.ts additions
module.exports = {
  theme: {
    extend: {
      spacing: {
        '0.5': '0.125rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '3.5': '0.875rem',
        '4.5': '1.125rem',
        '11': '2.75rem',
        '13': '3.25rem',
        '15': '3.75rem',
      },
      fontSize: {
        'xs': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem)', { lineHeight: '1.5' }],
        'sm': ['clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem)', { lineHeight: '1.5' }],
        'base': ['clamp(1rem, 0.95rem + 0.25vw, 1.0625rem)', { lineHeight: '1.625' }],
        'lg': ['clamp(1.125rem, 1rem + 0.5vw, 1.25rem)', { lineHeight: '1.5' }],
        'xl': ['clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)', { lineHeight: '1.375' }],
        '2xl': ['clamp(1.5rem, 1.25rem + 1.25vw, 2rem)', { lineHeight: '1.25' }],
        '3xl': ['clamp(1.875rem, 1.5rem + 1.75vw, 2.5rem)', { lineHeight: '1.25' }],
        '4xl': ['clamp(2.25rem, 1.75rem + 2.5vw, 3rem)', { lineHeight: '1.1' }],
      },
      borderRadius: {
        'control': '0.875rem',
        'card': '1.25rem',
        'panel': '1.5rem',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'focus': '0 0 0 3px rgba(246, 216, 59, 0.28)',
        'glow': '0 0 20px rgba(246, 216, 59, 0.3)',
      },
      animation: {
        'fade-in': 'fade 200ms ease-out',
        'slide-up': 'slide-up 300ms ease-out',
        'shake': 'shake 400ms ease-out',
        'pulse-success': 'correct-pulse 600ms ease-out',
        'xp-pop': 'xp-pop 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
};
```
