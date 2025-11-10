import { NextResponse } from 'next/server'
import { findByHash, getAntique } from '../../../../lib/db'

export async function POST(req) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'invalid json' }, { status: 400 })

  let { hash } = body
  if (!hash) return NextResponse.json({ error: 'missing hash' }, { status: 400 })

  // Trim whitespace and normalize
  hash = hash.trim().toLowerCase()

  try {
    console.log('Verifying hash:', hash)
    console.log('Hash length:', hash.length)
    
    const found = await findByHash(hash)
    console.log('Blockchain entry found:', found)
    
    if (found) {
      const antique = await getAntique(hash)
      console.log('Antique found:', antique ? 'yes' : 'no')
      return NextResponse.json({ status: 'found', block: found, antique })
    }
    
    console.log('No blockchain entry found for hash:', hash)
    return NextResponse.json({ status: 'not_found' })
  } catch (e) {
    console.error('Verification error:', e)
    return NextResponse.json({ error: 'internal', detail: String(e), stack: e.stack }, { status: 500 })
  }
}
