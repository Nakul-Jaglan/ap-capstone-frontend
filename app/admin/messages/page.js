'use client'

import BgLayout from '@/components/layout/bgLayout'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, ArrowLeft, Trash2, MessageSquare } from 'lucide-react'

function MessagesAdminPage() {
    const router = useRouter()
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 0 })
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('sentAt')
    const [sortOrder, setSortOrder] = useState('desc')

    const fetchMessages = async () => {
        setLoading(true)
        const token = localStorage.getItem('token')

        const params = new URLSearchParams({
            page: pagination.page,
            limit: pagination.limit,
            search,
            sortBy,
            sortOrder
        })

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/messages?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.status === 403) {
                setError('Access denied. Admin role required.')
                return
            }

            if (response.ok) {
                const result = await response.json()
                setMessages(result.data)
                setPagination(result.pagination)
            } else {
                setError('Failed to load messages')
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
            setError('Failed to load messages')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMessages()
    }, [pagination.page, pagination.limit, search, sortBy, sortOrder])

    const handleDelete = async (messageId) => {
        if (!confirm('Are you sure you want to delete this message?')) return

        const token = localStorage.getItem('token')
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/messages/${messageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                fetchMessages()
            }
        } catch (error) {
            console.error('Error deleting message:', error)
        }
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
            <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="flex align-center items-center mb-6 gap-4">
                        <button
                            onClick={() => router.push('/admin')}
                            className="p-2 text-black hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Messages</h1>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value)
                                        setPagination(prev => ({ ...prev, page: 1 }))
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                            >
                                <option value="sentAt">Sent Date</option>
                                <option value="content">Content</option>
                            </select>

                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {messages.map((message) => (
                                                <tr key={message.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                                                {message.sender.avatarUrl ? (
                                                                    <img src={message.sender.avatarUrl} alt={message.sender.username} className="w-full h-full rounded-full object-cover" />
                                                                ) : (
                                                                    message.sender.username[0].toUpperCase()
                                                                )}
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900">{message.sender.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 max-w-md truncate">
                                                            {message.deleted ? (
                                                                <span className="italic text-gray-400">Message deleted</span>
                                                            ) : (
                                                                message.content || <span className="italic text-gray-400">Media</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {message.channel.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(message.sentAt).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {!message.deleted && (
                                                            <button
                                                                onClick={() => handleDelete(message.id)}
                                                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
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
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                    Page {pagination.page} of {pagination.totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                                    disabled={pagination.page === pagination.totalPages}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default MessagesAdminPage