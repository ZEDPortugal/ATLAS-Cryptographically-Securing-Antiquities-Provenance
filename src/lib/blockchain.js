import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const CHAIN_FILE = path.join(process.cwd(), 'data', 'chain.json')

function sha3(input) {
  return crypto.createHash('sha3-512').update(input).digest('hex')
}

export class Block {
  constructor({ index, timestamp, artifactHash, owner, previousHash = '' }) {
    this.index = index
    this.timestamp = timestamp
    this.artifactHash = artifactHash
    this.owner = owner
    this.previousHash = previousHash
    this.hash = this.computeHash()
  }

  computeHash() {
    return sha3(`${this.index}|${this.timestamp}|${this.artifactHash}|${this.owner}|${this.previousHash}`)
  }
}

export async function loadChain() {
  try {
    const raw = await fs.readFile(CHAIN_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    // if not exists, return empty chain
    return []
  }
}

export async function saveChain(chain) {
  // ensure directory exists
  await fs.mkdir(path.dirname(CHAIN_FILE), { recursive: true })
  await fs.writeFile(CHAIN_FILE, JSON.stringify(chain, null, 2), 'utf8')
}

export async function appendBlock({ artifactHash, owner }) {
  const chain = await loadChain()
  const index = chain.length
  const timestamp = Date.now()
  const previousHash = chain.length ? chain[chain.length - 1].hash : ''
  const block = new Block({ index, timestamp, artifactHash, owner, previousHash })
  chain.push(block)
  await saveChain(chain)
  return block
}

export async function findByHash(artifactHash) {
  const chain = await loadChain()
  return chain.find((b) => b.artifactHash === artifactHash) || null
}

export default { Block, loadChain, saveChain, appendBlock, findByHash }
