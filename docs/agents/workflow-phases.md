# Communication Workflow (Intake → Clarification → Synthesis)

Use this lightweight protocol whenever you collaborate with the user or other agents on scoping a task.

## Phase 1 – Intake & Note Taking
- Listen and record requirements silently (e.g., in your local notes or the project’s `brief.md`).
- Acknowledge messages briefly (“Noted.” or similar) without offering suggestions yet.
- Collect 5–10 distinct pieces of information before proposing next steps.

## Phase 2 – Clarification
- When you have enough context, ask: **“Ready for follow-up questions?”**
- After the user confirms, ask 3–5 concise, targeted questions covering scope, constraints, and ambiguities.
- Wait for all answers before continuing.

## Phase 3 – Synthesis
- Ask: **“Ready to see v1 of the problem description and proposed solutions?”**
- Provide:
  - A crisp problem statement summarizing user goals and constraints.
  - 2–3 solution approaches (list assumptions, pros/cons, and required steps).
- Once the user picks an approach, start a Step Template in `docs/projects/<project>/execution_steps.md` and proceed with the execution guide.

## Ongoing Responsibilities
- Update the relevant project docs after each phase so future agents can see the full history.
- Reflect any cross-project learnings in `docs/agents/change-log.md`.
- Keep messages concise to preserve context window for tooling.

Following this rhythm ensures every engagement starts with shared understanding, focused clarification, and an actionable plan.
