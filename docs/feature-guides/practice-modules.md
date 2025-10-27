# Practice Modules

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

Practice modules deliver targeted exercises across vocabulary, pronunciation, grammar, and phrases. Routes reside under `app/[locale]/learn/` with child segments for each module.

## Module Map

| Route | Component | Data Source |
| --- | --- | --- |
| `app/[locale]/learn/page.tsx` | Overview hub | Aggregates modules and pulls copy from `messages/*`. |
| `app/[locale]/learn/vocabulary/page.tsx` | Vocabulary module | `data/practice-vocabulary.json`, `data/practice.ts`. |
| `app/[locale]/learn/pronunciation/page.tsx` | Pronunciation module | `data/practice.ts`. |
| `app/[locale]/learn/phrases/page.tsx` | Phrase drills | `data/practice.ts`, `journey-practice-content.ts`. |
| `app/[locale]/learn/grammar/page.tsx` | Grammar focus | `data/practice.ts`. |

## Widget Architecture

- `QuickPracticeWidget.tsx` renders contextual drills in dashboards and reuses practice data.
- Widgets consume translation strings (e.g., `learn.quickPractice.title`) to support both Macedonian and English locales.
- Feature toggles and experiment hooks should be documented here when introduced.

## Testing Strategy

- Use Vitest + React Testing Library to validate widget rendering (`QuickPracticeWidget.test.tsx`).
- Mock translation providers in tests to ensure deterministic snapshots.

## Future Enhancements

- Add success metrics (completion counts) once Prisma models exist.
- Document audio resource pipeline for pronunciation exercises.
- Capture accessibility guidelines for interactive practice components.
