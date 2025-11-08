const draftCache = new Map()

export function setDraftImages(key, images) {
  draftCache.set(key, images)
}

export function getDraftImages(key) {
  return draftCache.get(key) || null
}

export function clearDraftImages(key) {
  draftCache.delete(key)
}

export default {
  setDraftImages,
  getDraftImages,
  clearDraftImages,
}
