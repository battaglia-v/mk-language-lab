# Quick Start: Agent Orchestration

## What is This?

The MK Language Lab uses an AI agent orchestration system to parallelize development work. Think of it as a project manager that coordinates multiple AI assistants working on different parts of the codebase simultaneously.

## 5-Minute Setup

### 1. View Current Status

```bash
# See what agents are doing
npm run agents:orchestrate -- --dry-run
```

This shows you which tasks are ready to launch, in progress, or blocked.

### 2. Launch Agents

```bash
# Launch all ready tasks (up to 3 at once)
npm run agents:orchestrate

# Use advanced AI model (chatGPT-5 codex)
npm run agents:orchestrate -- --advanced-model
```

### 3. Monitor Progress

Open your browser to `/agents` or run:

```bash
# Watch the status file
watch cat data/sub-agents-status.json
```

## Common Commands

```bash
# Preview what would launch (safe)
npm run agents:orchestrate -- --dry-run

# Launch specific task
npm run agents:orchestrate -- A0-design-tokens

# Force launch even if dependencies aren't ready
npm run agents:orchestrate -- A1-ui-shell --force

# Use advanced model for all tasks
npm run agents:orchestrate -- --advanced-model
```

## Understanding the Dashboard

Visit `/agents` to see:

- **Active agents** - Number currently working
- **Pending queue** - Waiting on dependencies
- **Blocked** - Need manual intervention
- **Complete** - Finished tasks
- **Launch Readiness** - Overall progress percentage

Each task card shows:
- Progress bar (0-100%)
- Dependencies (what must complete first)
- Highlights (recent achievements)
- Blockers (what's preventing progress)

## Task Lifecycle

```
pending → in_progress → complete
    ↓
  blocked (needs fix) → in_progress
```

## The 9 Agents

1. **A0-design-tokens** - Creates color, typography, spacing system
2. **A1-ui-shell** - Builds header, sidebar, layout foundation
3. **A2-translator-core** - Implements translation with streaming
4. **A3-quick-practice** - Builds flashcard system
5. **A4-resources-panel** - Creates learning resources page
6. **A5-performance** - Optimizes bundle size and loading
7. **A6-accessibility-tests** - Adds Playwright + a11y tests
8. **A7-content-cleanup** - Removes unused pages
9. **A8-theming-and-components** - Applies dark theme everywhere
10. **A9-ci-cd** - Sets up CI/CD pipeline

## Dependencies

Some tasks must wait for others:

```
A0 (tokens) must complete before:
  ├── A1 (UI shell)
  └── A8 (theming)

A1 (UI shell) must complete before:
  ├── A2 (translator)
  ├── A3 (practice)
  ├── A4 (resources)
  └── A5 (performance)
```

## AI Models

### Standard Model (gpt-4o)
Used for most tasks. Fast and reliable.

### Advanced Model (chatgpt-5-codex)
Used for complex tasks:
- A2-translator-core (streaming APIs)
- A5-performance (optimization)
- A9-ci-cd (workflow automation)

Activate with `--advanced-model` flag.

## When Things Go Wrong

### Agent is Stuck

```bash
# Check what's blocking it
cat data/sub-agents-status.json | jq '.[] | select(.id=="A1-ui-shell")'

# Manually fix the issue in code

# Mark as ready and relaunch
npm run agents:orchestrate -- A1-ui-shell --force
```

### Dependencies Not Met

```bash
# See what's needed
npm run agents:orchestrate -- --dry-run

# Check dependency completion
cat docs/PROJECT_PLAN.json | jq '.tasks[] | {id, dependencies}'

# Complete dependencies first, or force if needed
npm run agents:orchestrate -- A1-ui-shell --force
```

### No Tasks Ready

All tasks are either:
- Already running (check dashboard)
- Waiting on dependencies (complete those first)
- Already complete (you're done! 🎉)

## Manual Status Updates

Edit `data/sub-agents-status.json` to:

```json
{
  "id": "A1-ui-shell",
  "status": "pending",     // Change from "blocked" or "in_progress"
  "blockers": [],          // Clear blockers
  "progress": 85           // Update progress %
}
```

Then relaunch:

```bash
npm run agents:orchestrate -- A1-ui-shell
```

## Tips

1. **Start with A0** - Design tokens are needed by most other tasks
2. **Use dry-run** - Always preview before launching
3. **Check dependencies** - Don't force-launch without good reason
4. **Monitor the dashboard** - Refresh `/agents` to see real-time status
5. **Limit parallelism** - Max 3 agents at once prevents conflicts

## Next Steps

- Read [ORCHESTRATION.md](./ORCHESTRATION.md) for detailed docs
- Check [PROJECT_PLAN.json](../PROJECT_PLAN.json) for task definitions
- View [agent-config.json](./agent-config.json) for model settings
- Review [handbook.md](./handbook.md) for coding standards

## Getting Help

```bash
# Show help
npm run agents:orchestrate -- --help

# View orchestrator source
cat scripts/orchestrate-agents.ts
```

Questions? Check the [full orchestration docs](./ORCHESTRATION.md) or open an issue.
