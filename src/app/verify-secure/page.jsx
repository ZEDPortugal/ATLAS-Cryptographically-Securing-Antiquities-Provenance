"use client"
import React, { useCallback, useRef, useState } from 'react'
import jsQR from 'jsqr'

const IMAGE_VIEWS = [
  { key: 'front', label: 'Front' },
  { key: 'back', label: 'Back' },
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' },
]

export default function VerifySecurePage() {
  const [accessCode, setAccessCode] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  
  const [hash, setHash] = useState('')
  const [result, setResult] = useState(null)
  const [scanMessage, setScanMessage] = useState('')

  const canvasRef = useRef(null)

  // Handle access code verification
  const handleAccessCodeSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const res = await fetch('/api/access-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode }),
      })
      const data = await res.json()

      if (data.valid) {
        setIsAuthorized(true)
        // Store in sessionStorage for page refreshes
        sessionStorage.setItem('verifyAccess', accessCode)
      } else {
        setAuthError(data.reason || 'Invalid or expired access code')
      }
    } catch (err) {
      setAuthError('Failed to validate access code')
    } finally {
      setAuthLoading(false)
    }
  }

  // Check if already authorized on mount
  React.useEffect(() => {
    const storedCode = sessionStorage.getItem('verifyAccess')
    if (storedCode) {
      fetch('/api/access-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: storedCode }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setAccessCode(storedCode)
            setIsAuthorized(true)
          } else {
            sessionStorage.removeItem('verifyAccess')
          }
        })
        .catch(() => {
          sessionStorage.removeItem('verifyAccess')
        })
    }
  }, [])

  // Decode a QR code from an uploaded image and populate the hash field.
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setScanMessage('Reading QR from image...')
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      if (typeof dataUrl !== 'string') {
        setScanMessage('Unsupported image data.')
        return
      }

      const img = new Image()
      img.onload = () => {
        const canvasEl = canvasRef.current
        if (!canvasEl) {
          setScanMessage('Canvas not ready to process image.')
          return
        }

        const context = canvasEl.getContext('2d', { willReadFrequently: true })
        if (!context) {
          setScanMessage('QR processing context unavailable.')
          return
        }

        canvasEl.width = img.naturalWidth || img.width
        canvasEl.height = img.naturalHeight || img.height
        context.drawImage(img, 0, 0, canvasEl.width, canvasEl.height)
        const imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })

        if (code?.data) {
          setHash(code.data.trim())
          setScanMessage('QR detected. Hash populated from image upload.')
        } else {
          setScanMessage('No QR code found in that image. Try again with a clearer picture.')
        }
      }
      img.onerror = () => {
        setScanMessage('Could not load the selected image.')
      }
      img.src = dataUrl
    }
    reader.onerror = () => {
      setScanMessage('Failed to read the selected file.')
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }, [])

  async function handleCheck(e) {
    e.preventDefault()
    setResult(null)
    setScanMessage('')
    try {
      const res = await fetch('/api/artifacts/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash }),
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ error: 'network error' })
    }
  }

  // Access code gate
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              ATLAS
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Secure Verification Portal
            </p>
          </div>

          <form onSubmit={handleAccessCodeSubmit} className="mt-8 space-y-6">
            <div className="space-y-4 rounded-2xl bg-neutral-900/80 p-8 shadow-lg shadow-black/50 ring-1 ring-neutral-700/50">
              {authError && (
                <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 ring-1 ring-red-500/20">
                  {authError}
                </div>
              )}

              <div>
                <label
                  htmlFor="accessCode"
                  className="block text-sm font-medium text-neutral-300"
                >
                  Access Code
                </label>
                <p className="mt-1 text-xs text-neutral-500">
                  Enter the code provided by museum staff
                </p>
                <input
                  id="accessCode"
                  name="accessCode"
                  type="text"
                  autoComplete="off"
                  required
                  autoFocus
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="mt-2 block w-full rounded-lg bg-neutral-800 px-4 py-3 text-center font-mono text-lg uppercase tracking-widest placeholder-neutral-500 ring-1 ring-neutral-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="XXXX-XXXX"
                  maxLength={9}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {authLoading ? 'Verifying...' : 'Access Portal'}
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-neutral-600">
            <p>This portal is for authorized buyers and collectors only</p>
            <p className="mt-1">Contact museum staff for access</p>
          </div>
        </div>
      </div>
    )
  }

  // Main verification interface (same as verify page)
  return (
    <div className="min-h-screen mt-10 pb-12 px-4">
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-neutral-900/70 p-6 sm:p-8 shadow-xl">
        <div className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-3xl font-semibold uppercase tracking-[0.25em] text-emerald-400 sm:tracking-[0.4em]">Verify</h1>
          <h1 className="text-3xl font-semibold uppercase tracking-[0.25em] text-neutral-200 sm:tracking-[0.4em]">Antique</h1>
        </div>
        <p className="mt-2 text-sm text-neutral-400">Enter an artifact hash to fetch the stored record and imagery.</p>

        <form onSubmit={handleCheck} className="mt-8 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-widest text-neutral-400">Artifact Hash</label>
            <input
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950/80 text-neutral-100 px-4 py-3 text-sm outline-none transition focus:border-emerald-400"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              required
              placeholder="Paste the SHA3-512 hash"
            />
            <div className="mt-3 flex flex-col gap-2 text-xs text-neutral-400">
              <div className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="font-semibold uppercase tracking-[0.3em] text-neutral-300">Upload QR Code</div>
                <div>
                  <input
                    id="verify-qr-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="verify-qr-upload"
                    className="inline-block cursor-pointer rounded-lg border border-neutral-700 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] transition hover:border-emerald-400 hover:text-emerald-100"
                  >
                    Upload QR Image
                  </label>
                </div>
                {scanMessage && (
                  <div className="text-[0.68rem] text-neutral-500">{scanMessage}</div>
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] transition hover:bg-emerald-400 md:w-auto"
          >
            Check
          </button>
        </form>

        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-10">
          {result ? (
            result.status === 'found' ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                  <div className="flex flex-col gap-2 text-sm text-neutral-300 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Authentic</p>
                      <p className="text-base text-neutral-100">Block #{result.block.index}</p>
                    </div>
                    <div className="text-xs text-neutral-500">
                      Timestamp:{' '}
                      {(() => {
                        const ts = Number(result.block.timestamp)
                        return Number.isFinite(ts) && ts > 0 ? new Date(ts).toLocaleString() : 'Unknown'
                      })()}
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-neutral-400">
                    <div>Hash: <span className="break-all text-neutral-100">{result.block.artifactHash}</span></div>
                  </div>
                </div>

                {result.artifact ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-100">{result.artifact.name || 'Untitled Artifact'}</h2>
                      <p className="mt-2 text-sm text-neutral-400 wrap-break-word">{result.artifact.description || 'No description provided.'}</p>
                    </div>

                    {result.artifact.images ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {IMAGE_VIEWS.map(({ key, label }) => {
                          const entry = result.artifact.images?.[key]
                          if (!entry?.data) {
                            return (
                              <div key={key} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-center text-sm text-neutral-500">
                                {label} image not available.
                              </div>
                            )
                          }
                          return (
                            <div key={key} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                              <div className="mb-2 text-xs uppercase tracking-widest text-neutral-400">{label}</div>
                              <img
                                src={`data:${entry.type || 'image/png'};base64,${entry.data}`}
                                alt={`${label} view`}
                                className="h-64 w-full rounded-xl object-cover"
                              />
                            </div>
                          )
                        })}
                      </div>
                    ) : result.artifact.imageData ? (
                      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                        <div className="mb-2 text-xs uppercase tracking-widest text-neutral-400">Image</div>
                        <img
                          src={`data:${result.artifact.imageType || 'image/png'};base64,${result.artifact.imageData}`}
                          alt="Artifact"
                          className="h-64 w-full rounded-xl object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-center text-sm text-neutral-500">
                        No imagery stored for this artifact.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-sm text-neutral-400">
                    Artifact metadata not found. It may have been registered with an older format.
                  </div>
                )}
              </div>
            ) : result.status === 'not_found' ? (
              <div className="rounded-2xl border border-red-400/60 bg-red-500/10 p-6 text-sm text-red-200">
                Artifact not found. Double-check the hash or re-register the item.
              </div>
            ) : (
              <div className="rounded-2xl border border-red-400/60 bg-red-500/10 p-6 text-sm text-red-200">
                Error: {result.error || 'unknown'}
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}
