'use client'

import BgLayout from '@/components/layout/bgLayout'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ArrowLeft, Phone, Video } from 'lucide-react'

function CallsAdminPage() {
    const router = useRouter()
    const [calls, setCalls] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 0 })
    const [typeFilter, setTypeFilter] = useState('')
    const [sortBy, setSortBy] = useState('startedAt')
    const [sortOrder, setSortOrder] = useState('desc')

    const fetchCalls = async () => {
        setLoading(true)
        const token = localStorage.getItem('token')

        const params = new URLSearchParams({
            page: pagination.page,
            limit: pagination.limit,
            sortBy,
            sortOrder,
            ...(typeFilter && { callType: typeFilter })
        })

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/calls?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.status === 403) {
                setError('Access denied. Admin role required.')
                return
            }

            if (response.ok) {
                const result = await response.json()
                setCalls(result.data)
                setPagination(result.pagination)
            } else {
                setError('Failed to load calls')
            }
        } catch (error) {
            console.error('Error fetching calls:', error)
            setError('Failed to load calls')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCalls()
    }, [pagination.page, pagination.limit, typeFilter, sortBy, sortOrder])

    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A'
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}m ${secs}s`
    }

    if (error) {
        return (
            <BgLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <p className="text-red-600 text-lg mb-4">{error}</p>
                        <button onClick={() => router.push('/admin')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </BgLayout>
        )
    }

    return (
        <BgLayout>
            <div className="p-4 sm:p-6 bg-[#1b1d21] min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="flex align-center items-center mb-6 gap-4">
                        <button
                            onClick={() => router.push('/admin')}
                            className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors shrink-0"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Manage Calls</h1>
                    </div>
                    <div className="bg-[#2c2540] rounded-lg shadow p-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value)
                                    setPagination(prev => ({ ...prev, page: 1 }))
                                }}
                                className="px-4 py-2 text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                <option value="audio">Audio Calls</option>
                                <option value="video">Video Calls</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100"
                            >
                                <option value="startedAt">Start Time</option>
                                <option value="duration">Duration</option>
                            </select>

                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100"
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-[#2c2540] rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-[#2c2540]">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Initiator</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Channel</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Participants</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Duration</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Started At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-[#2c2540] divide-y divide-gray-700">
                                            {calls.map((call) => (
                                                <tr key={call.id} className="hover:bg-gray-800">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {call.callType === 'video' ? (
                                                                <Video className="w-5 h-5 text-blue-600" />
                                                            ) : (
                                                                <Phone className="w-5 h-5 text-green-600" />
                                                            )}
                                                            <span className="ml-2 text-sm font-medium text-gray-100 capitalize">{call.callType}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 bg-[#7c3aed] rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                                                {call.initiator.avatarUrl ? (
                                                                    <img src={call.initiator.avatarUrl} alt={call.initiator.username} className="w-full h-full rounded-full object-cover" />
                                                                ) : (
                                                                    call.initiator.username[0].toUpperCase()
                                                                )}
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-100">{call.initiator.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                                        {call.channel.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                                        {call.participants?.length || 0}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                                        {formatDuration(call.duration)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                                        {new Date(call.startedAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className=" px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-200">
                                                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                                                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                                                <span className="font-medium">{pagination.total}</span> results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                <button
                                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                                    disabled={pagination.page === 1}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-200">
                                                    Page {pagination.page} of {pagination.totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                                    disabled={pagination.page === pagination.totalPages}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </BgLayout>
    )
}

export default CallsAdminPage