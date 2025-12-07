'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Send, ArrowLeft, Image, Loader2, Circle, MoreVertical, Edit2, Trash2, X, Check, Phone, Video } from 'lucide-react'
import { io } from 'socket.io-client'
import { useCall } from '../../contexts/CallContext'
import BgLayout from '@/components/layout/bgLayout'

function DMPage() {
    const { startCall } = useCall()
    const params = useParams()
    const router = useRouter()
    const username = params.slug

    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [channel, setChannel] = useState(null)
    const [targetUser, setTargetUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const [isTyping, setIsTyping] = useState(false)
    const [editingMessageId, setEditingMessageId] = useState(null)
    const [editContent, setEditContent] = useState('')
    const [hoveredMessageId, setHoveredMessageId] = useState(null)

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
                const backendUrl = process.env.NEXT_PUBLIC_API_URL
                const response = await fetch(`${backendUrl}/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setCurrentUser(data.data)
                }
            } catch (error) {
                console.error('Error fetching current user:', error)
            }
        }

        fetchCurrentUser()
    }, [router])

    // Fetch messages and setup Socket.IO
    useEffect(() => {
        const fetchMessages = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            try {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL
                const response = await fetch(`${backendUrl}/messages/${username}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setChannel(data.data.channel)
                    setTargetUser(data.data.targetUser)
                    setMessages(data.data.messages)

                    // Initialize Socket.IO connection
                    socketRef.current = io(backendUrl)

                    // Join the channel room
                    socketRef.current.emit('join_channel', data.data.channel.id)

                    // Listen for new messages from other users
                    socketRef.current.on('new_message', (message) => {
                        setMessages(prev => [...prev, message])
                    })

                    // Listen for message updates
                    socketRef.current.on('message_updated', (updatedMessage) => {
                        setMessages(prev => prev.map(msg =>
                            msg.id === updatedMessage.id ? updatedMessage : msg
                        ))
                    })

                    // Listen for message deletions
                    socketRef.current.on('message_removed', ({ messageId }) => {
                        setMessages(prev => prev.map(msg =>
                            msg.id === messageId ? { ...msg, deleted: true, content: null } : msg
                        ))
                    })

                    // Listen for typing indicators
                    socketRef.current.on('user_typing', ({ username: typingUser }) => {
                        setIsTyping(true)
                    })

                    socketRef.current.on('user_stop_typing', ({ username: typingUser }) => {
                        setIsTyping(false)
                    })

                    socketRef.current.on('message_read_update', ({ messageId, userId }) => {
                        setMessages(prev => prev.map(msg =>
                            msg.id === messageId
                                ? { ...msg, readBy: [...(msg.readBy || []), userId] }
                                : msg
                        ))
                    })

                    markMessagesAsRead(data.data.channel.id, token)

                } else {
                    const data = await response.json()
                    setError(data.message || 'Failed to load messages')
                }
            } catch (error) {
                console.error('Error fetching messages:', error)
                setError('Failed to connect to server')
            } finally {
                setLoading(false)
            }
        }

        if (username) {
            fetchMessages()
        }

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
            }
        }
    }, [username, router])

    const markMessagesAsRead = async (channelId, token) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/mark-read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token || localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ channelId })
            })
        } catch (error) {
            console.error('Error marking messages as read:', error)
        }
    }

    const handleTyping = () => {
        if (channel && currentUser) {
            socketRef.current?.emit('typing', {
                channelId: channel.id,
                username: currentUser.username
            })

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }

            // Set new timeout to stop typing
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current?.emit('stop_typing', {
                    channelId: channel.id,
                    username: currentUser.username
                })
            }, 1000)
        }
    }

    const handleEditMessage = async (messageId) => {
        if (!editContent.trim()) return

        const token = localStorage.getItem('token')
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL
            const response = await fetch(`${backendUrl}/messages/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: editContent })
            })

            if (response.ok) {
                const data = await response.json()
                // Update message immediately in UI
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId ? data.data : msg
                ))
                setEditingMessageId(null)
                setEditContent('')
                // Emit to socket for other users
                socketRef.current?.emit('message_edited', {
                    channelId: channel.id,
                    message: data.data
                })
            } else {
                const data = await response.json()
                alert(data.message || 'Failed to edit message')
            }
        } catch (error) {
            console.error('Error editing message:', error)
            alert('Failed to edit message')
        }
    }

    const handleDeleteMessage = async (messageId) => {
        if (!confirm('Are you sure you want to delete this message?')) return

        const token = localStorage.getItem('token')
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL
            const response = await fetch(`${backendUrl}/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                // Update message immediately in UI
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId ? { ...msg, deleted: true, content: null } : msg
                ))
                // Emit to socket for other users
                socketRef.current?.emit('message_deleted', {
                    channelId: channel.id,
                    messageId
                })
            } else {
                const data = await response.json()
                alert(data.message || 'Failed to delete message')
            }
        } catch (error) {
            console.error('Error deleting message:', error)
            alert('Failed to delete message')
        }
    }

    const startEditing = (message) => {
        setEditingMessageId(message.id)
        setEditContent(message.content || '')
    }

    const cancelEditing = () => {
        setEditingMessageId(null)
        setEditContent('')
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()

        if (!newMessage.trim() || !channel) return

        setSending(true)
        const token = localStorage.getItem('token')

        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL
            const response = await fetch(`${backendUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    channelId: channel.id,
                    content: newMessage
                })
            })

            if (response.ok) {
                const data = await response.json()
                // Add message immediately to UI
                setMessages(prev => [...prev, data.data])
                setNewMessage('')
                // Emit to socket for other users
                socketRef.current?.emit('new_message_broadcast', {
                    channelId: channel.id,
                    message: data.data
                })
            } else {
                const data = await response.json()
                alert(data.message || 'Failed to send message')
            }
        } catch (error) {
            console.error('Error sending message:', error)
            alert('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return 'Today'
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday'
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading messages...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <BgLayout>
            <main className="min-h-[93vh] flex flex-col bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                {targetUser?.avatarUrl ? (
                                    <img
                                        src={targetUser.avatarUrl}
                                        alt={targetUser.name || targetUser.username}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    targetUser?.username.charAt(0).toUpperCase()
                                )}
                            </div>
                            {targetUser?.lastActiveAt && new Date(targetUser.lastActiveAt) > new Date(Date.now() - 5 * 60 * 1000) && (
                                <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
                            )}
                        </div>

                        <div>
                            <h1 className="font-semibold text-gray-900">
                                {targetUser?.name || targetUser?.username}
                            </h1>
                            {targetUser?.name && (
                                <p className="text-sm text-gray-500">@{targetUser.username}</p>
                            )}
                        </div>
                    </div>

                    {/* Call buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => startCall(channel.id, targetUser.id, targetUser.name || targetUser.username, 'audio')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Voice call"
                        >
                            <Phone className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={() => startCall(channel.id, targetUser.id, targetUser.name || targetUser.username, 'video')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Video call"
                        >
                            <Video className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-13rem)] p-4 space-y-4">
                    {messages.map((message, index) => {
                        const isOwnMessage = message.senderId === currentUser?.id
                        const showDate = index === 0 ||
                            formatDate(messages[index - 1].sentAt) !== formatDate(message.sentAt)

                        return (
                            <div key={message.id}>
                                {showDate && (
                                    <div className="flex justify-center my-4">
                                        <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                            {formatDate(message.sentAt)}
                                        </span>
                                    </div>
                                )}

                                <div
                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
                                    onMouseEnter={() => setHoveredMessageId(message.id)}
                                    onMouseLeave={() => setHoveredMessageId(null)}
                                >
                                    <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'} relative`}>
                                        {editingMessageId === message.id ? (
                                            // Edit mode
                                            <div className="bg-white border-2 border-blue-500 rounded-2xl p-3">
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="w-full px-2 py-1 border-none focus:outline-none text-gray-900 resize-none"
                                                    rows={3}
                                                    autoFocus
                                                />
                                                <div className="flex gap-2 mt-2 justify-end">
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditMessage(message.id)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                        disabled={!editContent.trim()}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // Normal message display
                                            <>
                                                <div className={`rounded-2xl px-4 py-2 ${isOwnMessage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-900 border border-gray-200'
                                                    }`}>
                                                    {message.deleted ? (
                                                        <p className="italic opacity-60">This message was deleted</p>
                                                    ) : (
                                                        <>
                                                            {message.content && <p className="wrap-break-word">{message.content}</p>}
                                                            {message.mediaUrl && (
                                                                <img
                                                                    src={message.mediaUrl}
                                                                    alt="Message media"
                                                                    className="mt-2 rounded-lg max-w-full"
                                                                />
                                                            )}
                                                            {message.updatedAt && message.updatedAt !== message.sentAt && (
                                                                <p className="text-xs opacity-70 mt-1">(edited)</p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                {/* Action buttons */}
                                                {isOwnMessage && !message.deleted && hoveredMessageId === message.id && (
                                                    <div className="absolute -top-3 right-0 bg-white border border-gray-200 rounded-lg shadow-lg flex gap-1 p-1">
                                                        <button
                                                            onClick={() => startEditing(message)}
                                                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                                            title="Edit message"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMessage(message.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                            title="Delete message"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                                            {formatTime(message.sentAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-gray-200 rounded-2xl px-4 py-3">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value)
                                handleTyping()
                            }}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-gray-900"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {sending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </BgLayout>
    )
}

export default DMPage