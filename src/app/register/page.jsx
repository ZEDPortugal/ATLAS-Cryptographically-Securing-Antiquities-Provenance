"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { setDraftImages, getDraftImages } from '@/lib/draftCache'
import ProtectedRoute from '../components/ProtectedRoute'

const IMAGE_VIEWS = [
  { key: 'front', label: 'Front', helper: 'Primary reference image' },
  { key: 'back', label: 'Back', helper: 'Show full back view' },
  { key: 'left', label: 'Left', helper: 'Capture left profile' },
  { key: 'right', label: 'Right', helper: 'Capture right profile' },
]

const INITIAL_PREVIEWS = IMAGE_VIEWS.reduce((acc, { key }) => ({ ...acc, [key]: '' }), {})
const INITIAL_IMAGES = IMAGE_VIEWS.reduce((acc, { key }) => ({ ...acc, [key]: { data: '', type: '' } }), {})
const DRAFT_STORAGE_KEY = 'antiqueDraft'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [previews, setPreviews] = useState(INITIAL_PREVIEWS)
  const [images, setImages] = useState(INITIAL_IMAGES)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const stored = window.sessionStorage.getItem(DRAFT_STORAGE_KEY)
      if (!stored) {
        return
      }

      const parsed = JSON.parse(stored)
      if (parsed?.name) {
        setName(parsed.name)
      }
      if (parsed?.description) {
        setDescription(parsed.description)
      }
      const cachedImages = getDraftImages(DRAFT_STORAGE_KEY)
      const sourceImages = parsed?.images && typeof parsed.images === 'object' ? parsed.images : cachedImages
      if (sourceImages && typeof sourceImages === 'object') {
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
        if (Object.keys(restored).length) {
          setImages((prev) => ({ ...prev, ...restored }))
          const restoredPreviews = IMAGE_VIEWS.reduce((acc, { key }) => {
            const entry = restored[key]
            if (entry?.data) {
              const mime = entry.type || 'application/octet-stream'
              acc[key] = `data:${mime};base64,${entry.data}`
            }
            return acc
          }, {})
          if (Object.keys(restoredPreviews).length) {
            setPreviews((prev) => ({ ...prev, ...restoredPreviews }))
          }
        }
      }
    } catch (err) {
      setMessage('Could not restore previous draft. Please re-add your images before continuing.')
    }
  }, [])

  function handleFileChange(viewKey, fileList) {
    const file = fileList?.[0] || null
    setMessage('')
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const dataUrl = reader.result
          setPreviews((prev) => ({ ...prev, [viewKey]: dataUrl }))

          const [meta, data] = dataUrl.split(',')
          if (data) {
            let mimeType = file.type || ''
            if (!mimeType && meta) {
              const match = /^data:(.*?)(?:;base64)?$/i.exec(meta)
              if (match?.[1]) {
                mimeType = match[1]
              }
            }
            setImages((prev) => ({ ...prev, [viewKey]: { data, type: mimeType } }))
          } else {
            setImages((prev) => ({ ...prev, [viewKey]: { data: '', type: '' } }))
            setMessage('Selected image could not be processed. Please try again.')
          }
        } else {
          setPreviews((prev) => ({ ...prev, [viewKey]: '' }))
          setImages((prev) => ({ ...prev, [viewKey]: { data: '', type: '' } }))
          setMessage('Unsupported image format. Please choose a different file.')
        }
      }
      reader.onerror = () => {
        setPreviews((prev) => ({ ...prev, [viewKey]: '' }))
        setImages((prev) => ({ ...prev, [viewKey]: { data: '', type: '' } }))
        setMessage('Could not read the selected image. Please try another file.')
      }
      reader.readAsDataURL(file)
    } else {
      setPreviews((prev) => ({ ...prev, [viewKey]: '' }))
      setImages((prev) => ({ ...prev, [viewKey]: { data: '', type: '' } }))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      const missingViews = IMAGE_VIEWS.filter(({ key }) => !images[key]?.data)
      if (missingViews.length) {
        const missingLabels = missingViews.map(({ label }) => label.toLowerCase())
        throw new Error(`Please upload the ${missingLabels.join(', ')} image${missingLabels.length > 1 ? 's' : ''}.`)
      }

      const sanitizedImages = IMAGE_VIEWS.reduce((acc, { key }) => {
        const entry = images[key] || { data: '', type: '' }
        if (entry.data) {
          acc[key] = {
            data: String(entry.data || ''),
            type: String(entry.type || ''),
          }
        }
        return acc
      }, {})

      setDraftImages(DRAFT_STORAGE_KEY, sanitizedImages)

      const draft = {
        name,
        description,
        hasImages: Object.keys(sanitizedImages).length === IMAGE_VIEWS.length,
        ts: Date.now(),
      }

      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
        } catch (storageErr) {
          setIsSubmitting(false)
          setMessage('Unable to cache the draft. Please try smaller images or remove one and retry.')
          return
        }
      }

      router.push('/register/preview')
    } catch (err) {
      setMessage(err.message || 'Unable to continue to preview.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function renderUploadArea({ key, label }, options = {}) {
    const { containerClass = '', previewClass = '' } = options
    const inputId = `antique-${key}`
    const preview = previews[key]
    return (
      <div key={key}>
        <label
          htmlFor={inputId}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-700 dark:border-neutral-700 light:border-neutral-300 p-8 text-center shadow-sm transition hover:border-emerald-400 hover:bg-emerald-400/10 ${containerClass}`}
        >
          {preview ? (
            <img
              src={preview}
              alt={`${label} preview`}
              className={`rounded-2xl object-cover shadow-sm ${previewClass}`}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-sm text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
              <div className="flex h-16 w-16 items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-8 w-8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16" />
                </svg>
              </div>
              <div className="text-base font-semibold uppercase tracking-wider text-neutral-200 dark:text-neutral-200 light:text-neutral-800">{label}</div>
            </div>
          )}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(key, e.target.files)}
        />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen pb-12 px-4'>
        <div className="mx-auto w-full max-w-4xl rounded-3xl bg-neutral-900/70 p-8 shadow-xl">
          <div className="flex mb-8">
            <h1 className="text-3xl px-3 font-semibold tracking-wide text-emerald-400">CREATE</h1>
            <h1 className="text-3xl font-semibold tracking-wide">ANTIQUE</h1>
          </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid gap-10 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <div className="flex flex-col gap-6">
              {renderUploadArea(IMAGE_VIEWS[0], {
                containerClass: 'h-[260px] w-full',
                previewClass: 'h-full w-full'
              })}
              <div className="grid grid-cols-3 gap-4">
                {IMAGE_VIEWS.slice(1).map((view) =>
                  renderUploadArea(view, {
                    containerClass: 'h-[140px]',
                    previewClass: 'h-full w-full'
                  })
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm uppercase tracking-wide text-neutral-200 dark:text-neutral-200 light:text-neutral-800">Name</label>
                <input
                  className="w-full rounded-xl border border-neutral-700 dark:border-neutral-700 light:border-neutral-300 bg-neutral-950/80 dark:bg-neutral-950/80 light:bg-neutral-100/80 px-4 py-3 text-sm text-neutral-100 dark:text-neutral-100 light:text-neutral-900 outline-none transition focus:border-emerald-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Antique name"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm uppercase tracking-wide text-neutral-200 dark:text-neutral-200 light:text-neutral-800">Description</label>
                <textarea
                  className="h-[300px] w-full rounded-xl border border-neutral-700 dark:border-neutral-700 light:border-neutral-300 bg-neutral-950/80 dark:bg-neutral-950/80 light:bg-neutral-100/80 px-4 py-3 text-sm text-neutral-100 dark:text-neutral-100 light:text-neutral-900 outline-none transition focus:border-emerald-400"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide provenance, notable markings, materials, and any verification details."
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-neutral-400">
              All four images are required. Accepted formats: JPG, PNG, HEIC. Max size depends on browser limits.
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-emerald-500 px-10 py-3 text-sm font-semibold uppercase tracking-wider  transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            >
              {isSubmitting ? 'Opening preview...' : 'Next'}
            </button>
          </div>
        </form>

        {message ? (
          <div className="mt-6 rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-sm text-neutral-100">
            {message}
          </div>
        ) : null}
      </div>
    </div>
    </ProtectedRoute>
  );
}
