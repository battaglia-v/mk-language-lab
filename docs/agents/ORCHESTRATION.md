# Sub-Agent Orchestration System

## Overview

The MK Language Lab agent orchestration system enables parallel execution of development tasks using AI-powered agents. This system coordinates work across multiple agents based on task dependencies, priorities, and AI model capabilities.

## Architecture

### Components

1. **PROJECT_PLAN.json** - Defines all tasks with dependencies, deliverables, and acceptance criteria
2. **sub-agents-status.json** - Tracks real-time status of each agent's work
3. **agent-config.json** - Configures AI models and capabilities for each agent
4. **orchestrate-agents.ts** - Core orchestration script for parallel execution
5. **SubAgentMonitor** - React dashboard for visualizing agent progress

### Task States

- **pending** - Task is waiting for dependencies to complete
- **in_progress** - Agent is actively working on the task
- **blocked** - Task encountered a blocker and needs intervention
- **complete** - Task has been successfully completed

## Usage

### Quick Start

```bash
# Preview what would be launched (dry run)
npm run agents:orchestrate -- --dry-run

# Launch all ready tasks with default models
npm run agents:orchestrate

# Launch all ready tasks with advanced models
npm run agents:orchestrate -- --advanced-model

# Launch a specific task
npm run agents:orchestrate -- A0-design-tokens

# Force launch a task (ignore dependency checks)
npm run agents:orchestrate -- A0-design-tokens --force
```

### Monitoring Progress

Visit `/agents` in your browser to see the live dashboard, or check:

```bash
# View current status
cat data/sub-agents-status.json

# Watch for changes (requires entr or similar)
ls data/sub-agents-status.json | entr cat $_
```

## Configuration

### Agent Configuration (agent-config.json)

Each agent can be configured with:

```json
{
  "A0-design-tokens": {
    "name": "Design Tokens Agent",
    "model": "gpt-4o",
    "capabilities": ["design-systems", "css", "theming"],
    "maxParallelism": 1,
    "priority": "high"
  }
}
```

**Fields:**
- `name` - Human-readable agent name
- `model` - AI model to use (gpt-4o, chatgpt-5-codex, etc.)
- `capabilities` - List of agent specializations
- `maxParallelism` - Max concurrent instances of this agent
- `priority` - Task priority (high, medium, low)

### Orchestration Settings

```json
{
  "orchestration": {
    "maxConcurrentAgents": 3,
    "retryAttempts": 2,
    "timeoutMinutes": 30,
    "checkDependencies": true
  }
}
```

**Fields:**
- `maxConcurrentAgents` - Maximum number of agents running simultaneously
- `retryAttempts` - Number of retries for failed tasks
- `timeoutMinutes` - Timeout for agent execution
- `checkDependencies` - Whether to enforce dependency checking

## AI Models

### Available Models

- **gpt-4o** - Standard model for most tasks
- **chatgpt-5-codex** - Advanced model for complex coding tasks

### Model Selection Strategy

High-priority and complex tasks use `chatgpt-5-codex`:
- A2-translator-core (streaming, API integration)
- A5-performance (optimization, bundling)
- A9-ci-cd (workflow automation)

Standard tasks use `gpt-4o`:
- UI components
- Content cleanup
- Documentation updates

## Workflow

### 1. Planning Phase

Define tasks in `docs/PROJECT_PLAN.json`:

```json
{
  "id": "A0-design-tokens",
  "title": "Create global design tokens & dark theme variables",
  "description": "Set up all color, spacing, typography...",
  "deliverables": ["design-tokens.json", "globals.css"],
  "acceptance_criteria": ["All tokens defined in JSON and CSS"],
  "dependencies": []
}
```

### 2. Launch Phase

Orchestrator analyzes:
- Current task status
- Dependency completion
- Available agent capacity
- Task priorities

Then launches ready tasks in parallel up to `maxConcurrentAgents`.

### 3. Execution Phase

Each agent:
1. Reads its task definition from PROJECT_PLAN.json
2. Checks dependencies and blockers
3. Executes the work following acceptance criteria
4. Updates sub-agents-status.json with progress
5. Reports completion or blockers

### 4. Monitoring Phase

Track progress via:
- Dashboard at `/agents` (auto-refreshes every 8 seconds)
- JSON file at `data/sub-agents-status.json`
- GitHub PR comments (if integrated with CI/CD)

## Task Dependencies

Dependencies are automatically enforced:

```json
{
  "id": "A1-ui-shell",
  "dependencies": ["A0-design-tokens"]
}
```

This ensures A1 won't start until A0 is complete.

### Dependency Graph

