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
    <>
    </>
  )
}
