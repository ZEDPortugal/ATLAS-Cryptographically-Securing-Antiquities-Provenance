import crypto from 'crypto';
import Jimp from 'jimp';

function sha3_256(input) {
  return crypto.createHash('sha3-256').update(input).digest('hex');
}

function sha3_512(input) {
  return crypto.createHash('sha3-512').update(input).digest('hex');
}

function normalizeText(text) {
  const t = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ');
  const tokens = t.split(/\s+/).filter(Boolean);
  // simple frequency map
  const freq = new Map();
  for (const tok of tokens) {
    freq.set(tok, (freq.get(tok) || 0) + 1);
  }
  // top 10 tokens by frequency, then lexicographic for stability
  const top = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([k]) => k);
  return top.join('|') || 'notext';
}

async function generatePerceptualHashes(images) {
  const pHashes = [];
  const imageKeys = ['front', 'back', 'left', 'right'];

  for (const key of imageKeys) {
    const imageData = images?.[key]?.data;
    if (imageData) {
      try {
        // jimp expects a buffer, remove data URI prefix if present
        const base64Data = imageData.split(',')[1] || imageData;
        const buffer = Buffer.from(base64Data, 'base64');
        const image = await Jimp.read(buffer);
        pHashes.push(image.hash()); // 64-bit perceptual hash
      } catch (error) {
        console.error(`Error processing image ${key} for pHash:`, error);
        pHashes.push('error'); // Add placeholder on error
      }
    } else {
      pHashes.push('noimg'); // Add placeholder for missing image
    }
  }
  return pHashes;
}

export async function computeMultiModalHash({
  name,
  description,
  images,
  provenance = {},
}) {
  // Generate true perceptual hashes for images using jimp
  const pHashes = await generatePerceptualHashes(images);
  const imageSig = sha3_256(pHashes.join('|'));

  const textSig = normalizeText(`${name || ''} ${description || ''}`);

  const provDigest = sha3_256(JSON.stringify(provenance));

  const combined = sha3_512(`${imageSig}|${textSig}|${provDigest}`);

  return {
    image_phash: imageSig,
    text_sig: textSig,
    provenance_digest: provDigest,
    combined_hash: combined,
  };
}
