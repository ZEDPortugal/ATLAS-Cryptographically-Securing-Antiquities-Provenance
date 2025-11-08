"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserRegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      router.push(`/user-register/qr?hash=${data.hash}&username=${username}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            User Registration
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Create your ATLAS access credentials
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
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 block w-full rounded-lg bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 ring-1 ring-neutral-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Enter your full name"
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
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-neutral-600">
          <p>Your access key will be generated after registration</p>
        </div>
      </div>
    </div>
  );
}
