# Design Tokens – Macedonian Palette

Last updated: November 2025

## Core Colors

| Token | Hex | Usage |
| --- | --- | --- |
| `--brand-red` | `#D7263D` | Primary brand, headlines, destructive states |
| `--brand-red-dark` | `#B4162B` | Hover/active states for red CTAs |
| `--brand-gold` | `#F7C948` | Secondary brand, accent highlights, dividers |
| `--brand-gold-dark` | `#D8A524` | Hover/active for gold CTAs |
| `--brand-green` | `#2FBF71` | Positive actions (Check button, Practice CTA) |
| `--brand-green-dark` | `#208F56` | Hover/active for success buttons & borders |
| `--brand-mint` | `#DFF6EA` | Success feedback background |
| `--brand-rose` | `#FFE3E3` | Error feedback background |
| `--brand-navy` | `#101828` | App chrome in light mode |
| `--brand-plum` | `#4C1D95` | Accent gradients & depth layers |

The CSS variables live in `app/globals.css`. Access them via Tailwind’s arbitrary value syntax: e.g. `bg-[var(--brand-green)]`, `hover:bg-[var(--brand-green-dark)]`, `border-[var(--brand-red)]`.

## Buttons & CTAs

- **Primary CTA (Practice, Check Answer):** `bg-[var(--brand-green)]` with a `border-[var(--brand-green-dark)]` drop-shadow. Use `hover:bg-[var(--brand-green-dark)]` and keep `text-white`.
- **Secondary CTA (Resources, outline buttons):** `bg-[var(--brand-gold)]`, `border-[var(--brand-gold-dark)]`, and `text-[#1f1403]`. Outline buttons can keep Tailwind’s `variant="outline"` as long as the icon/text use `text-primary`.
- **Focus Rings:** `focus:ring-[color:rgb(47_191_113_/_0.25)]` for success actions to keep accessible contrast.

## Feedback & Badges

- Success banners (Quick Practice correct state) should use `bg-[var(--brand-mint)]` with `border-[var(--brand-green)]` and `text-[var(--brand-green-dark)]`.
- Error banners use `bg-[var(--brand-rose)]`, `border-[var(--brand-red)]`, `text-[var(--brand-red)]`.
- Hearts/Streak indicators should reference `var(--brand-red)` so their color matches other destructive states.

## Gradients & Confetti

- Replace arbitrary neon gradients with mixes of the core palette. For confetti arrays or background gradients, stick to `[var(--brand-green)]`, `[var(--brand-gold)]`, `[var(--brand-red)]`, and `[var(--brand-plum)]` plus a cool accent (e.g. `#0ea5e9`) for contrast.

Following these tokens keeps the app visually tied to Macedonian flag colors (red + gold) while preserving the fresh green CTA inspired by the learning experience. When in doubt, map new UI to one of the tokens above before inventing a new hex value. If a genuine new color is required, add the token to `app/globals.css` first, then consume it via `var(--token-name)`.
