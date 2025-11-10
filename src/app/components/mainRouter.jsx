"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { 
  HiDocumentText, 
  HiSearch, 
  HiCube, 
  HiChartBar,
  HiShieldCheck,
  HiCheckCircle,
  HiClock,
  HiLink,
  HiLockClosed,
  HiGlobeAlt,
  HiDatabase,
  HiSparkles,
  HiClipboardList,
  HiChevronRight,
  HiKey
} from 'react-icons/hi'

export default function MainRouter() {
  const { user } = useAuth()
  const [accessCodeStats, setAccessCodeStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalUsage: 0,
    loading: true
  })
  const [dashboardStats, setDashboardStats] = useState({
    totalAntiques: '—',
    verifiedItems: '—',
    chainHeight: '—',
    loading: true
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Initial fetch
  useEffect(() => {
    fetchAccessCodeStats()
    fetchDashboardStats()
  }, [])

  // Real-time polling - refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      fetchAccessCodeStats();
      fetchDashboardStats();
      setLastUpdate(Date.now());
      setTimeout(() => setIsRefreshing(false), 500);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/dashboard-stats');
      const data = await res.json();
      if (data.success) {
        setDashboardStats({
          totalAntiques: data.stats.totalAntiques,
          verifiedItems: data.stats.verifiedItems,
          chainHeight: data.stats.chainHeight,
          loading: false
        });
      } else {
        setDashboardStats(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setDashboardStats(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchAccessCodeStats = async () => {
    try {
      const res = await fetch('/api/access-codes/list')
      const data = await res.json()
      
      if (data.success) {
        const now = Date.now()
        const active = data.codes.filter(code => code.expiresAt > now).length
        const expired = data.codes.filter(code => code.expiresAt <= now).length
        const totalUsage = data.codes.reduce((sum, code) => sum + (code.usageCount || 0), 0)
        
        setAccessCodeStats({
          total: data.codes.length,
          active,
          expired,
          totalUsage,
          loading: false
        })
      }
    } catch (error) {
      console.error('Failed to fetch access code stats:', error)
      setAccessCodeStats(prev => ({ ...prev, loading: false }))
    }
  }

  const quickActions = [
    {
      title: 'Register Antique',
      description: 'Register a new antique on the blockchain',
      href: '/register',
      icon: HiDocumentText,
      color: 'emerald',
    },
    {
      title: 'Verify Antique',
      description: 'Verify the authenticity of an antique',
      href: '/verify',
      icon: HiSearch,
      color: 'blue',
    },
    {
      title: 'View Items',
      description: 'Browse all registered antiques',
      href: '/items',
      icon: HiCube,
      color: 'purple',
    },
    {
      title: 'View Records',
      description: 'Access blockchain records',
      href: '/records',
      icon: HiChartBar,
      color: 'amber',
    },
    {
      title: 'Staff Control',
      description: 'Manage buyer verification access codes',
      href: '/admin/access-codes',
      icon: HiKey,
      color: 'cyan',
    },
  ]

  // Use animated number hook for visual feedback
  const [totalAntiquesDisplay, totalAntiquesChanged] = useAnimatedNumber(dashboardStats.totalAntiques);
  const [verifiedItemsDisplay, verifiedItemsChanged] = useAnimatedNumber(dashboardStats.verifiedItems);
  const [chainHeightDisplay, chainHeightChanged] = useAnimatedNumber(dashboardStats.chainHeight);
  const [totalCodesDisplay, totalCodesChanged] = useAnimatedNumber(accessCodeStats.total);
  const [activeCodesDisplay, activeCodesChanged] = useAnimatedNumber(accessCodeStats.active);
  const [expiredCodesDisplay, expiredCodesChanged] = useAnimatedNumber(accessCodeStats.expired);
  const [totalUsageDisplay, totalUsageChanged] = useAnimatedNumber(accessCodeStats.totalUsage);

  const stats = [
    { 
      label: 'Total Antiques', 
      value: dashboardStats.loading ? '...' : totalAntiquesDisplay, 
      icon: HiShieldCheck,
      changed: totalAntiquesChanged
    },
    { 
      label: 'Verified Items', 
      value: dashboardStats.loading ? '...' : verifiedItemsDisplay, 
      icon: HiCheckCircle,
      changed: verifiedItemsChanged
    },
    { 
      label: 'Pending', 
      value: '—', 
      icon: HiClock,
      changed: false
    },
    { 
      label: 'Chain Height', 
      value: dashboardStats.loading ? '...' : chainHeightDisplay, 
      icon: HiLink,
      changed: chainHeightChanged
    },
  ]

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Section */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-emerald-400 mb-3 md:text-5xl">
            Welcome back{user?.username ? `, ${user.username}` : ''}
          </h1>
          <p className="text-neutral-400 text-lg">
            Manage and verify antique provenance with blockchain security
          </p>
        </section>

        {/* Stats Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-neutral-200">Overview</h2>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <div className={`w-2 h-2 rounded-full bg-emerald-400 ${isRefreshing ? 'animate-pulse scale-125' : ''} transition-transform`}></div>
              <span>Live updates</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div
                  key={index}
                  className={`rounded-2xl bg-neutral-900/80 p-6 shadow-lg ring-1 ring-neutral-700/50 backdrop-blur transition-all duration-300 hover:ring-emerald-500/50 ${
                    isRefreshing ? 'scale-[1.02]' : ''
                  } ${stat.changed ? 'ring-emerald-400' : ''}`}
                >
                  <IconComponent className="mb-3 text-4xl text-emerald-400" />
                  <div className={`text-3xl font-bold text-emerald-400 mb-1 transition-all duration-300 ${
                    stat.changed ? 'scale-110' : ''
                  }`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-400">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Access Code Statistics */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-neutral-200">Access Code Statistics</h2>
            <Link
              href="/admin/access-codes"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
            >
              View All
              <HiChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            <div className={`rounded-2xl bg-neutral-900/80 p-6 shadow-lg ring-1 ring-cyan-500/30 backdrop-blur transition-all duration-300 hover:ring-cyan-500/50 ${
              isRefreshing ? 'scale-[1.02]' : ''
            } ${totalCodesChanged ? 'ring-cyan-400' : ''}`}>
              <HiKey className="mb-3 text-4xl text-cyan-400" />
              <div className={`text-3xl font-bold text-cyan-400 mb-1 transition-all duration-300 ${
                totalCodesChanged ? 'scale-110' : ''
              }`}>
                {accessCodeStats.loading ? '...' : totalCodesDisplay}
              </div>
              <div className="text-sm text-neutral-400">Total Codes</div>
            </div>
            <div className={`rounded-2xl bg-neutral-900/80 p-6 shadow-lg ring-1 ring-emerald-500/30 backdrop-blur transition-all duration-300 hover:ring-emerald-500/50 ${
              isRefreshing ? 'scale-[1.02]' : ''
            } ${activeCodesChanged ? 'ring-emerald-400' : ''}`}>
              <HiCheckCircle className="mb-3 text-4xl text-emerald-400" />
              <div className={`text-3xl font-bold text-emerald-400 mb-1 transition-all duration-300 ${
                activeCodesChanged ? 'scale-110' : ''
              }`}>
                {accessCodeStats.loading ? '...' : activeCodesDisplay}
              </div>
              <div className="text-sm text-neutral-400">Active Codes</div>
            </div>
            <div className={`rounded-2xl bg-neutral-900/80 p-6 shadow-lg ring-1 ring-neutral-700/30 backdrop-blur transition-all duration-300 hover:ring-neutral-500/50 ${
              isRefreshing ? 'scale-[1.02]' : ''
            } ${expiredCodesChanged ? 'ring-neutral-400' : ''}`}>
              <HiClock className="mb-3 text-4xl text-neutral-400" />
              <div className={`text-3xl font-bold text-neutral-400 mb-1 transition-all duration-300 ${
                expiredCodesChanged ? 'scale-110' : ''
              }`}>
                {accessCodeStats.loading ? '...' : expiredCodesDisplay}
              </div>
              <div className="text-sm text-neutral-400">Expired Codes</div>
            </div>
            <div className={`rounded-2xl bg-neutral-900/80 p-6 shadow-lg ring-1 ring-purple-500/30 backdrop-blur transition-all duration-300 hover:ring-purple-500/50 ${
              isRefreshing ? 'scale-[1.02]' : ''
            } ${totalUsageChanged ? 'ring-purple-400' : ''}`}>
              <HiClipboardList className="mb-3 text-4xl text-purple-400" />
              <div className={`text-3xl font-bold text-purple-400 mb-1 transition-all duration-300 ${
                totalUsageChanged ? 'scale-110' : ''
              }`}>
                {accessCodeStats.loading ? '...' : totalUsageDisplay}
              </div>
              <div className="text-sm text-neutral-400">Total Uses</div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-neutral-200 mb-6">Quick Actions</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="group relative overflow-hidden rounded-2xl bg-neutral-900/80 p-8 shadow-lg ring-1 ring-neutral-700/50 backdrop-blur transition hover:ring-emerald-400 hover:shadow-emerald-500/20 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                >
                  <div className="flex items-start gap-6">
                    <div className="shrink-0 transition-transform group-hover:scale-110">
                      <IconComponent className="text-5xl text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-neutral-100 mb-2 group-hover:text-emerald-400 transition">
                        {action.title}
                      </h3>
                      <p className="text-neutral-400 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-neutral-600 group-hover:text-emerald-400 transition">
                      <HiChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-neutral-200 mb-6">Recent Activity</h2>
          <div className="rounded-2xl bg-neutral-900/80 p-8 shadow-lg ring-1 ring-neutral-700/50 backdrop-blur">
            <div className="text-center py-12">
              <HiClipboardList className="text-6xl text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400 text-lg mb-2">No recent activity</p>
              <p className="text-neutral-500 text-sm">
                Your antique registrations and verifications will appear here
              </p>
            </div>
          </div>
        </section>

        {/* System Info */}
        <section>
          <h2 className="text-2xl font-semibold text-neutral-200 mb-6">System Information</h2>
          <div className="rounded-2xl bg-neutral-900/80 p-8 shadow-lg ring-1 ring-neutral-700/50 backdrop-blur">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <HiLockClosed className="text-3xl text-emerald-400" />
                <div>
                  <div className="text-sm text-neutral-400">Security</div>
                  <div className="font-semibold text-neutral-200">Blockchain Secured</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HiGlobeAlt className="text-3xl text-emerald-400" />
                <div>
                  <div className="text-sm text-neutral-400">Network</div>
                  <div className="font-semibold text-neutral-200">Connected</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HiDatabase className="text-3xl text-emerald-400" />
                <div>
                  <div className="text-sm text-neutral-400">Storage</div>
                  <div className="font-semibold text-neutral-200">Local Database</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HiSparkles className="text-3xl text-emerald-400" />
                <div>
                  <div className="text-sm text-neutral-400">Status</div>
                  <div className="font-semibold text-emerald-400">All Systems Operational</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
