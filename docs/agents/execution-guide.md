# Step-by-Step Execution Guide

Use this guide to break complex tasks into safe, testable increments. Every active initiative should maintain an `execution_steps.md` file (stored alongside the project docs under `docs/projects/<project>/`).

## Process Overview
1. **Plan** – Break the task into discrete steps (10–30 minutes each) with clear success criteria and dependencies.
2. **Implement** – Make the minimal changes required for the current step.
3. **Verify** – Run the agreed tests and sanity checks for that step only.
4. **Commit** – Once the step passes verification, commit it before moving on.
5. **Record** – Update the project’s `execution_steps.md` with status, notes, and lessons.

## Step Template
```
## Step N: [Action-Oriented Title]

**Objective**: [Goal]

**Files to Modify**:
- [File + note]

**Changes Required**:
- [Specific change]

**Success Criteria**:
- [Testable outcome]

**Verification Steps**:
1. [Command/check]

**Dependencies**: [Prior steps]
**Risk Level**: [Low/Medium/High]
```

## Continuous Learning Loop
When a step teaches you something important:
1. Pause implementation.
2. Add an entry to the project’s `execution_steps.md` under “Lessons Learned and Step Improvements” using this template:
```
### Insight: [summary]
**Discovered During**: [step name]
**Issue**: [what happened]
**Root Cause**: [why]
**Improvement**: [prevent/handle next time]
**Steps Updated**: [list]
```
3. Update the remaining steps/verification instructions accordingly.
4. If the lesson affects other teams/features, add a note to `docs/agents/change-log.md`.

## Reminders
- Keep each step independent so failures are easy to isolate and roll back.
- Never proceed to the next step if the current one fails its verification.
- Reference the `workflow-phases.md` file for the intake → clarification → synthesis communication loop.
- Mention in every PR which steps were completed and link to the relevant project folder.

Consistently applying this process reduces risk, keeps context windows small, and makes progress easy to audit.
