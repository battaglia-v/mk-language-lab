import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SubAgentMonitor } from "@/components/agents/sub-agent-monitor"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { getSubAgentSnapshot } from "@/lib/subAgents"

export const metadata: Metadata = {
  title: "Agent Mission Control",
  description: "Live telemetry for every MK Language Lab sub-agent task.",
}

/**
 * Agent Mission Control - Internal dashboard for monitoring sub-agents
 *
 * GATED: Only available when ENABLE_DEV_PAGES=true or in development
 */
export default async function AgentsPage() {
  // Gate this page in production
  if (process.env.ENABLE_DEV_PAGES !== "true" && process.env.NODE_ENV === "production") {
    notFound();
  }
  const snapshot = getSubAgentSnapshot()

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05060b] via-[#090e1a] to-[#0f1729] pb-24 pt-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <header className="space-y-4 text-center">
          <Badge className="mx-auto w-fit bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-white">
            MK Language Lab
          </Badge>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Sub-agent mission control</h1>
          <p className="mx-auto max-w-3xl text-base text-white/70">
            Track every task from the overhaul roadmap, see blockers in real time, and keep A0, A1, and A7 moving.
            This dashboard streams live data from the shared project plan so anyone in the repo can monitor progress without
            digging through docs.
          </p>
        </header>
        <Card className="border-none bg-white/5 p-6 text-sm text-white/80 backdrop-blur-xl">
          <p>
            Monitoring {snapshot.stats.total} active workstreams for version {snapshot.version}. Updates include latest highlights,
            dependencies, ETAs, and blockers pulled directly from docs/PROJECT_PLAN.json + data/sub-agents-status.json.
          </p>
        </Card>
        <SubAgentMonitor initialData={snapshot} />
      </div>
    </main>
  )
}
