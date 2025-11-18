#!/usr/bin/env tsx
/**
 * Create GitHub Issues for Agent Tasks
 * 
 * This script generates GitHub issues for each task in PROJECT_PLAN.json
 * using the agent-task issue template.
 * 
 * Usage:
 *   npm run agents:create-issues              # Create issues for all pending tasks
 *   npm run agents:create-issues -- A0-design-tokens  # Create issue for specific task
 *   npm run agents:create-issues -- --dry-run  # Preview without creating
 * 
 * Prerequisites:
 *   - GitHub CLI (gh) must be installed
 *   - User must be authenticated with gh auth login
 */

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { execSync } from "node:child_process"

// Types
interface Task {
  id: string
  title: string
  description: string
  deliverables: string[]
  acceptance_criteria: string[]
  dependencies: string[]
}

interface StatusEntry {
  id: string
  status: "pending" | "in_progress" | "blocked" | "complete"
  owner: string
  progress: number
  updatedAt: string
  eta: string
  highlights: string[]
  blockers: string[]
  launchedAt?: string
  launchNotes?: string
}

interface AgentConfig {
  name: string
  model: string
  priority: "low" | "medium" | "high"
}

// File paths
const projectPlanPath = resolve(process.cwd(), "docs", "PROJECT_PLAN.json")
const statusPath = resolve(process.cwd(), "data", "sub-agents-status.json")
const configPath = resolve(process.cwd(), "docs", "agents", "agent-config.json")

// Load data
const projectPlan = JSON.parse(readFileSync(projectPlanPath, "utf8")) as { tasks: Task[] }
const statusEntries = JSON.parse(readFileSync(statusPath, "utf8")) as StatusEntry[]
const config = JSON.parse(readFileSync(configPath, "utf8")) as { agents: Record<string, AgentConfig> }

// Parse CLI arguments
const args = process.argv.slice(2)
const isDryRun = args.includes("--dry-run")
const targetTask = args.find(arg => !arg.startsWith("--"))

// Status map for quick lookup
const statusMap = new Map(statusEntries.map(entry => [entry.id, entry]))

/**
 * Check if gh CLI is available
 */
function checkGhCli(): boolean {
  try {
    execSync("gh --version", { stdio: "pipe" })
    return true
  } catch {
    return false
  }
}

/**
 * Generate issue body for a task
 */
function generateIssueBody(task: Task): string {
  const status = statusMap.get(task.id)
  const agentConfig = config.agents[task.id]
  
  const dependencies = task.dependencies.length > 0
    ? task.dependencies.map(dep => `- [ ] ${dep}`).join("\n")
    : "- [x] None"
  
  const deliverables = task.deliverables
    .map(item => `- [ ] ${item}`)
    .join("\n")
  
  const acceptanceCriteria = task.acceptance_criteria
    .map(item => `- [ ] ${item}`)
    .join("\n")
  
  return `## Task Information

**Task ID:** ${task.id}  
**Agent:** ${status?.owner || `Agent-${task.id}`}  
**Priority:** ${agentConfig?.priority || "medium"}  
**AI Model:** ${agentConfig?.model || "gpt-4o"}

## Description

${task.description}

## Dependencies

${dependencies}

## Deliverables

${deliverables}

## Acceptance Criteria

${acceptanceCriteria}

## Current Status

**Progress:** ${status?.progress || 0}%  
**Status:** ${status?.status || "pending"}  
**Launched At:** ${status?.launchedAt ? new Date(status.launchedAt).toLocaleString() : "Not yet launched"}

## Blockers

${status?.blockers && status.blockers.length > 0 
  ? status.blockers.map((b: string) => `- ${b}`).join("\n")
  : "- None currently"}

## Updates

_Agents should comment here with progress updates_

---

**Related Files:**
- [PROJECT_PLAN.json](../blob/main/docs/PROJECT_PLAN.json): Task definition
- [sub-agents-status.json](../blob/main/data/sub-agents-status.json): Live status tracking
- Dashboard: \`/agents\` page

**Launch Command:**
\`\`\`bash
npm run agents:orchestrate -- ${task.id}
\`\`\``
}

/**
 * Create GitHub issue for a task
 */
function createIssue(task: Task, dryRun: boolean): void {
  const title = `[AGENT] ${task.id}: ${task.title}`
  const body = generateIssueBody(task)
  const labels = ["agent-task", "automation"]
  
  console.log(`\n📝 Task: ${task.id}`)
  console.log(`   Title: ${title}`)
  console.log(`   Labels: ${labels.join(", ")}`)
  
  if (dryRun) {
    console.log(`   🔍 [DRY RUN] Would create issue`)
    console.log("\n" + "─".repeat(60))
    console.log(body.substring(0, 500) + "...")
    console.log("─".repeat(60))
    return
  }
  
  try {
    // Create issue using gh CLI
    const command = [
      "gh", "issue", "create",
      "--title", title,
      "--body", body,
      "--label", labels.join(",")
    ].join(" ")
    
    execSync(command, { stdio: "inherit" })
    console.log(`   ✅ Issue created successfully`)
  } catch (error) {
    console.error(`   ❌ Failed to create issue:`, error)
  }
}

/**
 * Main function
 */
function main(): void {
  console.log("📋 Agent Issue Creator")
  console.log("=" .repeat(60))
  
  // Check for gh CLI
  if (!checkGhCli()) {
    console.error("❌ GitHub CLI (gh) not found or not authenticated")
    console.error("   Install: https://cli.github.com/")
    console.error("   Authenticate: gh auth login")
    process.exit(1)
  }
  
  console.log(`Mode: ${isDryRun ? "DRY RUN" : "LIVE"}`)
  console.log("=" .repeat(60))
  
  // Filter tasks
  let tasksToProcess: Task[]
  
  if (targetTask) {
    // Process specific task
    const task = projectPlan.tasks.find(t => t.id === targetTask)
    if (!task) {
      console.error(`❌ Task ${targetTask} not found`)
      process.exit(1)
    }
    tasksToProcess = [task]
  } else {
    // Process all pending tasks
    tasksToProcess = projectPlan.tasks.filter(task => {
      const status = statusMap.get(task.id)
      return !status || status.status === "pending"
    })
  }
  
  if (tasksToProcess.length === 0) {
    console.log("\n✨ No tasks to process")
    return
  }
  
  console.log(`\n🎯 Processing ${tasksToProcess.length} task(s)...\n`)
  
  // Create issues
  tasksToProcess.forEach(task => {
    createIssue(task, isDryRun)
  })
  
  console.log("\n" + "=".repeat(60))
  console.log("✅ Issue creation complete")
  
  if (isDryRun) {
    console.log("\n💡 Run without --dry-run to actually create issues")
  } else {
    console.log("\n📊 View issues: gh issue list --label agent-task")
  }
}

// Run
try {
  main()
} catch (error) {
  console.error("❌ Issue creation failed:", error)
  process.exit(1)
}
