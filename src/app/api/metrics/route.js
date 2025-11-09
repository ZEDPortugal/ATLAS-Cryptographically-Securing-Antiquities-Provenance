export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import client from 'prom-client'

// Ensure a singleton registry across module reloads
const register = global.__atlas_metrics_registry || new client.Registry()
if (!global.__atlas_metrics_registry) {
  client.collectDefaultMetrics({ register })
  global.__atlas_metrics_registry = register
}

export async function GET() {
  const body = await register.metrics()
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': register.contentType },
  })
}
