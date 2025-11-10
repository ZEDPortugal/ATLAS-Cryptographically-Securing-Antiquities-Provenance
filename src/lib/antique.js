import crypto from 'crypto'

const IMAGE_KEYS = ['front', 'back', 'left', 'right']

function normalizeImages(images) {
  const normalized = {}
  IMAGE_KEYS.forEach((key) => {
    const entry = images?.[key] || {}
    normalized[key] = {
      data: String(entry.data || ''),
      type: String(entry.type || ''),
    }
  })
  return normalized
}

export class Artifact {
  constructor({ name, description, images }) {
    this.name = String(name || '')
    this.description = String(description || '')
    this.images = normalizeImages(images)
  }

  toString() {
    // deterministic serialization for hashing
    return JSON.stringify({
      name: this.name,
      description: this.description,
      images: this.images,
    })
  }

  computeHash() {
    const h = crypto.createHash('sha3-512')
    h.update(this.toString())
    return h.digest('hex')
  }
}

export default Artifact
