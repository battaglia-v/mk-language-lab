# Agent Orchestration System

## Quick Links

- 🚀 [Quick Start Guide](./QUICK_START.md) - Get started in 5 minutes
- 📚 [Full Documentation](./ORCHESTRATION.md) - Complete reference
- 📊 [Live Dashboard](/agents) - Monitor agent progress
- 🎯 [Project Plan](../PROJECT_PLAN.json) - All task definitions
- ⚙️ [Agent Config](./agent-config.json) - Model & capability settings

## What is This?

The MK Language Lab Agent Orchestration System enables **parallel development** using AI-powered agents. Each agent specializes in a specific task (like design tokens, UI shell, translator, etc.) and works independently based on a structured plan.

### Key Benefits

✅ **Parallel Execution** - Multiple agents work simultaneously  
✅ **Dependency Management** - Automatic coordination based on task dependencies  
✅ **Model Selection** - Use standard (gpt-4o) or advanced (chatGPT-5 codex) models  
✅ **Real-time Monitoring** - Live dashboard shows progress  
✅ **Safe Testing** - Dry-run mode previews changes  
✅ **GitHub Integration** - Automated issue creation and CI/CD workflows

## The 9 Agent Tasks

| ID | Agent | Priority | Model | Status |
|----|-------|----------|-------|--------|
| A0 | Design Tokens | High | gpt-4o | In Progress |
| A1 | UI Shell | High | gpt-4o | In Progress |
| A2 | Translator Core | High | **chatGPT-5 codex** | In Progress |
| A3 | Quick Practice | Medium | gpt-4o | In Progress |
| A4 | Resources Panel | Medium | gpt-4o | In Progress |
| A5 | Performance | High | **chatGPT-5 codex** | In Progress |
| A6 | Accessibility Tests | High | gpt-4o | In Progress |
| A7 | Content Cleanup | Low | gpt-4o | In Progress |
| A8 | Theming & Components | Medium | gpt-4o | In Progress |
| A9 | CI/CD | High | **chatGPT-5 codex** | In Progress |

## Commands

### Orchestration

```bash
# Preview what will launch (safe)
npm run agents:orchestrate -- --dry-run

# Launch all ready tasks
npm run agents:orchestrate

# Use advanced AI model (chatGPT-5 codex)
npm run agents:orchestrate -- --advanced-model

# Launch specific task
npm run agents:orchestrate -- A0-design-tokens

# Force launch (ignore dependencies)
npm run agents:orchestrate -- A1-ui-shell --force
```

### GitHub Issues

```bash
# Preview issue creation
npm run agents:create-issues -- --dry-run

# Create issues for all pending tasks
npm run agents:create-issues

# Create issue for specific task
npm run agents:create-issues -- A0-design-tokens
```

### Manual Status Updates

```bash
# Mark tasks as launched (old script)
npm run agents:launch

# View current status
cat data/sub-agents-status.json | jq '.'
```

## Monitoring

### Web Dashboard

Visit `/agents` in your browser to see:
- Active agent count
- Pending queue
- Blocked tasks
- Completion progress
- Individual task cards with details

The dashboard auto-refreshes every 8 seconds.

### CLI Monitoring

```bash
# Watch status file
watch -n 5 cat data/sub-agents-status.json

# Check orchestration history
gh run list --workflow=agent-orchestration.yml

# View GitHub issues
gh issue list --label agent-task
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              PROJECT_PLAN.json                       │
│         (Task definitions & dependencies)            │
└────────────┬────────────────────────────────────────┘
             │
             ├──────────────────┐
             │                  │
┌────────────▼───────┐  ┌──────▼──────────────────────┐
│  agent-config.json │  │ sub-agents-status.json      │
│  (Model settings)  │  │ (Real-time progress)        │
└────────────┬───────┘  └──────┬──────────────────────┘
             │                  │
             └─────────┬────────┘
                       │
         ┌─────────────▼──────────────┐
         │  orchestrate-agents.ts     │
         │  (Coordination logic)      │
         └─────────────┬──────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
│  Agent A0   │ │  Agent A1  │ │  Agent A2  │
│  (Design)   │ │  (UI Shell)│ │ (Translate)│
└─────────────┘ └────────────┘ └────────────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
              ┌────────▼─────────┐
              │   Web Dashboard  │
              │    (/agents)     │
              └──────────────────┘
```

## Dependency Graph

```
A0-design-tokens (Foundation)
├── A1-ui-shell
│   ├── A2-translator-core
│   │   └── A3-quick-practice
│   ├── A4-resources-panel
│   └── A5-performance
│       └── A6-accessibility-tests
│           └── A9-ci-cd
└── A8-theming-and-components

A7-content-cleanup (Independent)
```

## AI Model Strategy

### Standard Model (gpt-4o)
**When to use:** Most UI work, components, styling, content
**Tasks:** A0, A1, A3, A4, A6, A7, A8

### Advanced Model (chatGPT-5 codex)
**When to use:** Complex algorithms, performance optimization, streaming APIs
**Tasks:** A2 (translator), A5 (performance), A9 (CI/CD)

### Override Models

Edit `docs/agents/agent-config.json`:

```json
{
  "agents": {
    "A1-ui-shell": {
      "model": "chatgpt-5-codex"  // Override to advanced
    }
  }
}
```

Or use CLI flag for all tasks:

```bash
npm run agents:orchestrate -- --advanced-model
```

