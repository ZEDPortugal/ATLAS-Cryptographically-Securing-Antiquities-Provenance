"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AccessCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expirationHours, setExpirationHours] = useState(48);
  const [message, setMessage] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Initial load
  useEffect(() => {
    loadCodes();
  }, []);

  // Real-time polling - refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      loadCodes(true); // Silent refresh
      setLastUpdate(Date.now());
      setTimeout(() => setIsRefreshing(false), 500);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Update time remaining counters every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update time remaining displays
      setCodes(prevCodes => [...prevCodes]);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const loadCodes = async (silent = false) => {
    try {
      const res = await fetch("/api/access-codes/list");
      const data = await res.json();
      if (data.success) {
        setCodes(data.codes);
      }
    } catch (err) {
      console.error("Failed to load codes:", err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const generateCode = async () => {
    setGenerating(true);
    setMessage("");
    setGeneratedCode(null);

    try {
      const res = await fetch("/api/access-codes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expirationHours }),
      });

      const data = await res.json();

      if (data.success) {
        setGeneratedCode(data);
        setMessage("✓ Access code generated successfully!");
        await loadCodes();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Failed to generate access code");
    } finally {
      setGenerating(false);
    }
  };

  const cleanupExpired = async () => {
    try {
      const res = await fetch("/api/access-codes/list", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage(`✓ Removed ${data.removed} expired code(s)`);
        await loadCodes();
      }
    } catch (err) {
      setMessage("Failed to cleanup codes");
    }
  };

  const deleteCode = async (code) => {
    if (!confirm(`Delete access code ${code}?`)) {
      return;
    }
    
    try {
      const res = await fetch("/api/access-codes/validate", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✓ Code ${code} deleted successfully`);
        await loadCodes();
      } else {
        setMessage(`Error: ${data.error || "Failed to delete code"}`);
      }
    } catch (err) {
      setMessage("Failed to delete code");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage("✓ Copied to clipboard!");
    setTimeout(() => setMessage(""), 2000);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const isExpired = (expiresAt) => {
    return expiresAt < Date.now();
  };

  const getTimeRemaining = (expiresAt) => {
    const diff = expiresAt - Date.now();
    if (diff < 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen pb-12 px-4">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold uppercase tracking-[0.25em] text-emerald-400">
                  Access Control
                </h1>
                <p className="mt-2 text-sm text-neutral-400">
                  Manage verification access for Owner and collectors
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <div className={`w-2 h-2 rounded-full bg-cyan-400 ${isRefreshing ? 'animate-pulse scale-125' : ''} transition-transform`}></div>
                <span>Live updates</span>
              </div>
            </div>
          </div>

          {/* Generate New Code Card */}
          <div className="mb-6 rounded-3xl bg-neutral-900/70 p-6 shadow-xl border border-neutral-800 hover:shadow-2xl transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
        
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-neutral-100">
                  Generate Access Code
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Create time-limited codes for Owners and Collectors verification
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-200 mb-2">
                  Expiration Time
                </label>
                <select
                  value={expirationHours}
                  onChange={(e) => setExpirationHours(Number(e.target.value))}
                  className="w-full rounded-xl bg-neutral-950/80 text-neutral-100 px-4 py-3 border border-neutral-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent shadow-sm"
                >
                  <option value={1}>1 hour</option>
                  <option value={6}>6 hours</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours (1 day)</option>
                  <option value={48}>48 hours (2 days)</option>
                  <option value={72}>72 hours (3 days)</option>
                  <option value={168}>168 hours (7 days)</option>
                </select>
              </div>

              <button
                onClick={generateCode}
                disabled={generating}
                className="w-full sm:w-auto rounded-xl bg-emerald-500 text-white px-6 py-3 text-sm font-semibold uppercase tracking-wide transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {generating ? "Generating..." : "Generate Code"}
              </button>
            </div>

            {message && (
              <div
                className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium border ${
                  message.startsWith("✓")
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {message}
              </div>
            )}

            {generatedCode && (
              <div className="mt-6 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/5 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2 font-semibold">
                      New Access Code
                    </p>
                    <p className="text-3xl font-mono font-bold text-emerald-400 tracking-wider">
                      {generatedCode.code}
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      Expires: {formatDate(generatedCode.expiresAt)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedCode.code)}
                      className="rounded-xl border-2 border-emerald-400 bg-transparent text-emerald-400 px-4 py-2 text-sm font-semibold transition hover:bg-emerald-500/10 shadow-sm"
                    >
                      Copy Code
                    </button>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/verify-secure`
                        )
                      }
                      className="rounded-xl border-2 border-neutral-700 bg-transparent text-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-800 shadow-sm"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View All Codes Card */}
          <div className="mb-6 rounded-3xl bg-neutral-900/70 p-6 shadow-xl border border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
      
                <div>
                  <h2 className="text-xl font-bold text-neutral-100">
                    All Access Codes
                  </h2>
                  <p className="text-sm text-neutral-400">
                    {codes.length} code(s) total
                  </p>
                </div>
              </div>
              <button
                onClick={cleanupExpired}
                className="rounded-xl border-2 border-neutral-700 bg-transparent text-neutral-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-neutral-800 shadow-sm"
              >
                Cleanup Expired
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-neutral-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-neutral-300 border-t-emerald-500"></div>
                <p className="mt-4">Loading codes...</p>
              </div>
            ) : codes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-neutral-400 font-medium">No access codes generated yet</p>
                <p className="text-sm text-neutral-500 mt-1">Generate your first code above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {codes.map((code) => (
                  <div
                    key={code.code}
                    className={`rounded-2xl border-2 p-4 transition-all duration-300 hover:shadow-sm ${
                      isExpired(code.expiresAt)
                        ? "border-neutral-800 bg-neutral-900/70 opacity-60"
                        : "border-neutral-700 bg-neutral-900/70 shadow-sm"
                    } ${isRefreshing ? 'scale-[1.01]' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-mono font-bold text-neutral-100">
                            {code.code}
                          </span>
                          {isExpired(code.expiresAt) ? (
                            <span className="rounded-full bg-red-500/20 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-400 uppercase">
                              Expired
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400">
                          <span>
                            Created: {formatDate(code.createdAt)}
                          </span>
                          <span>
                            Expires: {formatDate(code.expiresAt)}
                          </span>
                          <span>
                            Time left: {getTimeRemaining(code.expiresAt)}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                          Used {code.usageCount} time(s)
                          {code.lastUsed &&
                            ` • Last used: ${formatDate(code.lastUsed)}`}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="self-start sm:self-center rounded-xl border-2 border-neutral-700 bg-transparent text-neutral-200 px-4 py-2 text-xs font-semibold transition hover:bg-neutral-800 shadow-sm"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => deleteCode(code.code)}
                          className="self-start sm:self-center rounded-xl border-2 border-red-500/50 bg-transparent text-red-400 px-4 py-2 text-xs font-semibold transition hover:bg-red-500/10 hover:border-red-500 shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions Card */}
          <div className="rounded-3xl bg-neutral-900/70 p-6 shadow-xl border border-neutral-800">
            <div className="flex items-center gap-4 mb-4">
              
              <div>
                <h3 className="text-lg font-bold text-neutral-100">
                  How to Share
                </h3>
                <p className="text-sm text-neutral-400">
                  Instructions for sharing verification access
                </p>
              </div>
            </div>
            <ol className="space-y-3 text-sm text-neutral-400 list-decimal list-inside ml-4">
              <li className="pl-2">Generate a new access code with desired expiration time</li>
              <li className="pl-2">
                Share the verification link:{" "}
                <code className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded font-mono text-xs">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/verify-secure`
                    : "/verify-secure"}
                </code>
              </li>
              <li className="pl-2">Provide the access code to the Owners and Collectors (via email, SMS, etc.)</li>
              <li className="pl-2">Buyer enters the code to access the verification portal</li>
              <li className="pl-2">Codes expire automatically after the specified time</li>
            </ol>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
