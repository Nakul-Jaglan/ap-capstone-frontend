'use client'

import React, { useState } from 'react'
import { Search, User, Mail, AlertCircle, Loader2 } from 'lucide-react'

function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResult, setSearchResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()

        if (!searchTerm.trim()) {
            setError('Please enter a username or email')
            return
        }

        setLoading(true)
        setError(null)
        setSearchResult(null)
        setHasSearched(true)

        try {
            const token = localStorage.getItem('token')

            if (!token) {
                setError('You need to be logged in to search')
                setLoading(false)
                return
            }

            const backendUrl = process.env.NEXT_PUBLIC_API_URL
            const url = `${backendUrl}/users/${encodeURIComponent(searchTerm)}`

            console.log('Searching at:', url)

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            // Check if response is JSON
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Backend server is not responding correctly. Make sure the backend is running on port 4000.')
            }

            const data = await response.json()

            if (response.ok) {
                setSearchResult(data.data)
            } else {
                setError(data.message || 'User not found')
            }
        } catch (err) {
            console.error('Search error:', err)
            if (err.message.includes('Backend server')) {
                setError(err.message)
            } else if (err.message.includes('Failed to fetch')) {
                setError('Cannot connect to backend server')
            } else {
                setError('Failed to search. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        setSearchTerm('')
        setSearchResult(null)
        setError(null)
        setHasSearched(false)
    }

    return (
        <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">User Search</h1>
                    <p className="text-gray-600">Search for users by username or email</p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Enter username or email..."
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Search
                                    </>
                                )}
                            </button>

                            {(searchTerm || hasSearched) && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Search Result */}
                {searchResult && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-6 h-6 text-blue-600" />
                            User Found
                        </h2>

                        <div className="space-y-4">
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-linear-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {searchResult.avatarUrl ? (
                                        <img
                                            src={searchResult.avatarUrl}
                                            alt={searchResult.name || searchResult.username}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        searchResult.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {searchResult.name || searchResult.username}
                                    </h3>
                                    {searchResult.name && (
                                        <p className="text-gray-500">@{searchResult.username}</p>
                                    )}
                                </div>
                            </div>

                            {/* User Details */}
                            <div className="grid gap-3 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <span className="font-medium">Username:</span>
                                    <span>{searchResult.username}</span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-700">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span className="font-medium">Email:</span>
                                    <span>{searchResult.email}</span>
                                </div>

                                {searchResult.role && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <span className="font-medium">Role:</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${searchResult.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {searchResult.role.charAt(0).toUpperCase() + searchResult.role.slice(1)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => window.location.href = `/messages/${searchResult.username}`}
                                className="w-full mt-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                            >
                                Send Message
                            </button>
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!searchResult && !error && hasSearched && !loading && (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No user found with that username or email</p>
                    </div>
                )}
            </div>
        </main>
    )
}

export default SearchPage