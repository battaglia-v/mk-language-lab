# Project Documentation Hub

Use this folder to track active initiatives, their plans, and outcomes. Each project gets its own subfolder named `YYYY-MM-keywords/` (e.g., `2025-11-homepage-refresh/`). Inside create:

- `brief.md` – problem statement, goals, constraints, stakeholders.
- `execution_steps.md` – task breakdown using the Step Template from `docs/agents/execution-guide.md`.
- `findings.md` – results, metrics, follow-up work, and lessons learned.
- `artifacts/` (optional) – screenshots, traces, diagrams.

## Workflow
1. When kicking off work, copy the `_template/` folder and rename it.
2. During delivery, update `execution_steps.md` and cite it in PRs.
3. After completion, summarize outcomes in `findings.md` and add any cross-cutting insights to `docs/agents/change-log.md`.

Keeping project docs here maximizes shared context without overwhelming the main agent instructions.
