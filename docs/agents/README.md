# Agent Handbook Overview

Welcome to the shared knowledge base for all AI and human agents collaborating on this repo. These files replace `AGENT_SYNC.md`, `AGENTS.md`, and other scattered notes.

## Required Reading Order
1. `docs/agents/handbook.md` – repository structure, coding standards, safety guardrails.
2. `docs/agents/execution-guide.md` – step-by-step delivery workflow, verification expectations, and lessons-learned template.
3. `docs/agents/workflow-phases.md` – communication protocol for intake, clarification, and synthesis.
4. `docs/agents/change-log.md` – the latest cross-cutting updates you must know before committing code.

## Expectations
- **Before writing code**, skim the change log and confirm nothing conflicts with your plan.
- **After finishing meaningful work**, add a concise entry to `docs/agents/change-log.md` (date, files touched, impact, commit SHA).
- **Document initiatives** in `docs/projects/<project>/` so future agents can see what shipped, how, and why.
- Keep files lean; archive stale content under `docs/agents/archive/`.

## Updating This Folder
Every PR that affects shared patterns, workflows, or infrastructure must:
1. Update the relevant file(s) here.
2. Mention the change log update in the PR description (copy/paste the new entry).
3. Ensure the new guidance is reflected in active project docs under `docs/projects/`.

Following this structure ensures Copilot, Claude, Codex, and human teammates all read the same vetted instructions.
