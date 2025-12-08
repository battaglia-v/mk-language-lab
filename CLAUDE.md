# Claude Code Agent Instructions

## Token Limitations

**CRITICAL**: This project has strict token limitations:
- `CLAUDE_CODE_MAX_OUTPUT_TOKENS=4096`
- `MAX_THINKING_TOKENS=1024`

**YOU MUST plan your work to operate within these constraints.**

## Working Within Token Limits

### 1. Use the Memory Folder

All agents MUST use the `.claude/memory/` folder to maintain state across multiple interactions:

```bash
.claude/memory/
├── current-task-plan.md       # Active task plan and status
├── requirements.md             # Refined requirements for current work
├── progress-log.md             # Progress updates and decisions
└── [task-name]/                # Task-specific files
    ├── plan.md
    ├── status.md
    └── notes.md
```

### 2. Start Every Task with Planning

**BEFORE writing any code**, create these files in `.claude/memory/`:

1. **`current-task-plan.md`**:
   - Break the task into small, achievable chunks
   - Number each chunk (1, 2, 3...)
   - Estimate tokens needed for each chunk
   - Mark status: `[ ]` pending, `[→]` in-progress, `[✓]` done

2. **`requirements.md`**:
   - Clarify what needs to be done
   - List all files that will be modified
   - Note any dependencies or prerequisites
   - Document assumptions and decisions

### 3. Work Incrementally

- Complete ONE chunk at a time
- Update `current-task-plan.md` after each chunk
- If you hit token limits, STOP and update progress
- Next agent invocation will read the plan and continue

### 4. Progress Tracking

Always update `progress-log.md` with:
- What was completed
- What's next
- Any blockers or issues
- Key decisions made

## Example Workflow

```markdown
# In .claude/memory/current-task-plan.md

## Task: Implement user authentication

### Requirements Refined: ✓
- See requirements.md for details

### Chunks:
- [✓] 1. Create auth.ts utility (15 lines, ~500 tokens)
- [→] 2. Add login API route (30 lines, ~800 tokens)
- [ ] 3. Create login form component (40 lines, ~1000 tokens)
- [ ] 4. Add auth middleware (20 lines, ~600 tokens)
- [ ] 5. Test and verify all flows

### Current Status:
Working on chunk 2/5. Login API route created at app/api/auth/login/route.ts
Next: Test the route, then move to chunk 3.

### Blockers:
None

### Notes:
- Using bcrypt for password hashing
- JWT token expires in 7 days
```

## Agent Communication Pattern

When you start work:
1. Read `.claude/memory/current-task-plan.md` (if exists)
2. Continue from where previous agent stopped
3. Update plan with your progress
4. If task is large, create sub-chunks

When you finish a session:
1. Update all memory files
2. Mark completed chunks as `[✓]`
3. Note exactly where to continue
4. Commit memory files to track progress

## File Size Limits

Keep individual tool outputs small:
- Read files with `limit` parameter when possible
- Use `Grep` with `head_limit` to cap results
- Break large edits into multiple `Edit` calls
- Use `Write` for completely new files only

## Token Budgeting

Monitor your token usage:
- Planning: ~500-800 tokens
- Each code change: ~600-1200 tokens
- Testing/verification: ~400-600 tokens
- **Total per session: Stay under 3500 tokens**

## Critical Rules

1. ✅ **DO**: Create plan first, work incrementally, update memory
2. ✅ **DO**: Use `.claude/memory/` folder for ALL progress tracking
3. ✅ **DO**: Break large tasks into sub-1000 token chunks
4. ❌ **DON'T**: Try to complete large tasks in one go
5. ❌ **DON'T**: Skip updating memory files
6. ❌ **DON'T**: Assume you'll have unlimited tokens

## Memory Folder Setup

Create the memory folder structure if it doesn't exist:

```bash
mkdir -p .claude/memory
touch .claude/memory/current-task-plan.md
touch .claude/memory/requirements.md
touch .claude/memory/progress-log.md
```

Add to `.gitignore` if you don't want to commit:
```
.claude/memory/
```

Or commit it to track progress across team members.

---

**Remember**: Future Claude agents will read these instructions. Make it easy for them to pick up where you left off!
