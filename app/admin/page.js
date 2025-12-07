'use client'

import BgLayout from '@/components/layout/bgLayout'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, MessageSquare, Hash, Phone, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.status === 403) {
          setError('Access denied. Admin role required.')
          return
        }

        if (response.ok) {
          const result = await response.json()
          setStats(result.data)
        } else {
          setError('Failed to load stats')
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        setError('Failed to load stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

  if (loading) {
    return (
      <BgLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </BgLayout>
    )
  }

  if (error) {
    return (
      <BgLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </BgLayout>
    )
  }

  return (
    <BgLayout>
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Channels</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalChannels || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Hash className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Messages</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalMessages || 0}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Calls</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalCalls || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Phone className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">New Users (Last 7 Days)</h2>
              </div>
              <p className="text-4xl font-bold text-indigo-600">{stats?.recentUsers || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Users by Role</h2>
              </div>
              <div className="space-y-2">
                {stats?.usersByRole?.map((item) => (
                  <div key={item.role} className="flex justify-between items-center">
                    <span className="text-gray-600 capitalize">{item.role}</span>
                    <span className="font-semibold text-gray-900">{item._count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
              </div>
              <p className="text-sm text-gray-600">View, search, and manage all users</p>
            </Link>

            <Link href="/admin/channels" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Hash className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Manage Channels</h3>
              </div>
              <p className="text-sm text-gray-600">View and manage all channels</p>
            </Link>

            <Link href="/admin/messages" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Manage Messages</h3>
              </div>
              <p className="text-sm text-gray-600">View and moderate messages</p>
            </Link>

            <Link href="/admin/calls" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Call Logs</h3>
              </div>
              <p className="text-sm text-gray-600">View call history and logs</p>
            </Link>
          </div>
        </div>
      </div>
    </BgLayout>
  )
}

export default AdminPage