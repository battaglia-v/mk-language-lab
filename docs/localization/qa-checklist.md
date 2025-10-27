# Localization QA Checklist

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

Complete this checklist before publishing localization updates.

## Pre-Merge

- [ ] English and Macedonian message files contain matching keys.
- [ ] New strings follow established casing and punctuation conventions.
- [ ] Glossary entries updated or confirmed for new terminology.
- [ ] Layout verified for both locales (no overflow or clipped text).
- [ ] RTL/LTR assumptions checked (currently only LTR, but ensure no mirrored icons).

## Testing

- [ ] Run `pnpm lint` and `pnpm test` to catch compile or unit errors.
- [ ] Manually smoke test high-traffic pages (`/[locale]/learn`, `/[locale]/journey`, `/[locale]/tutor`).
- [ ] Validate translator tools (`/translate`) with new strings when relevant.

## Post-Deploy

- [ ] Update Drive PDF exports for key docs if significant copy changed.
- [ ] Announce localization updates in the team channel with screenshots.
