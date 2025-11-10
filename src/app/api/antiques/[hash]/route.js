import { NextResponse } from 'next/server'
import { getAntique, findByHash } from '../../../../lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(_req, context = {}) {
  const params = await Promise.resolve(context?.params)
  const hash = params?.hash
  if (!hash) {
    return NextResponse.json({ error: 'missing hash' }, { status: 400 })
  }

  try {
    const antique = await getAntique(hash)
    if (!antique) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const block = await findByHash(hash).catch(() => null)
    return NextResponse.json({ status: 'ok', antique, block })
  } catch (error) {
    return NextResponse.json({ error: 'internal', detail: String(error) }, { status: 500 })
  }
}
