"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import QRCode from "qrcode";

function QRPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hash = searchParams.get("hash");
  const username = searchParams.get("username");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!hash || !username) {
      router.push("/dev-register");
      return;
    }

    // Generate QR code with the hash
    QRCode.toDataURL(hash, {
      width: 400,
      margin: 2,
      color: {
        dark: "#10b981", // emerald-500
        light: "#0a0a0a", // neutral-950
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("QR generation error:", err);
      });
  }, [hash, username, router]);

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `atlas-access-${username}.png`;
    link.click();
  };

  const handleDownloadKey = () => {
    const keyData = `ATLAS Access Credentials
Username: ${username}
Hash Key: ${hash}
Generated: ${new Date().toLocaleString()}

Instructions:
1. Keep this hash key secure
2. Use it with your username to login
3. You can scan the QR code or enter the hash manually

Login: http://localhost:3000/login
`;

    const blob = new Blob([keyData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `atlas-key-${username}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBackToRegister = () => {
    router.push("/dev-register");
  };

  if (!hash || !username) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="inline-flex rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
            ✓ User Registered Successfully
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
            User Access Credentials
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Provide these credentials to the user
          </p>
        </div>

        <div className="rounded-2xl bg-neutral-900/80 p-8 shadow-lg shadow-black/50 ring-1 ring-neutral-700/50">
          <div className="space-y-6">
            {/* QR Code Display */}
            <div className="flex justify-center">
              <div className="rounded-xl bg-neutral-950 p-6 ring-1 ring-neutral-800">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Access QR Code"
                    className="h-64 w-64"
                  />
                ) : (
                  <div className="flex h-64 w-64 items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-700 border-t-emerald-400"></div>
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-3 rounded-xl bg-neutral-950/80 p-6">
              <div>
                <label className="text-xs uppercase tracking-wider text-neutral-500">
                  Username
                </label>
                <p className="mt-1 font-mono text-lg text-white">{username}</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-neutral-500">
                  Hash Key
                </label>
                <p className="mt-1 break-all font-mono text-sm text-emerald-400">
                  {hash}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleDownloadQR}
                disabled={!qrDataUrl}
                className="rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
              >
                Download QR Code
              </button>
              <button
                onClick={handleDownloadKey}
                className="rounded-lg bg-neutral-700 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                Download Key File
              </button>
            </div>

            <button
              onClick={handleBackToRegister}
              className="w-full rounded-lg border border-neutral-700 bg-transparent px-4 py-3 text-sm font-semibold uppercase tracking-wide text-neutral-300 transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-600"
            >
              Register Another User
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-200 ring-1 ring-amber-500/20">
          <strong>📋 Important:</strong> Send both the QR code and hash key to the user securely. They'll need these to login.
        </div>
      </div>
    </div>
  );
}

export default function DevRegisterQRPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-950">
          <div className="text-neutral-400">Loading...</div>
        </div>
      }
    >
      <QRPageContent />
    </Suspense>
  );
}
