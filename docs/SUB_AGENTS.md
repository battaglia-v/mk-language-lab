# MK Language Lab – Sub-agent Assignments

The UI overhaul is split across 10 tightly-scoped sub-agents. You can now monitor their telemetry in real time at [`/agents`](../app/agents/page.tsx), which powers the live dashboard in the deployed app via `/api/sub-agents`.

## Mission Control Dashboard
- **Live data source:** `docs/PROJECT_PLAN.json` + `data/sub-agents-status.json`
- **API:** `GET /api/sub-agents` (server-rendered + client polling every 8s)
- **UI endpoint:** `/agents` → “Sub-agent mission control” (includes summaries, blockers, dependencies, and highlights)
- **Launch CLI:** `npm run agents:launch -- --tasks <comma-separated-task-ids> --note "context"` to stamp in-progress agents with a launch event that appears in the dashboard.

## Assignment Table
| Task ID | Sub-agent | Mandate | Dependencies | Status | Progress |
|---------|-----------|---------|--------------|--------|----------|
| A0-design-tokens | Agent-A0 | Build comprehensive dark-theme token library (JSON + CSS) and gradient class. | None | 🚀 In progress | 62% |
| A1-ui-shell | Agent-A1 | Implement global layout shell (header, sidebar, responsive foundation) consuming A0 tokens. | A0 | 🚀 In progress | 38% |
| A2-translator-core | Agent-A2 | Rebuild translator UI with skeletons, streaming output, and local history storage. | A0, A1 | ⏳ Pending | 5% |
| A3-quick-practice | Agent-A3 | Ship flashcard experience with keyboard shortcuts and history integration. | A0, A1, A2 | ⏳ Pending | 0% |
| A4-resources-panel | Agent-A4 | Deliver searchable, lazy-loaded resources experience with skeletons. | A0, A1 | ⏳ Pending | 12% |
| A5-performance | Agent-A5 | Optimize performance with skeleton kit, lazy routing, caching, and bundle reports. | A1 | ⏳ Pending | 0% |
| A6-accessibility-tests | Agent-A6 | Expand E2E + accessibility coverage via Playwright and axe-core; add PR checklist. | A1, A2, A3, A4 | ⏳ Pending | 0% |
| A7-content-cleanup | Agent-A7 | Remove deprecated content/pages leaving only Translate, Practice, Resources. | None | 🚀 In progress | 44% |
| A8-theming-and-components | Agent-A8 | Apply tokens to components (buttons, inputs, cards) with documentation. | A0 | ⏳ Pending | 3% |
| A9-ci-cd | Agent-A9 | Establish CI/CD with preview deploys and performance budgets. | A5, A6 | ⏳ Pending | 0% |

## Parallel Execution Notes
- Agents A0, A1, and A7 remain active per the original request and now broadcast their highlights + blockers.
- Remaining agents are staged and will begin once their dependencies are satisfied.
- Update `data/sub-agents-status.json` (progress, blockers, highlights) to immediately reflect inside the `/agents` dashboard.
- Use the `agents:launch` script whenever an in-progress track actually kicks off so we get auditable `launchedAt` timestamps and notes alongside telemetry.
