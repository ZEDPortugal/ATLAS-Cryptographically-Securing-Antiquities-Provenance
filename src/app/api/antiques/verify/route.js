import { NextResponse } from 'next/server'
import { findByHash, getAntique } from '../../../../lib/db'

export async function POST(req) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'invalid json' }, { status: 400 })

  const { hash } = body
  if (!hash) return NextResponse.json({ error: 'missing hash' }, { status: 400 })

  try {
    const found = await findByHash(hash)
    if (found) {
      const antique = await getAntique(hash)
      return NextResponse.json({ status: 'found', block: found, antique })
    }
    return NextResponse.json({ status: 'not_found' })
  } catch (e) {
    return NextResponse.json({ error: 'internal', detail: String(e) }, { status: 500 })
  }
}
