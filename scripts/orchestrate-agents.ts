#!/usr/bin/env tsx
/**
 * Agent Orchestration System
 * 
 * This script coordinates parallel execution of sub-agents based on:
 * - Task dependencies from PROJECT_PLAN.json
 * - Current status from sub-agents-status.json
 * - Agent configuration from agent-config.json
 * 
 * Usage:
 *   npm run agents:orchestrate              # Launch all ready tasks
 *   npm run agents:orchestrate -- --dry-run # Preview without launching
 *   npm run agents:orchestrate -- --task A0-design-tokens # Launch specific task
 */

import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

// Types
interface Task {
  id: string
  title: string
  description: string
  dependencies: string[]
  [key: string]: unknown
}

interface StatusEntry {
  id: string
  status: "pending" | "in_progress" | "blocked" | "complete"
  progress: number
  owner: string
  launchedAt?: string
  launchNotes?: string
  [key: string]: unknown
}

interface AgentConfig {
  name: string
  model: string
  capabilities: string[]
  maxParallelism: number
  priority: "low" | "medium" | "high"
}

interface OrchestrationConfig {
  agents: Record<string, AgentConfig>
  orchestration: {
    maxConcurrentAgents: number
    retryAttempts: number
    timeoutMinutes: number
    checkDependencies: boolean
  }
  advancedModel: string
}

// File paths
const projectPlanPath = resolve(process.cwd(), "docs", "PROJECT_PLAN.json")
const statusPath = resolve(process.cwd(), "data", "sub-agents-status.json")
const configPath = resolve(process.cwd(), "docs", "agents", "agent-config.json")

// Load data
const projectPlan = JSON.parse(readFileSync(projectPlanPath, "utf8")) as { tasks: Task[] }
const statusEntries = JSON.parse(readFileSync(statusPath, "utf8")) as StatusEntry[]
const config = JSON.parse(readFileSync(configPath, "utf8")) as OrchestrationConfig

// Parse CLI arguments
const args = process.argv.slice(2)
const isDryRun = args.includes("--dry-run")
const targetTask = args.find(arg => !arg.startsWith("--"))
const useAdvancedModel = args.includes("--advanced-model")

function getArg(name: string): string | undefined {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  return args[index + 1]
}

// Status map for quick lookup
const statusMap = new Map(statusEntries.map(entry => [entry.id, entry]))

/**
 * Check if a task's dependencies are complete
 */
function areDependenciesComplete(task: Task): boolean {
  if (!config.orchestration.checkDependencies) return true
  
  return task.dependencies.every(depId => {
    const depStatus = statusMap.get(depId)
    return depStatus?.status === "complete"
  })
}

/**
 * Check if a task is ready to be launched
 */
function isTaskReady(task: Task): boolean {
  const status = statusMap.get(task.id)
  
  // Not ready if already complete or in progress
  if (!status || status.status === "complete" || status.status === "in_progress") {
    return false
  }
  
  // Not ready if blocked
  if (status.status === "blocked") {
    return false
  }
  
  // Check dependencies
  return areDependenciesComplete(task)
}

/**
 * Get priority score for sorting
 */
function getPriorityScore(taskId: string): number {
  const agentConfig = config.agents[taskId]
  if (!agentConfig) return 0
  
  const priorityMap = { high: 3, medium: 2, low: 1 }
  return priorityMap[agentConfig.priority] || 0
}

/**
 * Launch a task (create GitHub issue or prepare for execution)
 */
