# Claude Code Agent Instructions

> **For comprehensive agent instructions, see: [`docs/AGENT_INSTRUCTIONS.md`](docs/AGENT_INSTRUCTIONS.md)**

---

## Quick Start for Claude Code

1. **Read the unified instructions**: `docs/AGENT_INSTRUCTIONS.md`
2. **Use memory folder**: `.claude/memory/` for task continuity
3. **Follow project conventions**: TypeScript, Tailwind, shadcn/ui

## Memory Folder

All Claude Code agents should use `.claude/memory/` for state:

```
.claude/memory/
├── current-task-plan.md   # Active task plan and status
├── requirements.md        # Refined requirements
└── progress-log.md        # Progress updates
```

## Token Management

This project uses token limits. Work incrementally:

1. **Plan first**: Break tasks into small chunks
2. **Update memory**: Track progress after each chunk
3. **Stay focused**: One chunk at a time

## Key Commands

```bash
npm run dev          # Development server
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npm run test         # Unit tests
npm run test:e2e     # E2E tests
```

## Critical Rules

✅ **DO**: Read context → Plan → Execute → Update memory  
✅ **DO**: Make surgical edits, not wholesale rewrites  
✅ **DO**: Update both `en.json` and `mk.json` for translations  

❌ **DON'T**: Modify `.env` files  
❌ **DON'T**: Delete working code without reason  
❌ **DON'T**: Skip type checking  

---

For complete instructions, project structure, and workflows, see **[`docs/AGENT_INSTRUCTIONS.md`](docs/AGENT_INSTRUCTIONS.md)**.
