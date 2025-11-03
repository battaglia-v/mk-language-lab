# Documentation Updates (Wiki Source)

Use this file as the canonical source when updating the GitHub Wiki page `Documentation-Updates`.

> **Last Updated**: 2025-11-03  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

## How to Publish to the Wiki

1. Clone the wiki repo if you have not already: `git clone git@github.com:battaglia-v/mk-language-lab.wiki.git`
2. Copy the relevant sections from this file into `Documentation-Updates.md` inside the wiki repository.
3. Commit and push to publish: `git add Documentation-Updates.md && git commit -m "Update documentation log" && git push`.
4. Verify the page at `https://github.com/battaglia-v/mk-language-lab/wiki/Documentation-Updates`.

## 2025-11-03
- Captured the new minute-level progress labels, updated localisation strings, and documented the `logSession({ durationMinutes })` flow for journeys.

## 2025-11-02
- Wired the journey hero metrics to `useJourneyProgress` via `HeroProgressSummary` and refreshed the journeys feature guide.

## 2025-10-27
- Established new documentation framework: created `docs/index.md`, architecture overview, API references, feature guides, localization docs, operations guides, and tutor roadmap.
- Added change-log process (`docs/change-log.md`) and wiki publication workflow.
