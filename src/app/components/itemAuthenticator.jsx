"use client"
import React, { useState, useEffect } from 'react'

export default function ItemAuthenticator() {
  const [username, setUsername] = useState('')
  const [secretInput, setSecretInput] = useState('')
  const [challengeData, setChallengeData] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // get a fresh challenge; same challenge mechanism used in registration
    fetch('/api/register')
      .then((r) => r.json())
      .then((data) => setChallengeData(data))
      .catch(() => setMessage('Could not get challenge from server'))
  }, [])

  async function handleVerify(e) {
    e.preventDefault()
    setMessage('')
    if (!challengeData) {
      setMessage('No server challenge available. Try again.')
      return
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register', // server will return the computed recordSig for this secretInput
          username,
          secretInput,
          challenge: challengeData.challenge,
          ts: challengeData.ts,
          signature: challengeData.signature,
        }),
      })
      const data = await res.json()
      if (res.ok && data.status === 'ok') {
        setMessage('Computed recordSig (server-side): ' + data.recordSig)
      } else {
        setMessage('Verification failed: ' + (data.error || res.statusText))
      }
    } catch (err) {
      setMessage('Network error during verification')
    }
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Authenticator (compute server-side proof)</h2>
      <form onSubmit={handleVerify}>
        <div>
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Secret (for verification)</label>
          <input type="password" value={secretInput} onChange={(e) => setSecretInput(e.target.value)} required />
        </div>
        <div>
          <button type="submit">Compute server proof</button>
        </div>
      </form>
      <div style={{ marginTop: 12 }}>{message}</div>
    </div>
  )
}
