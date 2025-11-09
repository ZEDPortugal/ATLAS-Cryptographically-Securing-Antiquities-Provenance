"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import jsQR from "jsqr";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const router = useRouter();
  const { login } = useAuth();
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, hash }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store authentication state
      login(data.user);
      
      // Redirect to dashboard
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQRUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanMessage("Reading QR code...");
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          setHash(code.data);
          setScanMessage("✓ QR code scanned successfully");
          setTimeout(() => setScanMessage(""), 3000);
        } else {
          setError("Could not read QR code. Please try again or enter hash manually.");
          setScanMessage("");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            ATLAS
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Cryptographically Securing Antiquities Provenance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-2xl bg-neutral-900/80 p-8 shadow-lg shadow-black/50 ring-1 ring-neutral-700/50">
            {error && (
              <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 ring-1 ring-red-500/20">
                {error}
              </div>
            )}

            {scanMessage && (
              <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 ring-1 ring-emerald-500/20">
                {scanMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-neutral-300"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 block w-full rounded-lg bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 ring-1 ring-neutral-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label
                htmlFor="hash"
                className="block text-sm font-medium text-neutral-300"
              >
                Hash Key
              </label>
              <input
                id="hash"
                name="hash"
                type="text"
                autoComplete="off"
                required
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                className="mt-2 block w-full rounded-lg bg-neutral-800 px-4 py-3 font-mono text-sm text-white placeholder-neutral-500 ring-1 ring-neutral-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Enter your hash key"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-neutral-900 px-2 text-neutral-500">Or</span>
              </div>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleQRUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-lg border border-neutral-700 bg-transparent px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-600"
              >
                Upload QR Code
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold uppercase tracking-wide  transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-neutral-600">
          <p>Authorized access only</p>
        </div>
      </div>
    </div>
  );
}
