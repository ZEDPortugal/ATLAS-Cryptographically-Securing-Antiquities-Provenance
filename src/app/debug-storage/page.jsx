"use client"

import { useState, useEffect } from 'react'

export default function DebugStoragePage() {
  const [storageInfo, setStorageInfo] = useState(null)
  const [draftInfo, setDraftInfo] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      // Get storage estimate
      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then((estimate) => {
          setStorageInfo({
            usage: estimate.usage,
            quota: estimate.quota,
            usagePercent: ((estimate.usage / estimate.quota) * 100).toFixed(2),
            usageMB: (estimate.usage / (1024 * 1024)).toFixed(2),
            quotaMB: (estimate.quota / (1024 * 1024)).toFixed(2),
          })
        })
      }

      // Check draft in session storage
      const draftKey = 'antiqueDraft'
      const draftData = window.sessionStorage.getItem(draftKey)
      
      if (draftData) {
        try {
          const parsed = JSON.parse(draftData)
          const sizeBytes = new Blob([draftData]).size
          const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2)
          
          setDraftInfo({
            exists: true,
            sizeBytes,
            sizeMB,
            sizeKB: (sizeBytes / 1024).toFixed(2),
            fields: Object.keys(parsed),
            hasImages: !!parsed.images,
            imageKeys: parsed.images ? Object.keys(parsed.images) : [],
            hasProvenance: !!(parsed.origin || parsed.previousOwners || parsed.dateAcquired),
            provenanceFields: {
              origin: !!parsed.origin,
              previousOwners: !!parsed.previousOwners,
              dateAcquired: !!parsed.dateAcquired,
              materialAge: !!parsed.materialAge,
              condition: !!parsed.condition,
              authenticity: !!parsed.authenticity,
            }
          })
        } catch (e) {
          setDraftInfo({
            exists: true,
            error: 'Failed to parse draft: ' + e.message,
          })
        }
      } else {
        setDraftInfo({ exists: false })
      }

      // Get all session storage keys
      const allKeys = Object.keys(window.sessionStorage)
      const totalSize = allKeys.reduce((acc, key) => {
        return acc + window.sessionStorage.getItem(key).length
      }, 0)

      setDraftInfo(prev => ({
        ...prev,
        allKeys,
        totalStorageSize: (totalSize / 1024).toFixed(2) + ' KB',
      }))

    } catch (err) {
      setError(err.message)
    }
  }, [])

  function clearDraft() {
    try {
      window.sessionStorage.removeItem('antiqueDraft')
      setDraftInfo({ exists: false })
      alert('Draft cleared!')
    } catch (err) {
      alert('Error clearing draft: ' + err.message)
    }
  }

  function clearAllStorage() {
    try {
      window.sessionStorage.clear()
      setDraftInfo({ exists: false })
      alert('All session storage cleared!')
    } catch (err) {
      alert('Error clearing storage: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-neutral-950">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-emerald-400">Storage Debug Info</h1>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Storage Quota */}
        {storageInfo && (
          <div className="p-6 bg-neutral-900 rounded-xl border border-neutral-800">
            <h2 className="text-xl font-semibold text-emerald-400 mb-4">Storage Quota</h2>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-neutral-400">Usage:</div>
                <div className="text-neutral-200">{storageInfo.usageMB} MB</div>
                
                <div className="text-neutral-400">Quota:</div>
                <div className="text-neutral-200">{storageInfo.quotaMB} MB</div>
                
                <div className="text-neutral-400">Usage %:</div>
                <div className="text-neutral-200">{storageInfo.usagePercent}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Draft Information */}
        <div className="p-6 bg-neutral-900 rounded-xl border border-neutral-800">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4">Draft Information</h2>
          
          {draftInfo?.exists === false ? (
            <div className="text-neutral-400">No draft found in session storage</div>
          ) : draftInfo?.error ? (
            <div className="text-red-400">{draftInfo.error}</div>
          ) : draftInfo ? (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-neutral-400">Size:</div>
                  <div className="text-neutral-200">
                    {draftInfo.sizeMB} MB ({draftInfo.sizeKB} KB)
                  </div>
                  
                  <div className="text-neutral-400">Has Images:</div>
                  <div className="text-neutral-200">
                    {draftInfo.hasImages ? '✅ Yes' : '❌ No'}
                  </div>
                  
                  {draftInfo.imageKeys && draftInfo.imageKeys.length > 0 && (
                    <>
                      <div className="text-neutral-400">Image Views:</div>
                      <div className="text-neutral-200">
                        {draftInfo.imageKeys.join(', ')}
                      </div>
                    </>
                  )}
                  
                  <div className="text-neutral-400">Has Provenance:</div>
                  <div className="text-neutral-200">
                    {draftInfo.hasProvenance ? '✅ Yes' : '❌ No'}
                  </div>
                </div>
              </div>

              {draftInfo.provenanceFields && (
                <div>
                  <div className="text-neutral-400 text-xs uppercase mb-2">Provenance Fields:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(draftInfo.provenanceFields).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className={value ? 'text-emerald-400' : 'text-neutral-600'}>
                          {value ? '✓' : '○'}
                        </span>
                        <span className="text-neutral-400">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {draftInfo.fields && (
                <div>
                  <div className="text-neutral-400 text-xs uppercase mb-2">All Fields:</div>
                  <div className="text-sm text-neutral-300">
                    {draftInfo.fields.join(', ')}
                  </div>
                </div>
              )}

              {draftInfo.allKeys && (
                <div>
                  <div className="text-neutral-400 text-xs uppercase mb-2">
                    All Session Storage Keys ({draftInfo.allKeys.length}):
                  </div>
                  <div className="text-sm text-neutral-300">
                    {draftInfo.allKeys.join(', ') || 'None'}
                  </div>
                  <div className="text-xs text-neutral-500 mt-2">
                    Total session storage size: {draftInfo.totalStorageSize}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-neutral-400">Loading...</div>
          )}

          <div className="mt-6 flex gap-4">
            <button
              onClick={clearDraft}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-semibold transition"
            >
              Clear Draft
            </button>
            <button
              onClick={clearAllStorage}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition"
            >
              Clear All Storage
            </button>
          </div>
        </div>

        {/* Browser Info */}
        <div className="p-6 bg-neutral-900 rounded-xl border border-neutral-800">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4">Browser Info</h2>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-neutral-400">User Agent:</div>
              <div className="text-neutral-200 text-xs break-all">
                {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}
              </div>
              
              <div className="text-neutral-400">Session Storage Available:</div>
              <div className="text-neutral-200">
                {typeof window !== 'undefined' && window.sessionStorage ? '✅ Yes' : '❌ No'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
