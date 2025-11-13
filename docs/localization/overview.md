# Localization Overview

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

Македонски • MK Language Lab supports Macedonian (`mk`) and English (`en`) locales. Localization is handled during render via the `TranslationProvider`, with message bundles stored in `messages/*.json`.

## Workflow

1. **Author Strings**: Introduce new keys in `messages/en.json` using dot-notation namespaces (e.g., `learn.quickPractice.title`).
2. **Sync Macedonian**: Provide translations in `messages/mk.json`, ensuring key parity. Use the glossary to keep terminology consistent.
3. **Update Components**: Client and server components consume translations via `useTranslations()` or helper utilities from `lib/translation-provider.ts`.
4. **Review**: Cross-reference new strings with `docs/localization/glossary.md` and run the QA checklist before merging.

## Provider Mechanics

- `TranslationProvider` loads the correct bundle based on the App Router locale segment (`app/[locale]/`).
- Server components receive translations through props; client components use hooks.
- Fallback to English occurs when a key is missing in Macedonian. Track missing keys via console warnings (TODO: add automated detection).

## Key Considerations

- Keep JSON files ASCII; escape special characters as needed (Cyrillic is acceptable where required).
- Avoid interpolating HTML in translation strings; prefer React placeholders.
- For long-form content, store Markdown files per locale instead of huge JSON payloads (future enhancement).

## Tooling

- Run `pnpm lint` to ensure JSON formatting and TypeScript types remain valid.
- Future automation: script to validate key parity and surface missing translations in CI.
