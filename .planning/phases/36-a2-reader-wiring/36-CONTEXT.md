# Phase 36: A2 Reader Wiring - Context

**Gathered:** 2026-01-10
**Status:** Ready for planning

<vision>
## How This Should Work

Users open the Reader section and see stories organized by level — clear sections like "A1 - Beginner", "A2 - Elementary", "B1 - Intermediate" with stories grouped under each. This makes it immediately obvious which content matches their current ability.

The A2 stories (My Job, Hobbies, The Holiday) that already exist in data/graded-readers.json become accessible through the same reader UI that A1 stories currently use. Users who've used the Reader before will find A2 stories work exactly the same way — no surprises, just more content at a higher level.

</vision>

<essential>
## What Must Be Nailed

- **Consistent reader experience** — A2 stories work exactly like A1 stories do today. Same look, same interactions, same reading flow.
- **Level organization is clear** — Stories are grouped by level so users immediately understand which ones match their ability.
- **A2 content actually appears** — The existing A2 stories become accessible, resolving ISS-001.

</essential>

<boundaries>
## What's Out of Scope

- Tap-to-translate word lookup — that's Phase 37
- Save words while reading — that's Phase 38
- Reading progress tracking — that's Phase 39
- Advanced filtering/discovery — that's Phase 40

This phase is about wiring existing content and organizing the library view, not adding new reader features.

</boundaries>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches that match existing reader patterns.

</specifics>

<notes>
## Additional Context

ISS-001 (deferred issue) explicitly calls out: "Wire A2 graded readers to reader UI — content exists, not wired." This phase closes that issue.

Existing graded reader content is in data/graded-readers.json with 4 stories each at A1, A2, and B1 levels (12 total).

</notes>

---

*Phase: 36-a2-reader-wiring*
*Context gathered: 2026-01-10*
