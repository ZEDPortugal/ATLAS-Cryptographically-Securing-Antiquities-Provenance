import { NextResponse } from 'next/server'
import Artifact from '../../../../lib/artifact'
import { appendBlock, saveArtifact, initializeDatabase } from '../../../../lib/db'

export async function POST(req) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'invalid json' }, { status: 400 })

  const { name, description, images } = body
  if (!name) return NextResponse.json({ error: 'missing name' }, { status: 400 })

  const art = new Artifact({ name, description, images })
  const missingViews = Object.entries(art.images)
    .filter(([, value]) => !value.data)
    .map(([key]) => key)
  if (missingViews.length) {
    return NextResponse.json({ error: `Missing image(s): ${missingViews.join(', ')}` }, { status: 400 })
  }
  const hash = art.computeHash()

  try {
    // Initialize database (safe to call multiple times)
    await initializeDatabase()
    
    const block = await appendBlock({ artifactHash: hash, owner: name })
    await saveArtifact(hash, {
      name: art.name,
      description: art.description,
      images: art.images,
      createdAt: Date.now(),
    })
    return NextResponse.json({ status: 'ok', hash, block })
  } catch (e) {
    return NextResponse.json({ error: 'storage error', detail: String(e) }, { status: 500 })
  }
}
