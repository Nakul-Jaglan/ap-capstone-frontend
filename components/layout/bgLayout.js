'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Hash, MessageSquare, Plus, User, ChevronDown, ChevronRight } from 'lucide-react'
import Header from './header'

function BgLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [channels, setChannels] = useState([])
  const [dms, setDms] = useState([])
  const [showChannels, setShowChannels] = useState(true)
  const [showDMs, setShowDMs] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSidebarData()
    
    const interval = setInterval(fetchSidebarData, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchSidebarData()
  }, [pathname])

  const fetchSidebarData = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      // Fetch channels
      const channelsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/channels`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (channelsRes.ok) {
        const channelsData = await channelsRes.json()
        setChannels(channelsData.data)
      }

      // Fetch DMs
      const dmsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (dmsRes.ok) {
        const dmsData = await dmsRes.json()
        setDms(dmsData.data)
      }
    } catch (error) {
      console.error('Error fetching sidebar data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      
      <main className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
          <div className="p-4">
            {/* Channels Section */}
            <div className="mb-6">
              <button
                onClick={() => setShowChannels(!showChannels)}
                className="flex items-center justify-between w-full text-gray-400 hover:text-white mb-2 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {showChannels ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="text-sm font-semibold uppercase">Channels</span>
                </div>
                <Link
                  href="/channels"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-gray-800 rounded"
                  title="View all channels"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </button>

              {showChannels && (
                <div className="space-y-1">
                  {loading ? (
                    <div className="text-gray-500 text-sm px-2">Loading...</div>
                  ) : channels.length === 0 ? (
                    <div className="text-gray-500 text-sm px-2">No channels yet</div>
                  ) : (
                    channels.map((channel) => (
                      <Link
                        key={channel.id}
                        href={`/channels/${channel.id}`}
                        className={`flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-gray-800 transition-colors ${
                          pathname === `/channels/${channel.id}` ? 'bg-gray-800 text-white' : 'text-gray-300'
                        }`}
                      >
                        <Hash className="w-4 h-4 shrink-0" />
                        <span className="text-sm truncate">{channel.name}</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Direct Messages Section */}
            <div>
              <button
                onClick={() => setShowDMs(!showDMs)}
                className="flex items-center justify-between w-full text-gray-400 hover:text-white mb-2 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {showDMs ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="text-sm font-semibold uppercase">Direct Messages</span>
                </div>
                <Link
                  href="/search"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-gray-800 rounded"
                  title="Start new DM"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </button>

              {showDMs && (
                <div className="space-y-1">
                  {loading ? (
                    <div className="text-gray-500 text-sm px-2">Loading...</div>
                  ) : dms.length === 0 ? (
                    <div className="text-gray-500 text-sm px-2">No messages yet</div>
                  ) : (
                    dms.map((dm) => (
                      <Link
                        key={dm.channel.id}
                        href={`/messages/${dm.otherUser.username}`}
                        className={`flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-gray-800 transition-colors ${
                          pathname === `/messages/${dm.otherUser.username}` ? 'bg-gray-800 text-white' : 'text-gray-300'
                        }`}
                      >
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                          {dm.otherUser.avatarUrl ? (
                            <img
                              src={dm.otherUser.avatarUrl}
                              alt={dm.otherUser.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm truncate">{dm.otherUser.username}</span>
                            {dm.unreadCount > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                {dm.unreadCount}
                              </span>
                            )}
                          </div>
                          {dm.lastMessage && (
                            <p className="text-xs text-gray-500 truncate">
                              {dm.lastMessage.content || 'Media'}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}

export default BgLayout