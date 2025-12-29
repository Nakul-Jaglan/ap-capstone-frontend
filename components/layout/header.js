'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageSquare, Search, LogOut, User, X, Mail, Loader2 } from 'lucide-react'

function Header() {
    const router = useRouter()
    const [currentUser, setCurrentUser] = React.useState(null)
    const [showSearchModal, setShowSearchModal] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState('')
    const [searchResult, setSearchResult] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = localStorage.getItem('token')
            if (!token) return

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (response.ok) {
                    const data = await response.json()
                    setCurrentUser(data.data)
                }
            } catch (error) {
                console.error('Error fetching user:', error)
            }
        }

        fetchCurrentUser()
    }, [])

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchTerm.trim()) return

        setLoading(true)
        setError(null)
        setSearchResult(null)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${encodeURIComponent(searchTerm)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()

            if (response.ok) {
                setSearchResult(data.data)
            } else {
                setError(data.message || 'User not found')
            }
        } catch (err) {
            setError('Failed to search. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const closeModal = () => {
        setShowSearchModal(false)
        setSearchTerm('')
        setSearchResult(null)
        setError(null)
    }

    const goToMessage = (username) => {
        closeModal()
        router.push(`/messages/${username}`)
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        router.push('/login')
    }

    return (
        <>
            <header className="bg-[#401145] border-b border-gray-800 sticky top-0 z-40">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center gap-4 h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2 shrink-0">
                            <img src="/logo.png" alt="CollabSpace Logo" className="w-10 h-10" />
                            <span className="text-xl font-bold text-white hidden md:inline">CollabSpace</span>
                        </Link>

                        {/* Search Bar - Expanded */}
                        {currentUser && (
                            <>
                                <div className="flex-1 max-w-2xl">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search users by username or email..."
                                            onClick={() => setShowSearchModal(true)}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-2 bg-[#7f3a87] hover:bg-[#6e3378] text-white border border-[#7f3a87] hover:border-[#6e3378] rounded-lg focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* User Menu */}
                                <div className="flex items-center space-x-4 shrink-0">
                                    <Link href="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                                        <div className="w-8 h-8 bg-[#7f3a87] rounded-full flex items-center justify-center overflow-hidden">
                                            {currentUser.avatarUrl ? (
                                                <img
                                                    src={currentUser.avatarUrl}
                                                    alt={currentUser.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <span className="text-white hidden sm:inline">@{currentUser.username}</span>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-[#1b1d21] rounded-xl shadow-2xl w-full max-w-2xl " onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-300">
                            <h2 className="text-lg font-semibold text-white">Search Users</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-100 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-100 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Enter username or email..."
                                        className="w-full pl-10 pr-4 py-3  text-white border border-gray-100 rounded-lg focus:outline-none focus:border-[#7f3a87] transition-colors"
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !searchTerm.trim()}
                                    className="w-full bg-black hover:bg-gray-900 text-white py-3 rounded-lg font-medium transition-colors disabled:bg-black disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                            </form>

                            {/* Error Message */}
                            {error && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Search Result */}
                            {searchResult && (
                                <div className="mt-4 bg-[#222529] rounded-lg border border-gray-700 overflow-hidden">
                                    {/* Header with Avatar */}
                                    <div className="bg-[#30353f] p-6 border-b border-gray-700">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 bg-[#30353f] rounded-full flex items-center justify-center overflow-hidden shrink-0 border-4 border-gray-900">
                                                {searchResult.avatarUrl ? (
                                                    <img
                                                        src={searchResult.avatarUrl}
                                                        alt={searchResult.username}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-10 h-10 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-2xl font-bold text-white">
                                                    {searchResult.name || searchResult.username}
                                                </h3>
                                                <p className="text-lg text-gray-300">@{searchResult.username}</p>
                                                {searchResult.role && (
                                                    <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-xs font-semibold ${searchResult.role === 'admin'
                                                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                        : 'bg-[#7f3a87] text-white border border-[#7f3a87]/30'
                                                        }`}>
                                                        {searchResult.role.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Details */}
                                    <div className="p-6 space-y-4 bg-[#222529]">
                                        <div className="grid gap-4">
                                            <div className="flex items-start gap-3">
                                                <Mail className="w-5 h-5 text-[#7f3a87] shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                                                    <p className="text-white truncate">{searchResult.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <User className="w-5 h-5 text-[#7f3a87] shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Username</p>
                                                    <p className="text-white">@{searchResult.username}</p>
                                                </div>
                                            </div>

                                            {searchResult.bio && (
                                                <div className="flex items-start gap-3">
                                                    <MessageSquare className="w-5 h-5 text-[#7f3a87] shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bio</p>
                                                        <p className="text-white">{searchResult.bio}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {searchResult.lastActiveAt && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Last Active</p>
                                                        <p className="text-white">{new Date(searchResult.lastActiveAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-gray-700">
                                            <button
                                                onClick={() => goToMessage(searchResult.username)}
                                                className="w-full bg-[#7f3a87] hover:bg-[#6e337a] text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <MessageSquare className="w-5 h-5" />
                                                Send Message
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Header