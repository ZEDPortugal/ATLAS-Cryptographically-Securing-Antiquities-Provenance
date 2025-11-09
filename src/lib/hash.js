import crypto from 'crypto'

function sha3_256(input) {
  return crypto.createHash('sha3-256').update(input).digest('hex')
}

function sha3_512(input) {
  return crypto.createHash('sha3-512').update(input).digest('hex')
}

function normalizeText(text) {
  const t = String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
  const tokens = t.split(/\s+/).filter(Boolean)
  // simple frequency map
  const freq = new Map()
  for (const tok of tokens) {
    freq.set(tok, (freq.get(tok) || 0) + 1)
  }
  // top 10 tokens by frequency, then lexicographic for stability
  const top = Array.from(freq.entries())
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([k]) => k)
  return top.join('|') || 'notext'
}

function normalizeImages(images) {
  // Expect shape {front:{data}, back:{}, left:{}, right:{}}
  const v = ['front','back','left','right'].map(k => String(images?.[k]?.data || ''))
  return v
}

export function computeMultiModalHash({ name, description, images, provenance = {} }) {
  const imageStrings = normalizeImages(images)
  // placeholder "perceptual" signature: hash of concatenated normalized base64s
  const imageSig = sha3_256(imageStrings.join('|') || 'noimg')

  const textSig = normalizeText(`${name || ''} ${description || ''}`)

  const provDigest = sha3_256(JSON.stringify(provenance))

  const combined = sha3_512(`${imageSig}|${textSig}|${provDigest}`)

  return {
    image_phash: imageSig,
    text_sig: textSig,
    provenance_digest: provDigest,
    combined_hash: combined,
  }
}