function launchTask(task: Task, dryRun: boolean): void {
  const status = statusMap.get(task.id)
  const agentConfig = config.agents[task.id]
  
  const model = useAdvancedModel && config.advancedModel 
    ? config.advancedModel 
    : agentConfig?.model || "gpt-4o"
  
  console.log(`\n📦 Task: ${task.id} - ${task.title}`)
  console.log(`   Model: ${model}`)
  console.log(`   Owner: ${status?.owner || "Unassigned"}`)
  console.log(`   Dependencies: ${task.dependencies.length ? task.dependencies.join(", ") : "None"}`)
  
  if (agentConfig) {
    console.log(`   Capabilities: ${agentConfig.capabilities.join(", ")}`)
    console.log(`   Priority: ${agentConfig.priority}`)
  }
  
  if (!dryRun) {
    // Update status to mark as launched
    const now = new Date().toISOString()
    const statusIndex = statusEntries.findIndex(entry => entry.id === task.id)
    
    if (statusIndex !== -1) {
      statusEntries[statusIndex] = {
        ...statusEntries[statusIndex],
        status: "in_progress",
        launchedAt: now,
        launchNotes: `Launched via orchestrator with model: ${model}`
      }
    }
    
    console.log(`   ✅ Launched at ${now}`)
  } else {
    console.log(`   🔍 [DRY RUN] Would launch now`)
  }
}

/**
 * Main orchestration logic
 */
function orchestrate(): void {
  console.log("🚀 Agent Orchestration System")
  console.log("=" .repeat(60))
  console.log(`Project: ${projectPlan.tasks.length} tasks total`)
  console.log(`Max concurrent agents: ${config.orchestration.maxConcurrentAgents}`)
  console.log(`Advanced model: ${config.advancedModel}`)
  console.log(`Mode: ${isDryRun ? "DRY RUN" : "LIVE"}`)
  console.log("=" .repeat(60))
  
  // Filter tasks
  let tasksToLaunch: Task[]
  
  if (targetTask) {
    // Launch specific task
    const task = projectPlan.tasks.find(t => t.id === targetTask)
    if (!task) {
      console.error(`❌ Task ${targetTask} not found`)
      process.exit(1)
    }
    
    if (!isTaskReady(task)) {
      const status = statusMap.get(task.id)
      console.warn(`⚠️  Task ${targetTask} is not ready (status: ${status?.status})`)
      
      if (!areDependenciesComplete(task)) {
        const incompleteDeps = task.dependencies.filter(depId => {
          const depStatus = statusMap.get(depId)
          return depStatus?.status !== "complete"
        })
        console.warn(`   Missing dependencies: ${incompleteDeps.join(", ")}`)
      }
      
      if (!args.includes("--force")) {
        console.log("\n   Use --force to launch anyway")
        process.exit(1)
      }
    }
    
    tasksToLaunch = [task]
  } else {
    // Launch all ready tasks
    tasksToLaunch = projectPlan.tasks
      .filter(isTaskReady)
      .sort((a, b) => getPriorityScore(b.id) - getPriorityScore(a.id))
      .slice(0, config.orchestration.maxConcurrentAgents)
  }
  
  if (tasksToLaunch.length === 0) {
    console.log("\n✨ No tasks ready to launch")
    console.log("\nCurrent status:")
    
    const stats = {
      complete: 0,
      in_progress: 0,
      blocked: 0,
      pending: 0
    }
    
    statusEntries.forEach(entry => {
      stats[entry.status as keyof typeof stats] = (stats[entry.status as keyof typeof stats] || 0) + 1
    })
    
    console.log(`   Complete: ${stats.complete}`)
    console.log(`   In Progress: ${stats.in_progress}`)
    console.log(`   Blocked: ${stats.blocked}`)
    console.log(`   Pending: ${stats.pending}`)
    
    return
  }
  
  console.log(`\n🎯 Launching ${tasksToLaunch.length} task(s)...\n`)
  
  // Launch tasks
  tasksToLaunch.forEach(task => {
    launchTask(task, isDryRun)
  })
  
  // Save updated status
  if (!isDryRun) {
    writeFileSync(statusPath, JSON.stringify(statusEntries, null, 2) + "\n")
    console.log(`\n💾 Updated ${statusPath}`)
  }
  
  console.log("\n" + "=".repeat(60))
  console.log("✅ Orchestration complete")
  
  if (isDryRun) {
    console.log("\n💡 Run without --dry-run to actually launch")
  } else {
    console.log("\n📊 View status at: /agents")
    console.log("📝 Monitor progress in data/sub-agents-status.json")
  }
}

// Run orchestration
try {
  orchestrate()
} catch (error) {
  console.error("❌ Orchestration failed:", error)
  process.exit(1)
}
