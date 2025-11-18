---
name: Agent Task
about: Track work for a sub-agent from the orchestration system
title: '[AGENT] '
labels: agent-task
assignees: ''
---

## Task Information

**Task ID:** (e.g., A0-design-tokens)  
**Agent:** (e.g., Agent-A0)  
**Priority:** (high/medium/low)  
**AI Model:** (gpt-4o/chatgpt-5-codex)

## Description

<!-- Brief description of what this agent needs to accomplish -->

## Dependencies

<!-- List task IDs that must be complete before starting this -->

- [ ] None

## Deliverables

<!-- List specific outputs expected from this work -->

- [ ] 

## Acceptance Criteria

<!-- How do we know this is done correctly? -->

- [ ] 

## Current Status

**Progress:** 0%  
**Status:** pending  
**Launched At:** Not yet launched

## Blockers

<!-- Any issues preventing progress -->

- None currently

## Updates

<!-- Agents should comment here with progress updates -->

---

**Related Files:**
- PROJECT_PLAN.json: Task definition
- sub-agents-status.json: Live status tracking
- Dashboard: `/agents` page

**Launch Command:**
```bash
npm run agents:orchestrate -- <task-id>
```
