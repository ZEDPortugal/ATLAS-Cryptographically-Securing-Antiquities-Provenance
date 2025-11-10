import fs from 'fs/promises'
import path from 'path'

const ARTIFACT_STORE_FILE = path.join(process.cwd(), 'data', 'artifacts.json')

async function loadStore() {
  try {
    const raw = await fs.readFile(ARTIFACT_STORE_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    return {}
  }
}

async function saveStore(store) {
  await fs.mkdir(path.dirname(ARTIFACT_STORE_FILE), { recursive: true })
  await fs.writeFile(ARTIFACT_STORE_FILE, JSON.stringify(store, null, 2), 'utf8')
}

export async function saveArtifact(hash, artifact) {
  const store = await loadStore()
  store[hash] = {
    ...artifact,
    hash,
  }
  await saveStore(store)
  return store[hash]
}

export async function getArtifact(hash) {
  const store = await loadStore()
  return store[hash] || null
}

export default { saveArtifact, getArtifact }
