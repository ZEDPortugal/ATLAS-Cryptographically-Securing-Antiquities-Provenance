"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDraftImages, clearDraftImages } from '@/lib/draftCache'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useAuth } from '../../context/AuthContext'

const IMAGE_VIEWS = [
  { key: 'front', label: 'Front' },
  { key: 'back', label: 'Back' },
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' },
]

const INITIAL_PREVIEWS = IMAGE_VIEWS.reduce((acc, { key }) => ({ ...acc, [key]: '' }), {})
const INITIAL_IMAGES = IMAGE_VIEWS.reduce((acc, { key }) => ({ ...acc, [key]: { data: '', type: '' } }), {})
const DRAFT_STORAGE_KEY = 'antiqueDraft'

function buildImagePayload(source) {
  return IMAGE_VIEWS.reduce((acc, { key, label }) => {
    const entry = source[key]
    if (!entry || !entry.data) {
      throw new Error(`Missing ${label.toLowerCase()} image data.`)
    }

    acc[key] = {
      data: String(entry.data || ''),
      type: String(entry.type || ''),
    }
    return acc
  }, {})
}

export default function RegisterPreviewPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [draft, setDraft] = useState({ name: '', description: '' })
  const [previews, setPreviews] = useState(INITIAL_PREVIEWS)
  const [images, setImages] = useState(INITIAL_IMAGES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    setLoading(true)
    try {
      const stored = window.sessionStorage.getItem(DRAFT_STORAGE_KEY)
      if (!stored) {
        setError('No in-progress item found. Start from the create form.')
        return
      }

      const parsed = JSON.parse(stored)
      setDraft({
        name: parsed.name || '',
        description: parsed.description || '',
      })
      const fallbackPreviews = parsed?.previews && typeof parsed.previews === 'object' ? parsed.previews : {}
      const cachedImages = getDraftImages(DRAFT_STORAGE_KEY)
      const sourceImages = parsed.images && typeof parsed.images === 'object' ? parsed.images : cachedImages
      if (!sourceImages || typeof sourceImages !== 'object') {
        setError('Draft is missing image data. Please rebuild the item.')
        return
      }

      const restored = IMAGE_VIEWS.reduce((acc, { key }) => {
        const entry = sourceImages[key]
        if (entry && typeof entry === 'object' && entry.data) {
          acc[key] = {
            data: String(entry.data || ''),
            type: String(entry.type || ''),
          }
        }
        return acc
      }, {})

      const missingImage = IMAGE_VIEWS.find(({ key }) => !restored[key]?.data)
      if (missingImage) {
        setError('Draft is incomplete. Please rebuild the item from the create form.')
        return
      }

      setImages((prev) => ({ ...prev, ...restored }))

      const derivedPreviews = IMAGE_VIEWS.reduce((acc, { key }) => {
        const entry = restored[key]
        if (entry?.data) {
          const mime = entry.type || 'application/octet-stream'
          acc[key] = `data:${mime};base64,${entry.data}`
        } else if (fallbackPreviews[key]) {
          acc[key] = fallbackPreviews[key]
        }
        return acc
      }, {})

      setPreviews((prev) => ({ ...prev, ...derivedPreviews }))
      setError('')
    } catch (err) {
      setError('Failed to load draft from storage. Please recreate the item.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleEdit = () => {
    router.push('/register')
  }

  const handleConfirm = async () => {
    setError('')
    setIsConfirming(true)

    try {
      const payloadImages = buildImagePayload(images)

      // Get owner from authenticated user
      const ownerName = user?.name || user?.username || 'Unknown'

      const res = await fetch('/api/antiques/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          images: payloadImages,
          owner: ownerName, // Pass authenticated user's name as owner
        }),
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok || payload.status !== 'ok' || !payload.hash) {
        throw new Error(payload.error || res.statusText || 'Failed to generate antique hash.')
      }

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY)
      }
      clearDraftImages(DRAFT_STORAGE_KEY)

      router.push(`/register/qr?hash=${encodeURIComponent(payload.hash)}`)
    } catch (err) {
      setError(err.message || 'Unable to generate antique hash.')
    } finally {
      setIsConfirming(false)
    }
  }

  function renderPreviewTile({ key, label }, options = {}) {
    const { containerClass = '', imageClass = '', emptyLabel } = options
    const previewSrc = previews[key]

    return (
      <div
        key={key}
        className={`overflow-hidden rounded-3xl border-2 border-neutral-700 dark:border-neutral-700 light:border-neutral-300 bg-neutral-950/60 dark:bg-neutral-950/60 light:bg-neutral-100/60 shadow-sm transition ${containerClass}`}
      >
        {previewSrc ? (
          <img src={previewSrc} alt={`${label} view`} className={`h-full w-full object-cover ${imageClass}`} />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-xs text-neutral-500">
            {emptyLabel || `No ${label.toLowerCase()} image`}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-neutral-400">
        Loading preview...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center text-sm text-neutral-400">
        <div className="max-w-md text-balance">{error}</div>
        <button
          type="button"
          onClick={handleEdit}
          className="rounded-full border border-neutral-700 dark:border-neutral-700 light:border-neutral-300 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:border-emerald-400 hover:text-emerald-400"
        >
          Back to form
        </button>
      </div>
    )
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen pb-12 px-4">
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-neutral-900/70 p-8 shadow-xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex">
            <h1 className="px-3 text-3xl font-semibold tracking-wide text-emerald-400">CREATE</h1>
            <h1 className="text-3xl font-semibold tracking-wide text-neutral-100 dark:text-neutral-100 light:text-neutral-900">ANTIQUE</h1>
          </div>
          <div className="rounded-full border border-neutral-700 dark:border-neutral-700 light:border-neutral-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
            Preview
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            {renderPreviewTile(IMAGE_VIEWS[0], {
              containerClass: 'h-[260px] w-full',
              imageClass: 'h-full w-full',
              emptyLabel: 'Front image missing'
            })}
            <div className="grid grid-cols-3 gap-4">
              {IMAGE_VIEWS.slice(1).map((view) =>
                renderPreviewTile(view, {
                  containerClass: 'h-[140px]',
                  imageClass: 'h-full w-full'
                })
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-100 dark:text-neutral-100 light:text-neutral-900">{draft.name || 'Untitled Item'}</h2>
              <p className="mt-3 text-sm leading-relaxed wrap-break-word text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
                {draft.description || 'No description provided.'}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-700 dark:border-neutral-700 light:border-neutral-300 bg-neutral-950/60 dark:bg-neutral-950/60 light:bg-neutral-100/60 p-5 text-sm text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
              <div className="font-semibold uppercase tracking-wider text-neutral-300 dark:text-neutral-300 light:text-neutral-700">Antique Hash</div>
              <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-500 light:text-neutral-500">
                The unique hash will be generated once you confirm.
              </div>
            </div>

            <div className="text-xs text-neutral-500 dark:text-neutral-500 light:text-neutral-500">
              Review the images and details before generating the item credentials.
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={handleEdit}
            className="w-full rounded-full border border-neutral-700 dark:border-neutral-700 light:border-neutral-300 px-10 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:border-emerald-400 hover:text-emerald-400 md:w-auto"
          >
            Edit details
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full rounded-full bg-emerald-500 px-10 py-3 text-sm font-semibold uppercase tracking-wider transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            {isConfirming ? 'Generating hash...' : 'Generate hash'}
          </button>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