## Workflow Integration

### GitHub Actions

Workflow file: `.github/workflows/agent-orchestration.yml`

**Trigger manually:**
```bash
gh workflow run agent-orchestration.yml \
  -f task_id=A0-design-tokens \
  -f advanced_model=true \
  -f dry_run=false
```

**Or via GitHub UI:**
1. Go to Actions tab
2. Select "Agent Orchestration"
3. Click "Run workflow"
4. Configure options and run

### CI/CD Integration

The workflow automatically:
- Launches agents based on configuration
- Updates status in `sub-agents-status.json`
- Commits changes back to repo
- Uploads orchestration reports
- Posts summary to GitHub Actions

## Configuration

### Orchestration Settings

File: `docs/agents/agent-config.json`

```json
{
  "orchestration": {
    "maxConcurrentAgents": 3,      // Max parallel agents
    "retryAttempts": 2,             // Retry failed tasks
    "timeoutMinutes": 30,           // Task timeout
    "checkDependencies": true       // Enforce dependencies
  }
}
```

### Agent Configuration

```json
{
  "agents": {
    "A0-design-tokens": {
      "name": "Design Tokens Agent",
      "model": "gpt-4o",
      "capabilities": ["design-systems", "css", "theming"],
      "maxParallelism": 1,
      "priority": "high"
    }
  }
}
```

## Troubleshooting

### No Tasks Ready to Launch

**Problem:** Orchestrator says no tasks are ready

**Solutions:**
1. Check if all tasks are already in progress or complete
2. Verify dependencies are met
3. Use `--force` to override dependency checks

```bash
npm run agents:orchestrate -- --dry-run  # See why
npm run agents:orchestrate -- A1-ui-shell --force
```

### Agent Stuck

**Problem:** Task stuck in "in_progress" for too long

**Solutions:**
1. Check dashboard for blockers
2. Manually update status in `sub-agents-status.json`
3. Re-launch the agent

```bash
# Edit data/sub-agents-status.json - change status to "pending"
npm run agents:orchestrate -- A1-ui-shell --force
```

### GitHub CLI Issues

**Problem:** `create-agent-issues` script fails

**Solutions:**
```bash
# Install GitHub CLI
brew install gh  # macOS
# or visit https://cli.github.com/

# Authenticate
gh auth login

# Test
gh issue list
```

## Best Practices

### 1. Always Use Dry-Run First

```bash
npm run agents:orchestrate -- --dry-run  # Safe preview
npm run agents:orchestrate                # Actual launch
```

### 2. Monitor Progress

- Check `/agents` dashboard regularly
- Watch for blockers
- Update status when needed

### 3. Respect Dependencies

Don't force-launch unless necessary:
```bash
# Good - respects dependencies
npm run agents:orchestrate

# Use cautiously - ignores dependencies
npm run agents:orchestrate -- A3-quick-practice --force
```

### 4. Use Advanced Models Strategically

Reserve `--advanced-model` for complex tasks:
```bash
# Standard model for UI work
npm run agents:orchestrate -- A1-ui-shell

# Advanced model for complex optimization
npm run agents:orchestrate -- A5-performance --advanced-model
```

### 5. Keep Status Updated

Agents should update `sub-agents-status.json` with:
- Progress percentage (0-100)
- Highlights (achievements)
- Blockers (impediments)
- Estimated completion date

## Development Workflow

### Starting a New Agent Task

1. **Check Dependencies**
   ```bash
   npm run agents:orchestrate -- --dry-run
   ```

2. **Launch Agent**
   ```bash
   npm run agents:orchestrate -- A0-design-tokens
   ```

3. **Monitor Progress**
   - Visit `/agents` dashboard
   - Check status JSON periodically

4. **Update Status**
   - Edit `data/sub-agents-status.json`
   - Add highlights
   - Report blockers

5. **Complete Task**
   - Change status to "complete"
   - Document deliverables
   - Trigger dependent tasks

### Creating GitHub Issues

```bash
# Preview issues for all pending tasks
npm run agents:create-issues -- --dry-run

# Create them
npm run agents:create-issues

# View created issues
gh issue list --label agent-task
```

### Running CI/CD

```bash
# Trigger workflow for all ready tasks
gh workflow run agent-orchestration.yml

# Trigger for specific task with advanced model
gh workflow run agent-orchestration.yml \
  -f task_id=A2-translator-core \
  -f advanced_model=true \
  -f dry_run=false
```

## Support & Resources

- 📖 [Handbook](./handbook.md) - Repository guidelines
- 📋 [Execution Guide](./execution-guide.md) - Step-by-step process
- 🔄 [Change Log](./change-log.md) - Recent updates
- 💬 [GitHub Issues](https://github.com/battaglia-v/mk-language-lab/issues?q=label%3Aagent-task)

## Future Enhancements

Planned features:
- [ ] Real-time collaboration between agents
- [ ] Automatic conflict detection
- [ ] Agent performance metrics
- [ ] Slack/Discord notifications
- [ ] Multi-repository support
- [ ] Resource usage tracking
- [ ] Automatic PR creation per task
- [ ] Agent learning from previous runs

## Contributing

To contribute to the agent system:

1. Read the [Handbook](./handbook.md)
2. Review existing task definitions
3. Test changes with `--dry-run` first
4. Update documentation
5. Submit PR with clear description

---

**Questions?** Open an issue or check the [full documentation](./ORCHESTRATION.md).
