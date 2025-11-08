import { Suspense } from 'react'
import RegisterQrPageClient from './qrPageClient'

function RegisterQrFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-sm text-neutral-400">
      Preparing QR code...
    </div>
  )
}

export default function RegisterQrPage() {
  return (
    <Suspense fallback={<RegisterQrFallback />}>
      <RegisterQrPageClient />
    </Suspense>
  )
}
