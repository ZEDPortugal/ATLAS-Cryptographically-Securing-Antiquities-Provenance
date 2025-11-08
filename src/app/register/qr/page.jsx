"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'

export default function RegisterQrPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hash = searchParams.get('hash') || ''

  const [artifactName, setArtifactName] = useState('')
  const [qrSrc, setQrSrc] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const handleDownload = () => {
    if (!qrSrc) {
      return
    }

    const anchor = document.createElement('a')
    const safeName = artifactName ? artifactName.replace(/[^a-z0-9_-]+/gi, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '') : 'artifact'
    anchor.href = qrSrc
    anchor.download = `${safeName || 'artifact'}-qr.png`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  useEffect(() => {
    if (!hash) {
      setError('No artifact hash provided.')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    const fetchArtifact = async (attempt = 1) => {
      const res = await fetch(`/api/artifacts/${encodeURIComponent(hash)}`, { cache: 'no-store' })
      if (res.ok) {
        return res.json()
      }

      const details = await res.json().catch(() => null)
      if (res.status === 404 && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 300 * attempt))
        return fetchArtifact(attempt + 1)
      }

      throw new Error(details?.error || 'Unable to load artifact.')
    }

    fetchArtifact()
      .then((payload) => {
        if (cancelled) {
          return
        }
        const name = payload.artifact?.name || 'Registered Item'
        setArtifactName(name)
        return QRCode.toDataURL(hash, {
          errorCorrectionLevel: 'H',
          margin: 1,
          scale: 8,
        })
      })
      .then((dataUrl) => {
        if (!cancelled && dataUrl) {
          setQrSrc(dataUrl)
          setError('')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to generate QR code.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [hash])

  const handleDone = () => {
    router.push('/register')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-sm text-neutral-400">
        Preparing QR code...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-950 px-4 text-center text-sm text-neutral-400">
        <div className="max-w-md text-balance">{error}</div>
        <button
          type="button"
          onClick={handleDone}
          className="rounded-full border border-white/40 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:border-emerald-400 hover:text-emerald-400"
        >
          Back to form
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4 text-white">
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-neutral-900/70 p-8 shadow-xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex">
            <h1 className="px-3 text-3xl font-semibold tracking-wide text-emerald-400">CREATE</h1>
            <h1 className="text-3xl font-semibold tracking-wide text-white">ANTIQUE</h1>
          </div>
          <div className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
            Credentials
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div className="flex flex-col items-center gap-6 rounded-3xl border-2  border-white/30 bg-neutral-950/60 p-10 text-center shadow-sm">
            {qrSrc ? (
              <img src={qrSrc} alt="Artifact QR code" className="h-48 w-48 rounded-2xl border border-white/20 bg-neutral-900 p-4 shadow-sm" />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center rounded-2xl border border-white/30 text-xs text-white/40">
                QR unavailable
              </div>
            )}
            <div className="text-sm font-medium uppercase tracking-wider text-white/70">{artifactName}</div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-6 text-sm text-white/60">
              <div className="font-semibold uppercase tracking-wider text-white/70">Item Hash</div>
              <div className="mt-3 break-all font-mono text-xs text-white/50">{hash}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-6 text-xs leading-relaxed text-white/50">
              Scan the QR code to retrieve the on-chain credentials for this artifact. Share the code only with trusted verifiers.
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full rounded-full border border-white/40 px-10 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:border-emerald-400 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            disabled={!qrSrc}
          >
            Download QR
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="w-full rounded-full bg-emerald-500 px-10 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-emerald-400 md:w-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
