#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const statusPath = resolve(process.cwd(), "data", "sub-agents-status.json")
type StatusEntry = {
  id: string
  status: string
  launchedAt?: string
  launchNotes?: string
  [key: string]: unknown
}

const raw = readFileSync(statusPath, "utf8")
const tasks = JSON.parse(raw) as StatusEntry[]

const args = process.argv.slice(2)

function getArg(name: string) {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  return args[index + 1]
}

const targetList = getArg("--tasks")
const note = getArg("--note")
const force = args.includes("--force")
const now = new Date().toISOString()

const targets = targetList
  ? new Set(
      targetList
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  : undefined

let updated = 0

const updatedTasks = tasks.map((task) => {
  const shouldLaunch =
    task.status === "in_progress" &&
    (force || !task.launchedAt) &&
    (targets ? targets.has(task.id) : true)

  if (!shouldLaunch) {
    return task
  }

  updated += 1

  return {
    ...task,
    launchedAt: now,
    launchNotes:
      note ??
      (force
        ? "Manual relaunch triggered via CLI"
        : task.launchNotes ?? "Manual launch triggered via CLI"),
  }
})

if (targets && updated === 0) {
  console.warn("No matching in-progress tasks found for provided --tasks list.")
}

if (updated === 0 && !targets) {
  console.warn(
    force
      ? "No matching in-progress tasks found to relaunch."
      : "No new agents launched. Are there in-progress tasks without launch metadata?"
  )
}

writeFileSync(statusPath, `${JSON.stringify(updatedTasks, null, 2)}\n`)

console.log(`Launched ${updated} sub-agent${updated === 1 ? "" : "s"}.`)
