# Design System

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

The design system provides reusable UI primitives under `components/ui/`. These components enforce consistent styling, accessibility, and interaction patterns across the multilingual app.

## Component Inventory

| Component | Location | Notes |
| --- | --- | --- |
| `Button` | `components/ui/button.tsx` | Variants (`default`, `outline`, `ghost`, etc.) with keyboard focus states. |
| `Card` | `components/ui/card.tsx` | Composition primitives for feature screens. |
| `Tabs` | `components/ui/tabs.tsx` | Supports tab navigation for Learn modules. |
| `Dialog` | `components/ui/dialog.tsx` | Accessible modal wrapper using Radix UI under the hood. |
| `Avatar` | `components/ui/avatar.tsx` | Fallback initials and image handling for user profiles. |
| `Input`, `Textarea`, `Select` | `components/ui/*` | Form primitives matching brand tokens. |
| `Badge` | `components/ui/badge.tsx` | Status labels for journeys and practice modules. |
| `DropdownMenu` | `components/ui/dropdown-menu.tsx` | Contextual actions, builds on Radix UI. |

## Tokens & Theming

- Colors and typography are defined in `app/globals.css` and can be surfaced as design tokens in future iterations.
- Components expose `className` overrides to extend styling while keeping base interactions consistent.

## Usage Guidelines

1. Favor existing primitives before introducing bespoke UI.
2. Prefer composition (e.g., `Card` + `CardHeader` + `CardContent`) over duplicating layout styles.
3. When accessibility behavior differs from default, document the decision and update this file.
4. Include Storybook or screenshot references when available (TODO).

## Contribution Checklist

- [ ] Update this document when adding or materially changing a UI primitive.
- [ ] Add unit and visual regression coverage where applicable.
- [ ] Coordinate with localization to ensure component labels support both Macedonian and English strings.

## Roadmap

- Formalize design tokens and export to Figma for designer handoff.
- Document animation and motion patterns.
- Capture shared iconography usage guidelines.
