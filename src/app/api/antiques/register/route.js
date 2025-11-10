import { NextResponse } from 'next/server'
import Antique from '../../../../lib/antique'
import { computeMultiModalHash } from '../../../../lib/hash'
import { appendBlock, saveAntique, initializeDatabase } from '../../../../lib/db'

export async function POST(req) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'invalid json' }, { status: 400 })

  const { name, description, images, owner } = body
  if (!name) return NextResponse.json({ error: 'missing name' }, { status: 400 })

  const art = new Antique({ name, description, images })
  const missingViews = Object.entries(art.images)
    .filter(([, value]) => !value.data)
    .map(([key]) => key)
  if (missingViews.length) {
    return NextResponse.json({ error: `Missing image(s): ${missingViews.join(', ')}` }, { status: 400 })
  }
  // Compute multi-modal hash components and composite
  const mm = await computeMultiModalHash({ name: art.name, description: art.description, images: art.images });
  const hash = mm.combined_hash.toLowerCase().trim(); // Normalize hash

  try {
    await initializeDatabase();
    // Save antique FIRST (before blockchain entry due to foreign key constraint)
    const savedAntique = await saveAntique(hash, {
      name: art.name,
      description: art.description,
      images: art.images,
      createdAt: Date.now(),
      combinedHash: mm.combined_hash,
      imagePhash: mm.image_phash,
      textSig: mm.text_sig,
      provenanceDigest: mm.provenance_digest,
    })
    
    // Then append to blockchain (references antique)
    // Use provided owner or fallback to antique name
    const blockOwner = owner || name
    const block = await appendBlock({ antiqueHash: savedAntique.hash, owner: blockOwner })
    
    return NextResponse.json({ status: 'ok', hash: savedAntique.hash, block })
  } catch (e) {
    console.error('Antique registration error:', e)
    return NextResponse.json({ 
      error: 'storage error', 
      detail: e.message || String(e),
      stack: process.env.NODE_ENV === 'development' ? e.stack : undefined
    }, { status: 500 })
  }
}
