"use client"
import React, { useState, useEffect } from 'react'

export default function ItemRegistration() {
  const [username, setUsername] = useState('')
  const [secretInput, setSecretInput] = useState('')
  const [challengeData, setChallengeData] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // fetch a signed challenge from the server before allowing registration
    fetch('/api/register')
      .then((r) => r.json())
      .then((data) => setChallengeData(data))
      .catch(() => setMessage('Could not get challenge from server'))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    if (!challengeData) {
      setMessage('No server challenge available. Try again.')
      return
    }

    const body = {
      action: 'register',
      username,
      secretInput,
      challenge: challengeData.challenge,
      ts: challengeData.ts,
      signature: challengeData.signature,
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok && data.status === 'ok') {
        // recordSig is the server-side generated proof; keep it or store it server-side in production
        setMessage('Registered. recordSig: ' + data.recordSig)
      } else {
        setMessage('Registration failed: ' + (data.error || res.statusText))
      }
    } catch (err) {
      setMessage('Network error during registration')
    }
  }

  return (
    <div>
    </div>
  )
}
