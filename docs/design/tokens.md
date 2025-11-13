# Design Tokens – Macedonian Palette

Last updated: November 2025

## Core Colors

| Token | Hex | Usage |
| --- | --- | --- |
| `--brand-red` | `#D7263D` | Primary brand, headlines, destructive states |
| `--brand-red-dark` | `#B4162B` | Hover/active states for red CTAs |
| `--brand-gold` | `#F7C948` | Secondary brand, accent highlights, dividers |
| `--brand-gold-dark` | `#D8A524` | Hover/active for gold CTAs |
| `--brand-green` | `#2FBF71` | Success-only accent (correct states, confirmation badges) |
| `--brand-green-dark` | `#208F56` | Hover/active for success buttons & borders |
| `--brand-mint` | `#DFF6EA` | Success feedback background |
| `--brand-rose` | `#FFE3E3` | Error feedback background |
| `--brand-navy` | `#101828` | App chrome in light mode |
| `--brand-plum` | `#4C1D95` | Accent gradients & depth layers |
| `--brand-cream` | `#FFF6E1` | Primary page background inspired by Macedonian textiles |
| `--brand-cream-light` | `#FFFAF0` | Cards, popovers, and parchment-style surfaces |

The CSS variables live in `app/globals.css`. Access them via Tailwind’s arbitrary value syntax: e.g. `bg-[var(--brand-red)]`, `hover:bg-[var(--brand-red-dark)]`, `border-[var(--brand-gold)]`.

## Semantic Surfaces & Text

To avoid sprinkling translucent hex values across components, `app/globals.css` now exposes higher-level tokens:

| Token | Light Value | Dark Value | Usage |
| --- | --- | --- | --- |
| `--surface-elevated` | subtle cream glass | desaturated navy | Hero cards, Quick Start tiles, translator inbox rows |
| `--surface-frosted` | lighter parchment wash | frosted navy glaze | Inactive pills, translator direction buttons, muted alerts |
| `--surface-gold-tint` | warm gold wash | deep gold glow | Accent cards, progress callouts |
| `--border-accent-red` | brand red @ 20% alpha | brand red @ 30% alpha | Streak/focus cards, CTA outlines |
| `--border-accent-plum` | brand plum @ 28% alpha | brand plum @ 35% alpha | Resource cards, plum-toned highlights |
| `--border-neutral-muted` | foreground @ 15% alpha | foreground @ 20% alpha | Neutral pill outlines, translator inputs |
| `--success-surface` / `--success-border` / `--success-foreground` | mint / green / deep green | green glaze variants | Success toasts, Quick Practice “Correct” state |
| `--error-surface` / `--error-border` / `--error-foreground` | rose / primary red / primary red | wine glaze variants | Error feedback, depleted hearts |

Utility classes (`bg-surface-elevated`, `bg-surface-frosted`, `border-accent-red`, `bg-success-soft`, `text-success-strong`, etc.) are registered in `app/globals.css` so components can consume the palette without re-declaring inline colors.

## Backgrounds & Surfaces

- **Base background:** `bg-[var(--brand-cream)]` for pages to echo the red/gold palette without overwhelming the UI.
- **Cards & popovers:** `bg-[var(--brand-cream-light)]` with subtle `border-[var(--border)]` to feel like parchment layers.
- **Chrome/dividers:** Keep muted neutrals (`#f2d7a8`) so CTAs in red/gold are unmistakable.

## Buttons & CTAs

- **Primary CTA (Practice, Continue lesson):** `bg-[var(--brand-red)]` with `border-[var(--brand-red-dark)]`, `text-white`, and `focus:ring-[color:rgb(215_38_61_/_0.35)]`.
- **Secondary CTA (Translator, Resources):** `bg-[var(--brand-gold)]`, `border-[var(--brand-gold-dark)]`, `text-[#281501]`, hover shifts to the darker gold tone.
- **Tertiary / Outline:** Use transparent backgrounds with `border-[var(--brand-red)]` and `text-[var(--brand-red)]`, filling on hover.
- **Focus Rings:** Default focus color is `var(--brand-red)`; reserve the green ring for explicit success confirmations only.

## Feedback & Badges

- Success banners (Quick Practice correct state) should use `bg-[var(--brand-mint)]` with `border-[var(--brand-green)]` and `text-[var(--brand-green-dark)]`.
- Error banners use `bg-[var(--brand-rose)]`, `border-[var(--brand-red)]`, `text-[var(--brand-red)]`.
- Hearts/Streak indicators should reference `var(--brand-red)` so their color matches other streak/destructive states.

## Gradients & Confetti

- Replace arbitrary neon gradients with mixes of the core palette. For confetti arrays or background gradients, stick to `[var(--brand-green)]`, `[var(--brand-gold)]`, `[var(--brand-red)]`, and `[var(--brand-plum)]` plus a cool accent (e.g. `#0ea5e9`) for contrast.

Following these tokens keeps the app visually tied to Macedonian flag colors (red + gold) while preserving the fresh green CTA inspired by the learning experience. When in doubt, map new UI to one of the tokens above before inventing a new hex value. If a genuine new color is required, add the token to `app/globals.css` first, then consume it via `var(--token-name)`.
