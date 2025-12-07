# Animation Guide

Complete reference for all Framer Motion animations in the Macedonian Language Learning App.

## Table of Contents
- [Performance Optimization](#performance-optimization)
- [Button & Interaction Animations](#button--interaction-animations)
- [Fade Animations](#fade-animations)
- [Slide Animations](#slide-animations)
- [Scale Animations](#scale-animations)
- [Modal Animations](#modal-animations)
- [List & Stagger Animations](#list--stagger-animations)
- [Success & Celebration Animations](#success--celebration-animations)
- [Progress & Gamification Animations](#progress--gamification-animations)
- [Usage Examples](#usage-examples)

---

## Performance Optimization

**All animations use `transform` and `opacity` only** for GPU acceleration and 60fps performance.

### Never Animate:
- ❌ `width`, `height` (causes reflow)
- ❌ `top`, `left`, `bottom`, `right` (causes repaint)
- ❌ `margin`, `padding` (causes reflow)

### Always Animate:
- ✅ `scale`, `x`, `y`, `rotate` (GPU-accelerated)
- ✅ `opacity` (GPU-accelerated)

---

## Button & Interaction Animations

### `buttonTap`
Quick scale-down on tap/click.

```tsx
<motion.button variants={buttonTap} whileTap="tap">
  Click me
</motion.button>
```

**Use cases**: Primary buttons, icon buttons, cards

---

### `buttonHover`
Subtle scale-up on hover.

```tsx
<motion.button variants={buttonHover} whileHover="hover">
  Hover me
</motion.button>
```

**Use cases**: Secondary buttons, links, interactive cards

---

### `buttonPress`
Combined hover + tap animation.

```tsx
<motion.button
  variants={buttonPress}
  initial="initial"
  whileHover="hover"
  whileTap="tap"
>
  Interactive
</motion.button>
```

**Use cases**: All interactive elements that need both states

---

## Fade Animations

### `fadeIn`
Simple fade in/out.

```tsx
<motion.div variants={fadeIn} initial="initial" animate="animate" exit="exit">
  Content
</motion.div>
```

**Duration**: 300ms in, 200ms out
**Use cases**: Loading states, modals, tooltips

---

### `fadeInUp`
Fade in while moving up from below.

```tsx
<motion.div variants={fadeInUp} initial="initial" animate="animate">
  Slides up
</motion.div>
```

**Duration**: 300ms
**Movement**: 20px up
**Use cases**: Success messages, toast notifications, page sections

---

### `fadeInDown`
Fade in while moving down from above.

```tsx
<motion.div variants={fadeInDown} initial="initial" animate="animate">
  Slides down
</motion.div>
```

**Use cases**: Dropdowns, notifications from top

---

## Slide Animations

### `slideInLeft`
Slide in from the left side.

```tsx
<motion.div variants={slideInLeft} initial="initial" animate="animate">
  Slides from left
</motion.div>
```

**Movement**: 100px from left
**Use cases**: Page transitions, sidebar panels

---

### `slideInRight`
Slide in from the right side.

```tsx
<motion.div variants={slideInRight} initial="initial" animate="animate">
  Slides from right
</motion.div>
```

**Use cases**: Next lesson transitions, forward navigation

---

### `slideInUp`
Slide in from below.

```tsx
<motion.div variants={slideInUp} initial="initial" animate="animate">
  Slides up
</motion.div>
```

**Use cases**: Bottom sheets, mobile modals, drawers

---

## Scale Animations

### `scaleIn`
Pop in from center.

```tsx
<motion.div variants={scaleIn} initial="initial" animate="animate">
  Pops in
</motion.div>
```

**Duration**: 200ms
**Use cases**: Badges, icons, achievement unlocks

---

### `scaleInBounce`
Pop in with spring bounce.

```tsx
<motion.div variants={scaleInBounce} initial="initial" animate="animate">
  Bounces in
</motion.div>
```

**Use cases**: Celebration modals, achievement badges, success states

---

## Modal Animations

### `modalBackdrop`
Fade in backdrop overlay.

```tsx
<motion.div
  variants={modalBackdrop}
  initial="initial"
  animate="animate"
  exit="exit"
  onClick={onClose}
  className="fixed inset-0 bg-black/50"
/>
```

**Duration**: 200ms
**Use cases**: All modal backdrops

---

### `modalSlideUp`
Modal slides up from bottom (mobile-friendly).

```tsx
<motion.div variants={modalSlideUp} initial="initial" animate="animate">
  Modal content
</motion.div>
```

**Use cases**: Mobile modals, bottom sheets

---

### `bottomSheet`
Optimized for mobile bottom sheets.

```tsx
<motion.div variants={bottomSheet} initial="initial" animate="animate" exit="exit">
  Sheet content
</motion.div>
```

**Movement**: 100% from bottom
**Duration**: 300ms with spring physics

---

## List & Stagger Animations

### `staggerContainer`
Parent container for staggered children.

```tsx
<motion.div
  variants={staggerContainer}
  initial="initial"
  animate="animate"
>
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

**Stagger delay**: 100ms between children
**Use cases**: Lists, grids, cards

---

### `staggerItem`
Child items in staggered list.

```tsx
<motion.div variants={staggerItem}>
  List item
</motion.div>
```

**Use with**: `staggerContainer`

---

## Success & Celebration Animations

### `celebrationPop`
Energetic pop animation for celebrations.

```tsx
<motion.div variants={celebrationPop} initial="initial" animate="animate">
  🎉
</motion.div>
```

**Sequence**: Scale 0 → 1.2 → 1
**Duration**: 500ms
**Use cases**: Achievement unlocks, level ups, lesson completions

---

### `xpPopUp`
Floating XP notification that rises and fades.

```tsx
<motion.div variants={xpPopUp} initial="initial" animate="animate">
  +10 XP
</motion.div>
```

**Movement**: Rises 50px upward
**Duration**: 800ms
**Use cases**: XP rewards, point notifications

---

### `confettiPiece`
Individual confetti particle animation.

```tsx
<motion.div
  variants={confettiPiece}
  custom={index}
  initial="initial"
  animate="animate"
>
  🎊
</motion.div>
```

**Movement**: Falls from top with rotation
**Use cases**: Celebration effects (use with CelebrationModal)

---

## Progress & Gamification Animations

### `streakFlame`
Flickering flame animation for streaks.

```tsx
<motion.div
  variants={streakFlame}
  animate={isActive ? "idle" : "initial"}
>
  🔥
</motion.div>
```

**Variants**:
- `idle`: Gentle flicker (infinite loop)
- `celebrate`: Celebratory bounce

**Use cases**: Streak counters, fire icons

---

### `progressFill`
Animated progress bar fill.

```tsx
<motion.div
  variants={progressFill}
  custom={percentage}
  initial="initial"
  animate="animate"
  className="h-full bg-accent"
/>
```

**Duration**: 600ms
**Use cases**: XP bars, daily goal progress, level progression

---

### `ringProgress`
Circular progress ring animation.

```tsx
<motion.circle
  variants={ringProgress}
  custom={progress}
  initial="initial"
  animate="animate"
  strokeDasharray={circumference}
/>
```

**Use cases**: Daily goal rings, circular progress indicators

---

## Usage Examples

### Complete Button with All States

```tsx
import { motion } from 'framer-motion';
import { buttonPress } from '@/lib/animations';

<motion.button
  variants={buttonPress}
  initial="initial"
  whileHover="hover"
  whileTap="tap"
  className="btn-primary"
>
  Complete Lesson
</motion.button>
```

---

### Staggered Card Grid

```tsx
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

<motion.div
  variants={staggerContainer}
  initial="initial"
  animate="animate"
  className="grid gap-4"
>
  {cards.map((card) => (
    <motion.div
      key={card.id}
      variants={staggerItem}
      className="card"
    >
      {card.content}
    </motion.div>
  ))}
</motion.div>
```

---

### Bottom Sheet Modal

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdrop, bottomSheet } from '@/lib/animations';

<AnimatePresence>
  {open && (
    <>
      <motion.div
        variants={modalBackdrop}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={onClose}
        className="fixed inset-0 bg-black/50"
      />

      <motion.div
        variants={bottomSheet}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed bottom-0 inset-x-0 rounded-t-xl bg-white"
      >
        Modal content
      </motion.div>
    </>
  )}
</AnimatePresence>
```

---

### XP Pop-Up Notification

```tsx
import { XPPopUpContainer, XPNotification } from '@/components/gamification/XPPopUp';

const [notifications, setNotifications] = useState<XPNotification[]>([]);

// Add notification
const addXP = (amount: number, reason: string) => {
  setNotifications(prev => [...prev, {
    id: Date.now(),
    amount,
    reason,
  }]);
};

// Render
<XPPopUpContainer
  notifications={notifications}
  onRemove={(id) => setNotifications(prev =>
    prev.filter(n => n.id !== id)
  )}
  position="top-center"
/>
```

---

## Best Practices

1. **Use AnimatePresence for exit animations**
   ```tsx
   <AnimatePresence mode="wait">
     {show && <motion.div exit="exit">...</motion.div>}
   </AnimatePresence>
   ```

2. **Combine variants for complex animations**
   ```tsx
   <motion.div
     variants={{
       ...fadeIn,
       hover: buttonHover.hover,
     }}
   />
   ```

3. **Use layout animations for smooth position changes**
   ```tsx
   <motion.div layout layoutId="card-123">
     Content
   </motion.div>
   ```

4. **Respect reduced motion preferences**
   ```tsx
   const shouldReduceMotion = useReducedMotion();

   <motion.div
     animate={shouldReduceMotion ? {} : { scale: 1.2 }}
   />
   ```

5. **Always add TypeScript comments for Framer Motion**
   ```tsx
   {/* @ts-expect-error - framer-motion type compatibility issue with Next.js 16 */}
   <motion.div variants={fadeIn}>...</motion.div>
   ```

---

## Performance Checklist

- ✅ All animations use transform/opacity only
- ✅ Duration under 300ms for most interactions
- ✅ 60fps target (16.67ms per frame)
- ✅ Reduced motion support
- ✅ GPU-accelerated properties
- ✅ Exit animations for smooth unmounting
- ✅ Stagger delays for sequential animations
- ✅ Spring physics for natural motion

---

## Troubleshooting

### Animation not triggering?
- Check that `initial`, `animate`, `exit` props are set
- Ensure AnimatePresence wraps components with exit animations
- Verify variants object structure

### Laggy animations?
- Avoid animating width/height
- Use transform: scale instead of width
- Check for reflows in DevTools Performance tab
- Reduce number of simultaneous animations

### TypeScript errors?
- Add `@ts-expect-error` comment above motion components
- This is a known Next.js 16 + Framer Motion compatibility issue

---

Last Updated: December 2025
