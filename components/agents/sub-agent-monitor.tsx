"use client"

import useSWR from "swr"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock4,
  Loader2,
  Rocket,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AgentStatus, SubAgentSnapshot, SubAgentTask } from "@/lib/subAgents"

const statusTokens: Record<AgentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Queued", variant: "outline" },
  in_progress: { label: "In progress", variant: "secondary" },
  blocked: { label: "Blocked", variant: "destructive" },
  complete: { label: "Complete", variant: "default" },
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Props = {
  initialData: SubAgentSnapshot
}

export function SubAgentMonitor({ initialData }: Props) {
  const { data } = useSWR<SubAgentSnapshot>("/api/sub-agents", fetcher, {
    refreshInterval: 8000,
    fallbackData: initialData,
  })

  if (!data) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card/40 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading live telemetry…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <SummaryRow snapshot={data} />
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Auto-refreshing every 8 seconds.</span>
          <span className="flex items-center gap-1 text-xs uppercase tracking-wide text-foreground/70">
            <Clock4 className="h-3.5 w-3.5" />
            Last refresh: {new Date(data.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {data.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </section>
    </div>
  )
}

function SummaryRow({ snapshot }: { snapshot: SubAgentSnapshot }) {
  const summaryItems = [
    {
      label: "Active agents",
      value: snapshot.stats.inProgress,
      icon: <Activity className="h-4 w-4" />,
      description: "Currently coding",
    },
    {
      label: "Pending queue",
      value: snapshot.stats.pending,
      icon: <Clock4 className="h-4 w-4" />,
      description: "Waiting on dependencies",
    },
    {
      label: "Blocked",
      value: snapshot.stats.blocked,
      icon: <AlertTriangle className="h-4 w-4" />,
      description: "Needs intervention",
    },
    {
      label: "Complete",
      value: `${snapshot.stats.completed}/${snapshot.stats.total} (${snapshot.stats.completionPercent}%)`,
      icon: <CheckCircle2 className="h-4 w-4" />,
      description: "Shipped to main",
    },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {summaryItems.map((item) => (
        <Card key={item.label} className="border border-border/40 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            <div className="rounded-full bg-muted/40 p-2 text-primary">{item.icon}</div>
          </CardHeader>
          <CardContent className="pt-0 text-3xl font-semibold text-foreground">
            {item.value}
            <p className="mt-1 text-xs font-normal uppercase tracking-wide text-muted-foreground">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
      <Card className="border border-border/40 bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Launch Readiness</CardTitle>
          <Rocket className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="pt-0">
          <ProgressBar value={Math.round(snapshot.tasks.reduce((sum, task) => sum + task.progress, 0) / Math.max(snapshot.tasks.length, 1))} />
          <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
            Avg. completion across agents
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function TaskCard({ task }: { task: SubAgentTask }) {
  const statusToken = statusTokens[task.status]

  return (
    <Card className="border border-border/40 bg-gradient-to-br from-card/70 via-card/40 to-muted/10">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-base font-semibold text-foreground">{task.title}</CardTitle>
          <Badge variant={statusToken.variant}>{statusToken.label}</Badge>
        </div>
        <CardDescription className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{task.id}</span>
          <span>Owner: {task.owner}</span>
          {task.eta && <span>ETA: {task.eta}</span>}
          <span>Updated {formatRelativeTime(task.updatedAt)}</span>
        </CardDescription>
        {task.launchedAt && (
          <p className="flex flex-wrap items-center gap-2 text-xs text-emerald-300">
            <Rocket className="h-3.5 w-3.5" />
            Launched {new Date(task.launchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {task.launchNotes && <span className="text-white/80">— {task.launchNotes}</span>}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{Math.min(100, Math.max(0, Math.round(task.progress)))}%</span>
          </div>
          <ProgressBar value={task.progress} />
        </div>
        <div className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Dependencies</p>
            {task.dependencies.length ? (
              <ul className="space-y-1 text-foreground/80">
                {task.dependencies.map((dependency) => (
                  <li key={dependency} className="flex items-center gap-2 text-xs">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    {dependency}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">None</p>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Highlights</p>
            {task.highlights.length ? (
              <ul className="space-y-1 text-foreground/80">
                {task.highlights.map((highlight) => (
                  <li key={highlight} className="text-xs leading-relaxed">
                    {highlight}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No updates yet</p>
            )}
          </div>
        </div>
        {task.blockers.length > 0 && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
            <p className="mb-2 font-semibold uppercase tracking-wide">Blockers</p>
            <ul className="space-y-1 text-destructive/90">
              {task.blockers.map((blocker) => (
                <li key={blocker} className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{blocker}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ProgressBar({ value }: { value: number }) {
  const normalized = Math.min(100, Math.max(0, value))

  return (
    <div className="h-2 w-full rounded-full bg-white/10">
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 transition-all",
          normalized < 5 && "opacity-40"
        )}
        style={{ width: `${normalized}%` }}
      />
    </div>
  )
}

function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp)
  const diffMs = date.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / (1000 * 60))

  if (Math.abs(diffMinutes) < 60) {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(diffMinutes, "minute")
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(diffHours, "hour")
  }

  const diffDays = Math.round(diffHours / 24)
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(diffDays, "day")
}
