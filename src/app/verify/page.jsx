"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import ProtectedRoute from '../components/ProtectedRoute'

const IMAGE_VIEWS = [
  { key: 'front', label: 'Front' },
  { key: 'back', label: 'Back' },
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' },
]

export default function VerifyPage() {
  const [hash, setHash] = useState('')
  const [result, setResult] = useState(null)
  const [scanMessage, setScanMessage] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [cameraSupported, setCameraSupported] = useState(false)
  const [secureContext, setSecureContext] = useState(true)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const frameRequestRef = useRef(null)

  const stopCameraScan = useCallback(() => {
    if (frameRequestRef.current) {
      cancelAnimationFrame(frameRequestRef.current)
      frameRequestRef.current = null
    }

    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsScanning(false)
  }, [])

  useEffect(() => {
    // Determine if we're running in a secure context (required for camera on mobile browsers)
    const isSecure = typeof window !== 'undefined' ? (window.isSecureContext ?? window.location.protocol === 'https:') : true
    setSecureContext(isSecure)

    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      isSecure
    ) {
      setCameraSupported(true)
    } else {
      setCameraSupported(false)
    }

    return () => {
      stopCameraScan()
    }
  }, [stopCameraScan])

  // Capture the current camera frame and attempt to decode a QR payload.
  const processFrame = useCallback(() => {
    const videoEl = videoRef.current
    const canvasEl = canvasRef.current
    if (!videoEl || !canvasEl) {
      return
    }

    if (videoEl.readyState !== videoEl.HAVE_ENOUGH_DATA) {
      frameRequestRef.current = requestAnimationFrame(processFrame)
      return
    }

    const context = canvasEl.getContext('2d', { willReadFrequently: true })
    if (!context) {
      frameRequestRef.current = requestAnimationFrame(processFrame)
      return
    }

    canvasEl.width = videoEl.videoWidth
    canvasEl.height = videoEl.videoHeight
    context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height)
    const imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })

    if (code?.data) {
      const decoded = code.data.trim()
      setHash(decoded)
      setScanMessage('QR detected. Hash populated from camera scan.')
      stopCameraScan()
      return
    }

    frameRequestRef.current = requestAnimationFrame(processFrame)
  }, [stopCameraScan])

  const startCameraScan = useCallback(async () => {
    if (!cameraSupported || typeof navigator === 'undefined') {
      setScanMessage(
        secureContext
          ? 'Camera access is not available in this browser.'
          : 'Camera requires a secure context (HTTPS or localhost). Open this site over HTTPS to use the camera on mobile.'
      )
      return
    }

    try {
      setScanMessage('Looking for QR...')
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      const videoEl = videoRef.current
      if (!videoEl) {
        setScanMessage('Camera element not ready.')
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      // iOS Safari quirks: ensure inline playback and mute before calling play()
      videoEl.setAttribute('playsinline', 'true')
      videoEl.setAttribute('webkit-playsinline', 'true')
      videoEl.muted = true
      videoEl.srcObject = stream
      streamRef.current = stream
      setIsScanning(true)
      try {
        await videoEl.play()
      } catch (playErr) {
        // Some mobile browsers require a direct user gesture; instruct user to tap the preview to start
        setScanMessage('Camera ready. Tap the preview to start if it does not play automatically.')
      }
      frameRequestRef.current = requestAnimationFrame(processFrame)
    } catch (err) {
      stopCameraScan()
      setScanMessage(err?.message ? `Camera error: ${err.message}` : 'Could not access the camera.')
    }
  }, [cameraSupported, processFrame, stopCameraScan])

  // Decode a QR code from an uploaded image and populate the hash field.
  const handleFileUpload = useCallback((event) => {
    if (isScanning) {
      stopCameraScan()
    }

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
  }, [isScanning, stopCameraScan])

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

  return (
    <ProtectedRoute>
    <div className="min-h-screen pb-12 px-4">
      <div className="mx-auto  w-full max-w-4xl rounded-3xl bg-neutral-900/70 p-6 sm:p-8 shadow-xl">
      <div className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.25em] text-emerald-400 sm:tracking-[0.4em]">Verify</h1>
        <h1 className="text-3xl font-semibold uppercase tracking-[0.25em] text-neutral-200 sm:tracking-[0.4em]">Antique</h1>
        </div>
        <p className="mt-2 text-sm text-neutral-400">Enter an artifact hash to fetch the stored record and imagery.</p>

        <form onSubmit={handleCheck} className="mt-8 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-widest text-neutral-400">Artifact Hash</label>
            <input
              className="mt-2 w-full rounded-xl border border-neutral-700 dark:border-neutral-700 light:border-neutral-300 bg-neutral-950/80 dark:bg-neutral-950/80 light:bg-neutral-100/80 text-neutral-100 dark:text-neutral-100 light:text-neutral-900 px-4 py-3 text-sm outline-none transition focus:border-emerald-400"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              required
              placeholder="Paste the SHA3-512 hash"
            />
            <div className="mt-3 flex flex-col gap-2 text-xs text-neutral-400">
              <div className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="font-semibold uppercase tracking-[0.3em] text-neutral-300">Scan Options</div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                 
                  <div>
                    <input
                      id="verify-qr-upload"
                      type="file"
                      accept="image/*;capture=camera"
                      capture
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="verify-qr-upload"
                      className="inline-block cursor-pointer rounded-lg border border-neutral-700 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-emerald-400 hover:text-emerald-100"
                    >
                      Upload QR Image / Scan
                    </label>
                  </div>
                </div>
                {scanMessage ? (
                  <div className="text-[0.68rem] text-neutral-500">{scanMessage}</div>
                ) : !secureContext ? (
                  <div className="text-[0.68rem] text-yellow-500">
                    Mobile browsers require HTTPS for camera access. Use a secure URL (for example, via a tunnel like ngrok)
                    or open on localhost directly on the device.
                  </div>
                ) : null}
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

        {isScanning ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-400">Camera Preview</div>
            <video
              ref={videoRef}
              className="mt-3 h-64 w-full rounded-xl bg-black object-cover"
              muted
              playsInline
              autoPlay
              onClick={async () => {
                const el = videoRef.current
                if (el && el.paused) {
                  try {
                    await el.play()
                    setScanMessage('Camera started.')
                  } catch (_) {
                    // ignore
                  }
                }
              }}
            />
          </div>
        ) : null}

        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-10">
          {result ? (
            result.status === 'found' ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
                  <div className="flex flex-col gap-2 text-sm text-neutral-300 dark:text-neutral-300 light:text-neutral-700 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Authentic</p>
                      <p className="text-base text-neutral-100 dark:text-neutral-100 light:text-neutral-900">Block #{result.block.index}</p>
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
                    <div>Hash: <span className="break-all text-neutral-100 dark:text-neutral-100 light:text-neutral-900">{result.block.artifactHash}</span></div>
                  </div>
                </div>

                {result.artifact ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-100 dark:text-neutral-100 light:text-neutral-900">{result.artifact.name || 'Untitled Artifact'}</h2>
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
    </ProtectedRoute>
  )
}