```
A0-design-tokens
├── A1-ui-shell
│   ├── A2-translator-core
│   │   └── A3-quick-practice
│   ├── A4-resources-panel
│   └── A5-performance
│       └── A6-accessibility-tests
│           └── A9-ci-cd
└── A8-theming-and-components

A7-content-cleanup (no dependencies)
```

## Advanced Usage

### Custom Model Override

Force a specific task to use the advanced model:

```bash
# Edit agent-config.json
{
  "A1-ui-shell": {
    "model": "chatgpt-5-codex"  // Override default
  }
}

# Or use CLI flag for all tasks
npm run agents:orchestrate -- --advanced-model
```

### Parallel Execution Limits

Adjust concurrent agents based on system resources:

```json
{
  "orchestration": {
    "maxConcurrentAgents": 5  // Increase for more parallelism
  }
}
```

### Handling Blockers

When an agent reports a blocker:

1. Review the blocker in the dashboard or status JSON
2. Manually resolve the issue
3. Update status to remove blocker:

```bash
# Edit data/sub-agents-status.json
{
  "id": "A1-ui-shell",
  "status": "in_progress",  // Change from "blocked"
  "blockers": []             // Clear blockers array
}
```

4. Re-launch the agent:

```bash
npm run agents:orchestrate -- A1-ui-shell --force
```

## Integration with GitHub Copilot

### Using Custom Agents

This system is designed to work with GitHub Copilot's agent features:

1. Each task in PROJECT_PLAN.json represents a distinct unit of work
2. Agent configurations specify model preferences and capabilities
3. The orchestrator coordinates parallel execution

### Chat Mode Integration

Tasks can be launched via Copilot Chat:

```
@workspace Launch agent A0-design-tokens
@workspace Check agent status
@workspace Show agents ready to launch
```

## Troubleshooting

### No Tasks Ready to Launch

**Cause:** All tasks are complete, in progress, or waiting on dependencies

**Solution:**
```bash
# Check status
npm run agents:orchestrate -- --dry-run

# View dependency graph
cat docs/PROJECT_PLAN.json | jq '.tasks[] | {id, dependencies}'

# Force launch if needed
npm run agents:orchestrate -- A0-design-tokens --force
```

### Agent Stuck in Progress

**Cause:** Agent may have failed without updating status

**Solution:**
```bash
# Manually update status in data/sub-agents-status.json
# Set status to "blocked" or "pending"

# Re-launch
npm run agents:orchestrate -- <task-id> --force
```

### Dependency Cycle Detected

**Cause:** Circular dependencies in PROJECT_PLAN.json

**Solution:**
```bash
# Find the cycle
cat docs/PROJECT_PLAN.json | jq '.tasks[] | {id, dependencies}'

# Break the cycle by removing one dependency
# Update PROJECT_PLAN.json
```

## Best Practices

### 1. Task Granularity

Keep tasks focused and achievable in 2-4 hours:
- ✅ "Implement translator UI skeleton"
- ❌ "Build entire translation feature"

### 2. Clear Acceptance Criteria

Define testable outcomes:
- ✅ "All tokens defined in JSON and CSS"
- ❌ "Tokens look good"

### 3. Minimal Dependencies

Only declare true blocking dependencies:
- ✅ UI shell needs design tokens
- ❌ Everything depends on everything

### 4. Progress Updates

Agents should update status frequently:
- Every major milestone
- When encountering blockers
- At least once per day

### 5. Model Selection

Use advanced models for:
- Complex algorithmic work
- Large-scale refactoring
- Performance optimization
- Novel feature development

Use standard models for:
- UI component updates
- Content changes
- Documentation
- Simple bug fixes

## Future Enhancements

Planned improvements:
- [ ] GitHub Actions integration for CI/CD automation
- [ ] Slack/Discord notifications for status changes
- [ ] Automatic PR creation per task
- [ ] Resource usage tracking and optimization
- [ ] Agent performance metrics
- [ ] Conflict detection between parallel agents
- [ ] Automatic dependency resolution
- [ ] Multi-repository coordination

## Support

For questions or issues:
1. Check the [Agent Handbook](./handbook.md)
2. Review [Execution Guide](./execution-guide.md)
3. Check [Change Log](./change-log.md) for recent updates
4. Open an issue on GitHub

## References

- [PROJECT_PLAN.json](../PROJECT_PLAN.json) - Complete task definitions
- [Agent Config](./agent-config.json) - Model and capability settings
- [Sub-Agent Monitor](/agents) - Live dashboard
- [Agent Handbook](./handbook.md) - Repository guidelines
