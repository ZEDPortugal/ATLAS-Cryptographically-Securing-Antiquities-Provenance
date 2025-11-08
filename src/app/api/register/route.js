import { NextResponse } from 'next/server'
import { randomBytes, createHmac, pbkdf2Sync, timingSafeEqual } from 'crypto'

const SECRET = process.env.REGISTER_SECRET || 'dev_register_secret'
const SALT = process.env.SALT || 'dev_salt'
const CHALLENGE_TTL_MS = 2 * 60 * 1000 // 2 minutes

function safeCompare(a, b) {
  try {
    const A = Buffer.from(a)
    const B = Buffer.from(b)
    if (A.length !== B.length) return false
    return timingSafeEqual(A, B)
  } catch (e) {
    return false
  }
}

export async function GET() {
  // issue a signed challenge that the client must present when registering
  const challenge = randomBytes(32).toString('base64')
  const ts = Date.now().toString()
  const signature = createHmac('sha256', SECRET).update(`${challenge}:${ts}`).digest('hex')
  return NextResponse.json({ challenge, ts, signature })
}

export async function POST(req) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'invalid json' }, { status: 400 })

  const { action = 'register', username, secretInput, challenge, ts, signature } = body
  if (!challenge || !ts || !signature) return NextResponse.json({ error: 'missing challenge data' }, { status: 400 })

  const expectedSig = createHmac('sha256', SECRET).update(`${challenge}:${ts}`).digest('hex')
  if (!safeCompare(expectedSig, signature)) return NextResponse.json({ error: 'invalid signature' }, { status: 401 })

  const age = Date.now() - Number(ts)
  if (isNaN(age) || Math.abs(age) > CHALLENGE_TTL_MS) return NextResponse.json({ error: 'challenge expired' }, { status: 401 })

  if (action === 'register') {
    if (!username || !secretInput) return NextResponse.json({ error: 'missing username or secret' }, { status: 400 })

    // derive a salt-hardened hash server-side (keep iterations reasonably high in production)
    const derived = pbkdf2Sync(String(secretInput), SALT, 100000, 64, 'sha512').toString('hex')

    // create a server-side record signature that can be stored server-side (not exposed as secret)
    const recordSig = createHmac('sha256', SECRET).update(`${username}:${derived}`).digest('hex')

    // In production: store derived or recordSig in a database associated with username.
    return NextResponse.json({ status: 'ok', recordSig })
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
