import projectPlan from "@/docs/PROJECT_PLAN.json"
import statusEntries from "@/data/sub-agents-status.json"

export type AgentStatus = "pending" | "in_progress" | "blocked" | "complete"

type PlanTask = (typeof projectPlan)["tasks"][number]
type StatusEntry = (typeof statusEntries)[number]

export type SubAgentTask = PlanTask &
  StatusEntry & {
    status: AgentStatus
    progress: number
    owner: string
    highlights: string[]
    blockers: string[]
    updatedAt: string
    eta: string
    launchedAt?: string
    launchNotes?: string
  }

export type SubAgentSnapshot = {
  project: string
  version: string
  generatedAt: string
  stats: {
    total: number
    completed: number
    inProgress: number
    pending: number
    blocked: number
    completionPercent: number
  }
  tasks: SubAgentTask[]
}

function normalizeStatus(status?: string): AgentStatus {
  if (status === "complete" || status === "blocked" || status === "in_progress") {
    return status
  }
  return "pending"
}

export function getSubAgentSnapshot(): SubAgentSnapshot {
  const statusMap = new Map(statusEntries.map((entry) => [entry.id, entry]))

  const tasks: SubAgentTask[] = projectPlan.tasks.map((task) => {
    const status = statusMap.get(task.id)

    return {
      ...task,
      owner: status?.owner ?? `Agent-${task.id}`,
      status: normalizeStatus(status?.status),
      progress: status?.progress ?? 0,
      updatedAt: status?.updatedAt ?? new Date(0).toISOString(),
      eta: status?.eta ?? "",
      highlights: status?.highlights ?? [],
      blockers: status?.blockers ?? [],
      launchedAt: status?.launchedAt,
      launchNotes: status?.launchNotes,
    }
  })

  const stats = tasks.reduce(
    (acc, task) => {
      acc.total += 1

      switch (task.status) {
        case "complete":
          acc.completed += 1
          break
        case "in_progress":
          acc.inProgress += 1
          break
        case "blocked":
          acc.blocked += 1
          break
        default:
          acc.pending += 1
      }

      return acc
    },
    {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      blocked: 0,
      completionPercent: 0,
    }
  )

  stats.completionPercent = Math.round((stats.completed / Math.max(stats.total, 1)) * 100)

  return {
    project: projectPlan.project,
    version: projectPlan.version,
    generatedAt: new Date().toISOString(),
    stats,
    tasks,
  }
}
