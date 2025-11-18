import { NextResponse } from "next/server"

import { getSubAgentSnapshot } from "@/lib/subAgents"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const snapshot = getSubAgentSnapshot()

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
