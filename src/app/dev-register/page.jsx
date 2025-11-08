"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Developer access key (in production, use environment variable)
const DEV_ACCESS_KEY = "ATLAS_DEV_2025";

export default function DevRegisterPage() {
  const [accessKey, setAccessKey] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAccessVerify = (e) => {
    e.preventDefault();
    if (accessKey === DEV_ACCESS_KEY) {
      setIsVerified(true);
      setError("");
    } else {
      setError("Invalid developer access key");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username, position }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Redirect to QR page with the hash
      router.push(`/dev-register/qr?hash=${data.hash}&username=${username}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex rounded-full bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400 ring-1 ring-amber-500/20">
              Developer Access Required
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white">
              User Registration
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Enter developer access key to continue
            </p>
          </div>

          <form onSubmit={handleAccessVerify} className="mt-8 space-y-6">
            <div className="space-y-4 rounded-2xl bg-neutral-900/80 p-8 shadow-lg shadow-black/50 ring-1 ring-neutral-700/50">
              {error && (
                <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 ring-1 ring-red-500/20">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="accessKey"
                  className="block text-sm font-medium text-neutral-300"
                >
                  Developer Access Key
                </label>
                <input
                  id="accessKey"
                  name="accessKey"
                  type="password"
                  required
                  autoFocus
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="mt-2 block w-full rounded-lg bg-neutral-800 px-4 py-3 font-mono text-white placeholder-neutral-500 ring-1 ring-neutral-700 transition focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Enter access key"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                Verify Access
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-neutral-600">
            <p>This page is restricted to authorized developers only</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
            ✓ Developer Access Granted
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white">
            User Registration
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Create new ATLAS user credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-2xl bg-neutral-900/80 p-8 shadow-lg shadow-black/50 ring-1 ring-neutral-700/50">
            {error && (
              <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 ring-1 ring-red-500/20">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-300"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 block w-full rounded-lg bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 ring-1 ring-neutral-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Enter full name"
              />
            </div>

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
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 block w-full rounded-lg bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 ring-1 ring-neutral-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label
                htmlFor="position"
                className="block text-sm font-medium text-neutral-300"
              >
                Company Position
              </label>
              <input
                id="position"
                name="position"
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="mt-2 block w-full rounded-lg bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 ring-1 ring-neutral-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g., Curator, Administrator"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Register User"}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-neutral-600">
          <p>User credentials will be generated after registration</p>
        </div>
      </div>
    </div>
  );
}
