"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
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

  useEffect(() => {
    fetchAccessCodeStats()
    fetchDashboardStats()
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

  const stats = [
    { label: 'Total Antiques', value: dashboardStats.loading ? '...' : dashboardStats.totalAntiques, icon: HiShieldCheck },
    { label: 'Verified Items', value: dashboardStats.loading ? '...' : dashboardStats.verifiedItems, icon: HiCheckCircle },
    { label: 'Pending', value: '—', icon: HiClock },
    { label: 'Chain Height', value: dashboardStats.loading ? '...' : dashboardStats.chainHeight, icon: HiLink },
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
          <h2 className="text-2xl font-semibold text-neutral-200 mb-6">Overview</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-neutral-900/80 p-6 shadow-lg ring-1 ring-neutral-700/50 backdrop-blur transition hover:ring-emerald-500/50"
                >
                  <IconComponent className="mb-3 text-4xl text-emerald-400" />
                  <div className="text-3xl font-bold text-emerald-400 mb-1">{stat.value}</div>
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
            <div className="rounded-2xl bg-neutral-900/80 p-6 shadow-lg ring-1 ring-cyan-500/30 backdrop-blur transition hover:ring-cyan-500/50">
              <HiKey className="mb-3 text-4xl text-cyan-400" />
              <div className="text-3xl font-bold text-cyan-400 mb-1">
                {accessCodeStats.loading ? '...' : accessCodeStats.total}
              </div>
              <div className="text-sm text-neutral-400">Total Codes</div>
            </div>
            <div className="rounded-2xl bg-neutral-900/80 p-6 shadow-lg ring-1 ring-emerald-500/30 backdrop-blur transition hover:ring-emerald-500/50">
              <HiCheckCircle className="mb-3 text-4xl text-emerald-400" />
              <div className="text-3xl font-bold text-emerald-400 mb-1">
                {accessCodeStats.loading ? '...' : accessCodeStats.active}
              </div>
              <div className="text-sm text-neutral-400">Active Codes</div>
            </div>
            <div className="rounded-2xl bg-neutral-900/80 p-6 shadow-lg ring-1 ring-neutral-700/30 backdrop-blur transition hover:ring-neutral-500/50">
              <HiClock className="mb-3 text-4xl text-neutral-400" />
              <div className="text-3xl font-bold text-neutral-400 mb-1">
                {accessCodeStats.loading ? '...' : accessCodeStats.expired}
              </div>
              <div className="text-sm text-neutral-400">Expired Codes</div>
            </div>
            <div className="rounded-2xl bg-neutral-900/80 p-6 shadow-lg ring-1 ring-purple-500/30 backdrop-blur transition hover:ring-purple-500/50">
              <HiClipboardList className="mb-3 text-4xl text-purple-400" />
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {accessCodeStats.loading ? '...' : accessCodeStats.totalUsage}
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
