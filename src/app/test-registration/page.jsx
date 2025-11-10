"use client"

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function TestRegistrationPage() {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState('')

  function addResult(test, status, message, data = null) {
    setTestResults(prev => [...prev, { test, status, message, data, timestamp: Date.now() }])
  }

  async function runTests() {
    setTestResults([])
    setIsRunning(true)

    try {
      // Test 1: Check Authentication
      setCurrentTest('Checking authentication...')
      if (user) {
        addResult('Authentication', 'success', `Logged in as: ${user.name || user.username}`, { user })
      } else {
        addResult('Authentication', 'warning', 'Not logged in - may affect registration', null)
      }

      // Test 2: Create Sample Images
      setCurrentTest('Creating sample images...')
      const sampleImages = await createSampleImages()
      if (sampleImages) {
        addResult('Sample Images', 'success', `Created 4 sample images`, { 
          imageCount: Object.keys(sampleImages).length,
          totalSize: calculateImagesSize(sampleImages)
        })
      } else {
        addResult('Sample Images', 'error', 'Failed to create sample images')
        setIsRunning(false)
        return
      }

      // Test 3: Test Session Storage
      setCurrentTest('Testing session storage...')
      const storageTest = testSessionStorage(sampleImages)
      addResult('Session Storage', storageTest.status, storageTest.message, storageTest.data)
      
      if (storageTest.status === 'error') {
        setIsRunning(false)
        return
      }

      // Test 4: Test Draft Creation
      setCurrentTest('Creating draft with provenance...')
      const draft = {
        name: 'Test Antique ' + Date.now(),
        description: 'This is a test antique to debug registration issues',
        origin: 'Test Estate Sale',
        previousOwners: 'Test Owner 1\nTest Owner 2',
        dateAcquired: '2025-11-01',
        materialAge: 'Bronze, 18th century',
        condition: 'excellent',
        authenticity: 'Test certification',
        images: sampleImages,
        hasImages: true,
        ts: Date.now(),
      }

      try {
        const draftString = JSON.stringify(draft)
        const draftSize = new Blob([draftString]).size
        addResult('Draft Creation', 'success', `Draft created successfully`, {
          size: `${(draftSize / 1024).toFixed(2)} KB`,
          sizeBytes: draftSize,
          fields: Object.keys(draft).length
        })
      } catch (e) {
        addResult('Draft Creation', 'error', `Failed to serialize draft: ${e.message}`)
        setIsRunning(false)
        return
      }

      // Test 5: Test API Endpoint
      setCurrentTest('Testing registration API...')
      try {
        const ownerName = user?.name || user?.username || 'Test Owner'
        
        const response = await fetch('/api/antiques/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: draft.name,
            description: draft.description,
            images: sampleImages,
            owner: ownerName,
            provenance: {
              origin: draft.origin,
              previousOwners: draft.previousOwners,
              dateAcquired: draft.dateAcquired,
              materialAge: draft.materialAge,
              condition: draft.condition,
              authenticity: draft.authenticity,
            },
          }),
        })

        const responseText = await response.text()
        let responseData
        try {
          responseData = JSON.parse(responseText)
        } catch (e) {
          addResult('API Response', 'error', `Invalid JSON response: ${responseText.substring(0, 200)}`)
          setIsRunning(false)
          return
        }

        if (response.ok && responseData.status === 'ok' && responseData.hash) {
          addResult('API Registration', 'success', `Antique registered successfully!`, {
            hash: responseData.hash.substring(0, 32) + '...',
            fullHash: responseData.hash,
            blockIndex: responseData.block?.index
          })

          // Test 6: Verify the registration
          setCurrentTest('Verifying registered antique...')
          const verifyResponse = await fetch('/api/antiques/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hash: responseData.hash }),
          })

          const verifyData = await verifyResponse.json()
          
          if (verifyResponse.ok && verifyData.status === 'found') {
            addResult('Verification', 'success', 'Antique verified successfully!', {
              name: verifyData.antique?.name,
              hasProvenance: !!verifyData.antique?.provenance,
              provenanceFields: verifyData.antique?.provenance ? Object.keys(verifyData.antique.provenance) : []
            })
          } else {
            addResult('Verification', 'warning', 'Antique registered but verification failed', verifyData)
          }

        } else {
          addResult('API Registration', 'error', 
            `Registration failed: ${responseData.error || 'Unknown error'}`,
            {
              status: response.status,
              statusText: response.statusText,
              detail: responseData.detail,
              responseData
            }
          )
        }

      } catch (e) {
        addResult('API Registration', 'error', `Request failed: ${e.message}`, {
          error: e.toString(),
          stack: e.stack
        })
      }

      setCurrentTest('Tests complete!')
      
    } catch (error) {
      addResult('Test Suite', 'error', `Unexpected error: ${error.message}`, {
        error: error.toString(),
        stack: error.stack
      })
    } finally {
      setIsRunning(false)
      setCurrentTest('')
    }
  }

  async function createSampleImages() {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 300
      const ctx = canvas.getContext('2d')

      const images = {}
      const views = ['front', 'back', 'left', 'right']
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

      for (let i = 0; i < views.length; i++) {
        const view = views[i]
        const color = colors[i]

        // Draw colored rectangle with text
        ctx.fillStyle = color
        ctx.fillRect(0, 0, 400, 300)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(view.toUpperCase(), 200, 150)

        // Convert to base64
        const dataUrl = canvas.toDataURL('image/png')
        const [meta, data] = dataUrl.split(',')
        
        images[view] = {
          data: data,
          type: 'image/png'
        }
      }

      return images
    } catch (e) {
      console.error('Failed to create sample images:', e)
      return null
    }
  }

  function calculateImagesSize(images) {
    let totalSize = 0
    for (const key in images) {
      if (images[key]?.data) {
        totalSize += images[key].data.length
      }
    }
    return `${(totalSize / 1024).toFixed(2)} KB`
  }

  function testSessionStorage(sampleImages) {
    try {
      const testKey = 'test_registration_' + Date.now()
      const testData = {
        name: 'Test',
        description: 'Test description',
        images: sampleImages,
        timestamp: Date.now()
      }

      const testString = JSON.stringify(testData)
      const testSize = new Blob([testString]).size

      // Try to store
      window.sessionStorage.setItem(testKey, testString)
      
      // Try to retrieve
      const retrieved = window.sessionStorage.getItem(testKey)
      
      // Clean up
      window.sessionStorage.removeItem(testKey)

      if (retrieved && JSON.parse(retrieved).name === 'Test') {
        return {
          status: 'success',
          message: `Session storage working correctly`,
          data: {
            testSize: `${(testSize / 1024).toFixed(2)} KB`,
            retrieved: true
          }
        }
      } else {
        return {
          status: 'error',
          message: 'Session storage read/write failed',
          data: null
        }
      }

    } catch (e) {
      return {
        status: 'error',
        message: `Session storage error: ${e.message}`,
        data: { error: e.toString() }
      }
    }
  }

  function clearTestStorage() {
    try {
      const keys = Object.keys(window.sessionStorage)
      const testKeys = keys.filter(k => k.includes('test_registration'))
      testKeys.forEach(k => window.sessionStorage.removeItem(k))
      addResult('Cleanup', 'success', `Cleared ${testKeys.length} test items from storage`)
    } catch (e) {
      addResult('Cleanup', 'error', `Failed to clear storage: ${e.message}`)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-neutral-950">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-emerald-400">Registration Test Suite</h1>
          <a 
            href="/register" 
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition"
          >
            ← Back to Register
          </a>
        </div>

        <div className="p-6 bg-neutral-900 rounded-xl border border-neutral-800">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4">Test Controls</h2>
          <div className="flex gap-4">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg font-semibold transition"
            >
              {isRunning ? 'Running Tests...' : 'Run Full Test Suite'}
            </button>
            <button
              onClick={clearTestStorage}
              disabled={isRunning}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg font-semibold transition"
            >
              Clear Test Data
            </button>
          </div>
          {currentTest && (
            <div className="mt-4 text-sm text-neutral-400 animate-pulse">
              {currentTest}
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-200">Test Results</h2>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  result.status === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : result.status === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500/50'
                    : 'bg-red-500/10 border-red-500/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 text-2xl">
                    {result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-neutral-200 mb-1">{result.test}</div>
                    <div className={`text-sm ${
                      result.status === 'success'
                        ? 'text-emerald-300'
                        : result.status === 'warning'
                        ? 'text-yellow-300'
                        : 'text-red-300'
                    }`}>
                      {result.message}
                    </div>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-300">
                          Show Details
                        </summary>
                        <pre className="mt-2 p-3 bg-neutral-950 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {testResults.length === 0 && !isRunning && (
          <div className="p-6 bg-neutral-900 rounded-xl border border-neutral-800">
            <h2 className="text-xl font-semibold text-emerald-400 mb-4">Instructions</h2>
            <div className="space-y-3 text-sm text-neutral-300">
              <p>This test suite will:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Check if you're logged in</li>
                <li>Create 4 sample images (front, back, left, right)</li>
                <li>Test session storage with image data</li>
                <li>Create a draft with provenance information</li>
                <li>Attempt to register the antique via API</li>
                <li>Verify the registration was successful</li>
              </ol>
              <p className="mt-4 text-yellow-400">
                ⚠️ Note: This will create a real test antique in your database.
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        {testResults.length > 0 && !isRunning && (
          <div className="p-6 bg-neutral-900 rounded-xl border border-neutral-800">
            <h2 className="text-xl font-semibold text-emerald-400 mb-4">Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-emerald-500/10 rounded-lg">
                <div className="text-3xl font-bold text-emerald-400">
                  {testResults.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-neutral-400">Passed</div>
              </div>
              <div className="p-4 bg-yellow-500/10 rounded-lg">
                <div className="text-3xl font-bold text-yellow-400">
                  {testResults.filter(r => r.status === 'warning').length}
                </div>
                <div className="text-sm text-neutral-400">Warnings</div>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <div className="text-3xl font-bold text-red-400">
                  {testResults.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-neutral-400">Failed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
