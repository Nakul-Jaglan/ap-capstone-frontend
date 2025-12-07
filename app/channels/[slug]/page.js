'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Send, ArrowLeft, Users, Copy, UserPlus, Hash, Edit2, Trash2, X, Check, MoreVertical, Phone, Video } from 'lucide-react'
import { io } from 'socket.io-client'
import { useCall } from '../../contexts/CallContext'
import BgLayout from '@/components/layout/bgLayout'

function ChannelDetailPage() {
    const { startCall } = useCall()
    const params = useParams()
    const router = useRouter()
    const channelId = params.slug

    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [channel, setChannel] = useState(null)
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const [isTyping, setIsTyping] = useState(false)
    const [typingUsers, setTypingUsers] = useState(new Set())
    const [editingMessageId, setEditingMessageId] = useState(null)
    const [editContent, setEditContent] = useState('')
    const [hoveredMessageId, setHoveredMessageId] = useState(null)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteInput, setInviteInput] = useState('')
    const [inviteError, setInviteError] = useState('')
    const [showMembersModal, setShowMembersModal] = useState(false)
    const [copiedInvite, setCopiedInvite] = useState(false)
    const [inviting, setInviting] = useState(false)

    const messagesEndRef = useRef(null)
    const socketRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Get current user info
    useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const result = await response.json()
                    setCurrentUser(result.data)
                } else {
                    router.push('/login')
                }
            } catch (error) {
                console.error('Error fetching user:', error)
                router.push('/login')
            }
        }

        fetchCurrentUser()
    }, [router])

    // Fetch channel data
    useEffect(() => {
        const fetchChannel = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                )

                if (response.ok) {
                    const result = await response.json()
                    setChannel(result.data.channel)
                    setMessages(result.data.messages)
                    setMembers(result.data.members)
                } else {
                    const errorData = await response.json()
                    setError(errorData.message || 'Failed to load channel')
                }
            } catch (error) {
                console.error('Error fetching channel:', error)
                setError('Failed to load channel')
            } finally {
                setLoading(false)
            }
        }

        if (currentUser) {
            fetchChannel()
        }
    }, [channelId, currentUser, router])

    // Setup Socket.IO
    useEffect(() => {
        if (!channel || !currentUser) return

        socketRef.current = io(process.env.NEXT_PUBLIC_API_URL)

        socketRef.current.emit('join_channel', channel.id)

        socketRef.current.on('new_message', (message) => {
            setMessages(prev => [...prev, message])
        })

        socketRef.current.on('message_updated', (updatedMessage) => {
            setMessages(prev => prev.map(msg =>
                msg.id === updatedMessage.id ? updatedMessage : msg
            ))
        })

        socketRef.current.on('message_removed', ({ messageId }) => {
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, deleted: true, content: null } : msg
            ))
        })

        socketRef.current.on('user_typing', ({ username }) => {
            setTypingUsers(prev => new Set([...prev, username]))
        })

        socketRef.current.on('user_stop_typing', ({ username }) => {
            setTypingUsers(prev => {
                const newSet = new Set(prev)
                newSet.delete(username)
                return newSet
            })
        })

        socketRef.current.on('message_read_update', ({ messageId, userId }) => {
            setMessages(prev => prev.map(msg =>
                msg.id === messageId
                    ? { ...msg, readBy: [...(msg.readBy || []), userId] }
                    : msg
            ))
        })

        const markMessagesAsRead = async () => {
            const token = localStorage.getItem('token')
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/mark-read`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ channelId: channel.id })
                })
            } catch (error) {
                console.error('Error marking messages as read:', error)
            }
        }
        markMessagesAsRead()

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave_channel', channel.id)
                socketRef.current.disconnect()
            }
        }
    }, [channel, currentUser])

    const handleTyping = () => {
        if (!socketRef.current || !channel) return

        if (!isTyping) {
            setIsTyping(true)
            socketRef.current.emit('typing', {
                channelId: channel.id,
                username: currentUser.username
            })
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false)
            socketRef.current.emit('stop_typing', {
                channelId: channel.id,
                username: currentUser.username
            })
        }, 1000)
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || sending) return

        setSending(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    channelId: channel.id,
                    content: newMessage.trim()
                })
            })

            if (response.ok) {
                const result = await response.json()
                setMessages(prev => [...prev, result.data])
                setNewMessage('')

                if (socketRef.current) {
                    socketRef.current.emit('new_message_broadcast', {
                        channelId: channel.id,
                        message: result.data
                    })
                }

                if (isTyping) {
                    setIsTyping(false)
                    socketRef.current.emit('stop_typing', {
                        channelId: channel.id,
                        username: currentUser.username
                    })
                }
            }
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setSending(false)
        }
    }

    const startEditing = (message) => {
        setEditingMessageId(message.id)
        setEditContent(message.content)
    }

    const cancelEditing = () => {
        setEditingMessageId(null)
        setEditContent('')
    }

    const handleEditMessage = async (messageId) => {
        if (!editContent.trim()) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: editContent.trim() })
            })

            if (response.ok) {
                const result = await response.json()
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId ? result.data : msg
                ))
                cancelEditing()

                if (socketRef.current) {
                    socketRef.current.emit('message_edited', {
                        channelId: channel.id,
                        message: result.data
                    })
                }
            }
        } catch (error) {
            console.error('Error editing message:', error)
        }
    }

    const handleDeleteMessage = async (messageId) => {
        if (!confirm('Are you sure you want to delete this message?')) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId ? { ...msg, deleted: true, content: null } : msg
                ))

                if (socketRef.current) {
                    socketRef.current.emit('message_deleted', {
                        channelId: channel.id,
                        messageId
                    })
                }
            }
        } catch (error) {
            console.error('Error deleting message:', error)
        }
    }

    const handleInviteUser = async (e) => {
        e.preventDefault()
        setInviteError('')

        if (!inviteInput.trim()) {
            setInviteError('Please enter a username or email')
            return
        }

        setInviting(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ usernameOrEmail: inviteInput.trim() })
            })

            const result = await response.json()

            if (response.ok) {
                setMembers(prev => [...prev, result.data.invitedUser])
                setInviteInput('')
                setShowInviteModal(false)
            } else {
                setInviteError(result.message || 'Failed to invite user')
            }
        } catch (error) {
            console.error('Error inviting user:', error)
            setInviteError('Failed to invite user')
        } finally {
            setInviting(false)
        }
    }

    const copyInviteLink = () => {
        const inviteLink = `${window.location.origin}/channels/join/${channel.inviteCode}`
        navigator.clipboard.writeText(inviteLink)
        setCopiedInvite(true)
        setTimeout(() => setCopiedInvite(false), 2000)
    }

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    const formatDate = (date) => {
        const msgDate = new Date(date)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (msgDate.toDateString() === today.toDateString()) {
            return 'Today'
        } else if (msgDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday'
        } else {
            return msgDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        }
    }

    const groupMessagesByDate = (messages) => {
        const groups = {}
        messages.forEach(message => {
            const date = formatDate(message.sentAt)
            if (!groups[date]) {
                groups[date] = []
            }
            groups[date].push(message)
        })
        return groups
    }

    if (loading) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading channel...</p>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/channels')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Back to Channels
                    </button>
                </div>
            </main>
        )
    }

    const messageGroups = groupMessagesByDate(messages)

    return (
        <BgLayout>
            <main className="flex flex-col min-h-[93vh] bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                            <button
                                onClick={() => router.push('/channels')}
                                className="p-2 text-black hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg shrink-0">
                                    <Hash size={20} className="text-indigo-600 sm:w-6 sm:h-6" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-base sm:text-xl font-semibold text-gray-800 truncate">{channel?.name}</h1>
                                    {channel?.description && (
                                        <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">{channel.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => startCall(channel.id, null, channel.name, 'audio')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Start voice call"
                            >
                                <Phone size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />
                            </button>
                            <button
                                onClick={() => startCall(channel.id, null, channel.name, 'video')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Start video call"
                            >
                                <Video size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />
                            </button>
                            <button
                                onClick={() => setShowMembersModal(true)}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                                <span className="text-xs sm:text-sm font-medium">{members.length}</span>
                            </button>
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
                                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Invite</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4">
                    {Object.entries(messageGroups).map(([date, dateMessages]) => (
                        <div key={date}>
                            <div className="flex items-center justify-center my-4">
                                <div className="px-4 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                                    {date}
                                </div>
                            </div>
                            {dateMessages.map((message) => {
                                const isOwnMessage = message.senderId === currentUser?.id
                                const isEditing = editingMessageId === message.id
                                const isHovered = hoveredMessageId === message.id

                                return (
                                    <div
                                        key={message.id}
                                        className="mb-4"
                                        onMouseEnter={() => setHoveredMessageId(message.id)}
                                        onMouseLeave={() => setHoveredMessageId(null)}
                                    >
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold shrink-0 text-sm sm:text-base">
                                                {message.sender?.name?.[0]?.toUpperCase() || message.sender?.username?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-1 sm:gap-2 mb-1 flex-wrap">
                                                    <span className="font-semibold text-gray-900 text-sm sm:text-base">
                                                        {message.sender?.name || message.sender?.username}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(message.sentAt)}
                                                    </span>
                                                    {message.updatedAt && !message.deleted && (
                                                        <span className="text-xs text-gray-400 italic">(edited)</span>
                                                    )}
                                                </div>
                                                {message.deleted ? (
                                                    <p className="text-gray-400 italic">This message was deleted</p>
                                                ) : isEditing ? (
                                                    <div className="flex items-start gap-2">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                                            rows="2"
                                                            autoFocus
                                                        />
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleEditMessage(message.id)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button
                                                                onClick={cancelEditing}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start gap-2">
                                                        <p className="text-gray-800 flex-1 text-sm sm:text-base wrap-break-word">{message.content}</p>
                                                        {isOwnMessage && isHovered && !message.deleted && (
                                                            <div className="flex gap-1 shrink-0">
                                                                <button
                                                                    onClick={() => startEditing(message)}
                                                                    className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded transition-colors"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteMessage(message.id)}
                                                                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ))}

                    {typingUsers.size > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 ml-14 mb-4">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                            <span>{Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...</span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="bg-white border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-4">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value)
                                handleTyping()
                            }}
                            placeholder={`Message #${channel?.name}`}
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="p-2 sm:p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                            <Send size={18} className="sm:w-5 sm:h-5" />
                        </button>
                    </form>
                </div>

                {/* Invite Modal */}
                {showInviteModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Invite to {channel?.name}</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Invite Link
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/channels/join/${channel?.inviteCode}`}
                                        readOnly
                                        className="flex-1 px-3 py-2 text-black bg-gray-50 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <button
                                        onClick={copyInviteLink}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                                {copiedInvite && (
                                    <p className="mt-2 text-sm text-green-600">Copied to clipboard!</p>
                                )}
                            </div>

                            <form onSubmit={handleInviteUser}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Or invite by username/email
                                    </label>
                                    <input
                                        type="text"
                                        value={inviteInput}
                                        onChange={(e) => setInviteInput(e.target.value)}
                                        className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="username or email"
                                    />
                                </div>
                                {inviteError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                        {inviteError}
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={inviting || !inviteInput.trim()}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {inviting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Inviting...</span>
                                            </>
                                        ) : (
                                            'Invite User'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowInviteModal(false)
                                            setInviteInput('')
                                            setInviteError('')
                                        }}
                                        disabled={inviting}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Close
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Members Modal */}
                {showMembersModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Members ({members.length})</h2>
                            <div className="max-h-96 overflow-y-auto space-y-2">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                                            {member.name?.[0]?.toUpperCase() || member.username?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{member.name || member.username}</p>
                                            <p className="text-sm text-gray-500">@{member.username}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowMembersModal(false)}
                                className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </BgLayout>
    )
}

export default ChannelDetailPage